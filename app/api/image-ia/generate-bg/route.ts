import { NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt manquant' }, { status: 400 });
    }

    if (!process.env.FAL_KEY) {
      return NextResponse.json({ error: 'Clé API Fal manquante' }, { status: 500 });
    }

    // Call Fal.ai FLUX schnell model
    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: prompt,
        image_size: "square_hd",
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: false
      },
      logs: true,
    }) as any;

    if (result && result.images && result.images.length > 0) {
      return NextResponse.json({ image: result.images[0].url });
    } else {
      throw new Error("Format de réponse inattendu de Fal API");
    }

  } catch (error: any) {
    console.error('Erreur génération décor Fal:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération', details: error.message }, { status: 500 });
  }
}
