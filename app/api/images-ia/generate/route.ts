import { NextRequest } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase';
import { generateImageToImage, removeBackgroundAPI } from '@/lib/image-generation/fal-client';
import { addSideAdvantages, addLeftAdvantages } from '@/lib/image-generation/canvas-utils';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const PURE_WHITE_PROMPT = `Premium product photography, the exact same product from the reference image,
perfectly centered in frame, pure white background, professional studio lighting,
product occupies center 40% of the image, equal empty white space on left and right sides,
sharp edges, ultra clean, high-end cosmetic/product brand style,
no text, no graphics, no watermark, 8K resolution, photorealistic`;

const LEFT_WHITE_PROMPT = `Premium product photography, the exact same product from the reference image,
positioned on the RIGHT side of the frame, occupying right 45% of image,
LEFT side is clean empty white space for text,
pure white background, professional studio lighting,
sharp product, high-end brand photography, no text, no watermark,
8K resolution, photorealistic`;

async function uploadToSupabase(buffer: Buffer, fileName: string, contentType: string): Promise<string> {
  const supabase = createAdminSupabase();
  const { error } = await supabase.storage.from('images-ia').upload(fileName, buffer, {
    contentType,
    upsert: true,
  });
  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error(`Erreur d'upload vers Supabase: ${error.message}`);
  }
  const { data } = supabase.storage.from('images-ia').getPublicUrl(fileName);
  return data.publicUrl;
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const body = await req.json();
        const { productName, productDescription, productImageBase64 } = body;

        if (!productImageBase64) throw new Error("Image source manquante");
        if (!productName || !productDescription) throw new Error("Nom et description requis");

        // 1. Upload source image to Supabase
        sendEvent({ status: 'Upload de l\'image source...', progress: 5 });
        const sourceBuffer = Buffer.from(productImageBase64.split(',')[1], 'base64');
        const sourceUrl = await uploadToSupabase(sourceBuffer, `source_${Date.now()}.png`, 'image/png');

        // 2. Generate advantages with Claude
        sendEvent({ status: 'Génération des avantages marketing avec Claude...', progress: 10 });
        const claudePrompt = `Génère exactement 5 avantages marketing pour ce produit :\nNom : ${productName}\nDescription : ${productDescription}\n\nRetourne UNIQUEMENT ce JSON :\n{\n  "advantages": [\n    "Avantage 1 (max 4 mots)",\n    "Avantage 2 (max 4 mots)",\n    "Avantage 3 (max 4 mots)",\n    "Avantage 4 (max 4 mots)",\n    "Avantage 5 (max 4 mots)"\n  ]\n}`;
        
        const claudeRes = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 300,
          system: "Tu es un expert en marketing e-commerce pour le marché africain francophone. Tu génères des avantages produit courts, percutants, en bon français. Tu réponds UNIQUEMENT avec un JSON valide, aucun texte avant ou après.",
          messages: [{ role: 'user', content: claudePrompt }]
        });
        
        const claudeText = (claudeRes.content[0] as any).text;
        let advantages: string[] = [];
        try {
          advantages = JSON.parse(claudeText.trim()).advantages;
        } catch (e) {
          console.error("Erreur de parsing JSON Claude:", claudeText);
          advantages = ["Qualité Premium", "Design Élégant", "Facile d'utilisation", "Durable", "Innovant"];
        }

        // 3. Image 1: Fond blanc pur (Remove.bg)
        sendEvent({ status: 'Génération Image 1/7 : Fond Blanc Pur...', progress: 20 });
        const img1Buffer = await removeBackgroundAPI(productImageBase64);
        const img1Url = await uploadToSupabase(img1Buffer, `img1_${Date.now()}.png`, 'image/png');
        sendEvent({ image: { id: 'img1', label: 'Fond Blanc Pur', url: img1Url } });

        // 4. Image 2: Décor Studio Couleur Dominante
        sendEvent({ status: 'Génération Image 2/7 : Décor Studio...', progress: 35 });
        const promptStudio = "Ultra high-end product photography, the exact same product from the reference image, placed on a minimalist studio podium, background color matches the product dominant color, soft gradient backdrop, professional studio lighting with subtle shadows, shot with 85mm lens, shallow depth of field, luxury brand aesthetic, white podium or colored surface matching product, 8K resolution, clean sharp product edges, no text, no watermark, photorealistic";
        const negStudio = "blurry, pixelated, distorted product, changed product, different product, text, watermark, cartoon, illustration, low quality, noise";
        const img2Url = await generateImageToImage(sourceUrl, promptStudio, negStudio);
        sendEvent({ image: { id: 'img2', label: 'Décor Studio', url: img2Url } });

        // 5. Image 3: Décor Lifestyle Élégant
        sendEvent({ status: 'Génération Image 3/7 : Lifestyle Élégant...', progress: 50 });
        const promptLifestyle = "Luxury lifestyle product photography, the exact same product from the reference image, elegantly placed in a beautiful lifestyle scene, warm natural lighting, premium interior setting with tasteful props that complement the product, marble surface or wooden table, soft bokeh background, shot on Phase One camera, editorial magazine quality, product is sharp and central focus, colors are rich and vivid, luxury brand campaign style, no text, no watermark, photorealistic, 8K";
        const negLifestyle = "blurry, pixelated, distorted, changed product, text, watermark, cartoon, cheap looking, overexposed, low quality";
        const img3Url = await generateImageToImage(sourceUrl, promptLifestyle, negLifestyle);
        sendEvent({ image: { id: 'img3', label: 'Lifestyle Élégant', url: img3Url } });

        // 6. Image 4: Avantages Gauche et Droite
        sendEvent({ status: 'Génération Image 4/7 : Base Avantages Gauche/Droite...', progress: 60 });
        const img4BaseUrl = await generateImageToImage(sourceUrl, PURE_WHITE_PROMPT, "blurry, low quality, text, watermark");
        
        sendEvent({ status: 'Superposition du texte sur Image 4...', progress: 65 });
        const img4BaseRes = await fetch(img4BaseUrl);
        const img4BaseBuffer = Buffer.from(await img4BaseRes.arrayBuffer());
        const img4FinalBuffer = await addSideAdvantages(img4BaseBuffer, advantages);
        const img4FinalUrl = await uploadToSupabase(img4FinalBuffer, `img4_${Date.now()}.png`, 'image/png');
        sendEvent({ image: { id: 'img4', label: 'Avantages Produit', url: img4FinalUrl } });

        // 7. Image 5: Produit à Droite, Avantages à Gauche
        sendEvent({ status: 'Génération Image 5/7 : Base Avantages Liste...', progress: 75 });
        const img5BaseUrl = await generateImageToImage(sourceUrl, LEFT_WHITE_PROMPT, "blurry, low quality, text, watermark");
        
        sendEvent({ status: 'Superposition du texte sur Image 5...', progress: 80 });
        const img5BaseRes = await fetch(img5BaseUrl);
        const img5BaseBuffer = Buffer.from(await img5BaseRes.arrayBuffer());
        const img5FinalBuffer = await addLeftAdvantages(img5BaseBuffer, advantages, productName);
        const img5FinalUrl = await uploadToSupabase(img5FinalBuffer, `img5_${Date.now()}.png`, 'image/png');
        sendEvent({ image: { id: 'img5', label: 'Avantages Liste', url: img5FinalUrl } });

        // 8. Image 6: Produit en Action Scène 1
        sendEvent({ status: 'Génération Image 6/7 : Action Scène 1...', progress: 85 });
        const promptAction1 = "Authentic lifestyle photography, a young West African woman in her late 20s, natural beautiful appearance, using or holding the exact same product from reference image, modern African urban apartment, warm golden hour lighting through window, candid natural moment, genuine smile, product clearly visible and identifiable, skin tones warm and natural, editorial magazine quality, shot on Sony A7R, 85mm lens, f/1.8 aperture, bokeh background, no text, no watermark, ultra realistic, 8K";
        const negAction1 = "blurry, distorted face, changed product, different product, text, watermark, cartoon, overexposed, artificial looking";
        const img6Url = await generateImageToImage(sourceUrl, promptAction1, negAction1);
        sendEvent({ image: { id: 'img6', label: 'En Action - Scène 1', url: img6Url } });

        // 9. Image 7: Produit en Action Scène 2
        sendEvent({ status: 'Génération Image 7/7 : Action Scène 2...', progress: 95 });
        const promptAction2 = "Premium brand campaign photography, the exact same product from reference image, displayed in an elegant flat lay composition, marble or textured surface, surrounded by complementary luxury props (flowers, fabric, accessories), overhead shot from above, perfect symmetry, rich vivid colors, professional color grading, luxury brand Instagram aesthetic, Chanel/Dior campaign quality, no text, no watermark, ultra sharp, 8K resolution, photorealistic";
        const negAction2 = "blurry, pixelated, low quality, text, watermark, cartoon, cheap";
        const img7Url = await generateImageToImage(sourceUrl, promptAction2, negAction2);
        sendEvent({ image: { id: 'img7', label: 'Flat Lay Premium', url: img7Url } });

        sendEvent({ status: 'Terminé !', progress: 100 });
        controller.close();
      } catch (err: any) {
        console.error('Erreur Génération IA:', err);
        sendEvent({ error: err.message || 'Erreur inconnue' });
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
