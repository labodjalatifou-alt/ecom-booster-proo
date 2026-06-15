import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase';
import { generateImageToImage, removeBackgroundAPI } from '@/lib/image-generation/fal-client';
import Anthropic from '@anthropic-ai/sdk';

// Mark as max duration to avoid timeout on Vercel Pro
export const maxDuration = 300;

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
    throw new Error(`Erreur Supabase upload: ${error.message}`);
  }
  const { data } = supabase.storage.from('images-ia').getPublicUrl(fileName);
  return data.publicUrl;
}

async function addSideAdvantagesCanvas(imageBuffer: Buffer, advantages: string[]): Promise<Buffer> {
  // Dynamic import to avoid build issues
  const { createCanvas, loadImage } = await import('canvas');
  const size = 1000;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, size, size);

  const img = await loadImage(imageBuffer);
  ctx.drawImage(img as any, 300, 300, 400, 400);

  const leftAdvantages = advantages.slice(0, 2);
  const rightAdvantages = advantages.slice(2, 5);

  const drawAdvantage = (text: string, x: number, y: number, color: string) => {
    const bubbleW = 220;
    const bubbleH = 60;
    ctx.beginPath();
    ctx.roundRect(x - bubbleW / 2, y - bubbleH / 2, bubbleW, bubbleH, 30);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('✓ ' + text, x, y + 7);
  };

  const colors = ['#6C63FF', '#FF6584', '#43C6AC', '#F7971E', '#2193b0'];
  leftAdvantages.forEach((adv, i) => drawAdvantage(adv, 145, 380 + i * 120, colors[i]));
  rightAdvantages.forEach((adv, i) => drawAdvantage(adv, 855, 320 + i * 120, colors[i + 2]));

  return canvas.toBuffer('image/png');
}

async function addLeftAdvantagesCanvas(imageBuffer: Buffer, advantages: string[], productName: string): Promise<Buffer> {
  const { createCanvas, loadImage } = await import('canvas');
  const size = 1000;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 1000, 1000);
  gradient.addColorStop(0, '#F8F9FF');
  gradient.addColorStop(1, '#FFFFFF');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const img = await loadImage(imageBuffer);
  ctx.drawImage(img as any, 520, 150, 450, 700);

  ctx.fillStyle = '#1A1A2E';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(productName.toUpperCase().slice(0, 20), 40, 120);

  ctx.fillStyle = '#6C63FF';
  ctx.fillRect(40, 135, 80, 4);

  advantages.forEach((adv, i) => {
    const y = 220 + i * 110;
    ctx.beginPath();
    ctx.arc(65, y, 28, 0, Math.PI * 2);
    ctx.fillStyle = ['#6C63FF', '#FF6584', '#43C6AC', '#F7971E', '#2193b0'][i];
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(String(i + 1), 65, y + 8);
    ctx.fillStyle = '#2D2D2D';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(adv.slice(0, 22), 105, y + 8);
  });

  return canvas.toBuffer('image/png');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productName, productDescription, productImageBase64 } = body;

    if (!productImageBase64) return NextResponse.json({ error: "Image manquante" }, { status: 400 });
    if (!productName || !productDescription) return NextResponse.json({ error: "Nom et description requis" }, { status: 400 });

    const images: { id: string; label: string; url: string }[] = [];
    const errors: string[] = [];

    // 1. Upload source image
    const sourceBuffer = Buffer.from(productImageBase64.split(',')[1], 'base64');
    const sourceUrl = await uploadToSupabase(sourceBuffer, `source_${Date.now()}.png`, 'image/png');

    // 2. Generate advantages with Claude
    const claudeRes = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 300,
      system: "Tu es un expert en marketing e-commerce pour le marché africain francophone. Tu génères des avantages produit courts, percutants, en bon français. Tu réponds UNIQUEMENT avec un JSON valide, aucun texte avant ou après.",
      messages: [{
        role: 'user',
        content: `Génère exactement 5 avantages marketing pour ce produit :\nNom : ${productName}\nDescription : ${productDescription}\n\nRetourne UNIQUEMENT ce JSON :\n{\n  "advantages": ["Avantage 1 (max 4 mots)", "Avantage 2", "Avantage 3", "Avantage 4", "Avantage 5"]\n}`
      }]
    });

    let advantages: string[] = ["Qualité Premium", "Design Élégant", "Facile à utiliser", "Durable", "Innovant"];
    try {
      let rawText = (claudeRes.content[0] as any).text.trim();
      // Strip markdown code fences (claude-sonnet-4-5 wraps JSON in ```json...```)
      rawText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
      const parsed = JSON.parse(rawText);
      if (parsed.advantages?.length) advantages = parsed.advantages;
    } catch (e) {
      console.error("Claude JSON parse error for advantages:", e);
    }

    // IMAGE 1: Fond blanc (remove.bg)
    try {
      const img1Buffer = await removeBackgroundAPI(productImageBase64);
      const img1Url = await uploadToSupabase(img1Buffer, `img1_${Date.now()}.png`, 'image/png');
      images.push({ id: 'img1', label: 'Fond Blanc Pur', url: img1Url });
    } catch (e: any) {
      console.error('Image 1 error:', e.message);
      errors.push(`Img1 (RemoveBG): ${e.message}`);
    }

    // IMAGE 2: Décor Studio
    try {
      const url = await generateImageToImage(
        sourceUrl,
        "Ultra high-end product photography, the exact same product from the reference image, placed on a minimalist studio podium, background color matches the product dominant color, soft gradient backdrop, professional studio lighting with subtle shadows, shot with 85mm lens, shallow depth of field, luxury brand aesthetic, 8K resolution, clean sharp product edges, no text, no watermark, photorealistic",
        "blurry, pixelated, distorted product, changed product, text, watermark, cartoon, low quality"
      );
      images.push({ id: 'img2', label: 'Décor Studio', url });
    } catch (e: any) {
      console.error('Image 2 error:', e.message);
      errors.push(`Img2: ${e.message}`);
    }

    // IMAGE 3: Lifestyle
    try {
      const url = await generateImageToImage(
        sourceUrl,
        "Luxury lifestyle product photography, the exact same product from the reference image, elegantly placed in a beautiful lifestyle scene, warm natural lighting, premium interior setting, marble surface or wooden table, soft bokeh background, editorial magazine quality, product is sharp and central focus, luxury brand campaign style, no text, no watermark, photorealistic, 8K",
        "blurry, pixelated, distorted, changed product, text, watermark, cartoon, cheap looking"
      );
      images.push({ id: 'img3', label: 'Lifestyle Élégant', url });
    } catch (e: any) {
      console.error('Image 3 error:', e.message);
      errors.push(`Img3: ${e.message}`);
    }

    // IMAGE 4: Avantages Gauche/Droite (canvas)
    try {
      const baseUrl = await generateImageToImage(sourceUrl, PURE_WHITE_PROMPT, "blurry, low quality, text, watermark");
      const baseRes = await fetch(baseUrl);
      const baseBuffer = Buffer.from(await baseRes.arrayBuffer());
      const finalBuffer = await addSideAdvantagesCanvas(baseBuffer, advantages);
      const finalUrl = await uploadToSupabase(finalBuffer, `img4_${Date.now()}.png`, 'image/png');
      images.push({ id: 'img4', label: 'Avantages Produit', url: finalUrl });
    } catch (e: any) {
      console.error('Image 4 error:', e.message);
      errors.push(`Img4: ${e.message}`);
    }

    // IMAGE 5: Avantages Liste Gauche (canvas)
    try {
      const baseUrl = await generateImageToImage(sourceUrl, LEFT_WHITE_PROMPT, "blurry, low quality, text, watermark");
      const baseRes = await fetch(baseUrl);
      const baseBuffer = Buffer.from(await baseRes.arrayBuffer());
      const finalBuffer = await addLeftAdvantagesCanvas(baseBuffer, advantages, productName);
      const finalUrl = await uploadToSupabase(finalBuffer, `img5_${Date.now()}.png`, 'image/png');
      images.push({ id: 'img5', label: 'Avantages Liste', url: finalUrl });
    } catch (e: any) {
      console.error('Image 5 error:', e.message);
      errors.push(`Img5: ${e.message}`);
    }

    // IMAGE 6: En action scène 1
    try {
      const url = await generateImageToImage(
        sourceUrl,
        "Authentic lifestyle photography, a young West African woman in her late 20s, natural beautiful appearance, using or holding the exact same product from reference image, modern African urban apartment, warm golden hour lighting through window, candid natural moment, genuine smile, product clearly visible, editorial magazine quality, bokeh background, no text, no watermark, ultra realistic, 8K",
        "blurry, distorted face, changed product, text, watermark, cartoon, overexposed"
      );
      images.push({ id: 'img6', label: 'En Action - Scène 1', url });
    } catch (e: any) {
      console.error('Image 6 error:', e.message);
      errors.push(`Img6: ${e.message}`);
    }

    // IMAGE 7: Flat lay
    try {
      const url = await generateImageToImage(
        sourceUrl,
        "Premium brand campaign photography, the exact same product from reference image, displayed in an elegant flat lay composition, marble or textured surface, surrounded by complementary luxury props, overhead shot from above, perfect symmetry, rich vivid colors, professional color grading, luxury brand Instagram aesthetic, no text, no watermark, ultra sharp, 8K resolution, photorealistic",
        "blurry, pixelated, low quality, text, watermark, cartoon, cheap"
      );
      images.push({ id: 'img7', label: 'Flat Lay Premium', url });
    } catch (e: any) {
      console.error('Image 7 error:', e.message);
      errors.push(`Img7: ${e.message}`);
    }

    if (images.length === 0) {
      return NextResponse.json({ error: "Toutes les générations ont échoué. Détails: " + errors.join(' | ') }, { status: 500 });
    }

    return NextResponse.json({ success: true, images, advantages, partialErrors: errors });

  } catch (err: any) {
    console.error('Generate error:', err);
    return NextResponse.json({ error: err.message || 'Erreur inconnue' }, { status: 500 });
  }
}
