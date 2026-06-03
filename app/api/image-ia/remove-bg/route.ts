import { NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json({ error: 'Image manquante' }, { status: 400 });
    }

    if (!process.env.HUGGINGFACE_API_KEY) {
      return NextResponse.json({ error: 'Clé API Hugging Face manquante' }, { status: 500 });
    }

    const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

    const imageBlob = new Blob([await imageFile.arrayBuffer()], { type: imageFile.type });

    // Use BRIA RMBG model for background removal - very high quality
    const result = await hf.imageSegmentation({
      model: 'briaai/RMBG-1.4',
      data: imageBlob,
    });

    // Convert result to PNG with transparency
    // The model returns segmentation masks - we process them to create transparent PNG
    const buffer = Buffer.from(await (result as unknown as Blob).arrayBuffer?.() ?? new ArrayBuffer(0));
    
    if (buffer.length === 0) {
      // Fallback: use RMBG via imageToImage pipeline
      const resultBlob = await hf.imageToImage({
        model: 'briaai/RMBG-1.4',
        inputs: imageBlob,
      });
      const buf = Buffer.from(await resultBlob.arrayBuffer());
      const base64 = buf.toString('base64');
      return NextResponse.json({ image: `data:image/png;base64,${base64}` });
    }

    const base64 = buffer.toString('base64');
    return NextResponse.json({ image: `data:image/png;base64,${base64}` });

  } catch (error: any) {
    console.error('Erreur détourage HF:', error);
    return NextResponse.json({ error: 'Erreur lors du détourage', details: error.message }, { status: 500 });
  }
}
