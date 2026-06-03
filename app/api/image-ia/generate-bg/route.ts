import { NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!process.env.HUGGINGFACE_API_KEY) {
      return NextResponse.json(
        { error: 'Clé API Hugging Face manquante. Veuillez vérifier votre fichier .env.local' },
        { status: 500 }
      );
    }

    const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

    // Call FLUX.1-schnell model for high quality product backgrounds
    const blob = await hf.textToImage({
      inputs: prompt,
      model: 'black-forest-labs/FLUX.1-schnell',
      parameters: {
        num_inference_steps: 4, // FLUX.1-schnell is optimized for 4 steps
        width: 1024,
        height: 1024,
      }
    });

    // Convert blob to base64
    const buffer = Buffer.from(await blob.arrayBuffer());
    const base64 = buffer.toString('base64');
    const mimeType = blob.type;

    return NextResponse.json({
      image: `data:${mimeType};base64,${base64}`
    });

  } catch (error: any) {
    console.error('Erreur API Hugging Face:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du décor' },
      { status: 500 }
    );
  }
}
