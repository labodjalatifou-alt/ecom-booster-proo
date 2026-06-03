import { NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

export async function POST(req: Request) {
  try {
    const { image } = await req.json(); // Wait, let's receive image as base64 string

    if (!image) {
      return NextResponse.json({ error: 'Image manquante' }, { status: 400 });
    }

    if (!process.env.FAL_KEY) {
      return NextResponse.json({ error: 'Clé API Fal manquante' }, { status: 500 });
    }

    // Call Fal.ai background removal model
    const result = await fal.subscribe("fal-ai/bria/background/remove", {
      input: {
        image_url: image
      },
      logs: true,
    }) as any;

    if (result && result.image && result.image.url) {
       // Return the URL of the transparent image
       return NextResponse.json({ image: result.image.url });
    } else {
       throw new Error("Format de réponse inattendu de Fal API");
    }

  } catch (error: any) {
    console.error('Erreur détourage Fal:', error);
    return NextResponse.json({ error: 'Erreur lors du détourage', details: error.message }, { status: 500 });
  }
}
