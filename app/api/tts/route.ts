import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, languageCode, name } = body;

    if (!text) {
      return NextResponse.json({ error: 'Texte manquant' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Clé API Google Cloud TTS manquante. Veuillez configurer GOOGLE_CLOUD_TTS_API_KEY.' 
      }, { status: 500 });
    }

    // Appel à l'API Google Cloud TTS REST
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: languageCode || 'fr-FR',
          name: name || 'fr-FR-Neural2-B', // Voix homme très réaliste par défaut
        },
        audioConfig: {
          audioEncoding: 'MP3',
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Cloud TTS Error:', errorData);
      return NextResponse.json({ error: 'Erreur lors de la génération audio avec Google Cloud' }, { status: response.status });
    }

    const data = await response.json();
    
    // Google Cloud retourne l'audio en base64 dans la propriété audioContent
    return NextResponse.json({ audioContent: data.audioContent });

  } catch (error: any) {
    console.error('Erreur inattendue API TTS:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
