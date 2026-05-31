import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, voice } = body;

    if (!text) {
      return NextResponse.json({ error: 'Texte manquant' }, { status: 400 });
    }

    // Appel à l'API publique non officielle pour les voix TikTok
    // Pas besoin de clé API pour ce service communautaire
    const response = await fetch('https://tiktok-tts.weilnet.workers.dev/api/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice: voice || 'fr_001', // fr_001 = Homme, fr_002 = Femme
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Erreur réseau lors de la génération' }, { status: response.status });
    }

    const data = await response.json();
    
    if (!data.success) {
      return NextResponse.json({ error: data.error || 'Erreur lors de la génération de la voix' }, { status: 500 });
    }

    // L'API renvoie les données directement en base64
    return NextResponse.json({ audioContent: data.data });

  } catch (error: any) {
    console.error('Erreur inattendue API TTS:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
