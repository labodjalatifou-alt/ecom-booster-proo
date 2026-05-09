import { Anthropic } from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "Clé API Anthropic manquante" }, { status: 500 });
    }

    // Liste élargie incluant les modèles legacy pour les comptes restreints
    const models = [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-sonnet-20240620',
      'claude-3-haiku-20240307',
      'claude-2.1',
      'claude-instant-1.2'
    ];

    let lastError = null;
    
    for (const model of models) {
      try {
        const message = await anthropic.messages.create({
          model: model,
          max_tokens: 1024,
          system: "Tu es l'expert stratégique d'Ecom Booster Pro. Analyse le produit et réponds en JSON valide.",
          messages: [{ role: 'user', content: prompt }],
        });

        // @ts-ignore
        return NextResponse.json({ text: message.content[0].text });
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed:`, err.message);
        // Si c'est une erreur de permission ou de quota, on essaie quand même le suivant
        continue;
      }
    }

    throw lastError || new Error("Tous les modèles (nouveaux et anciens) ont échoué. Vérifiez vos crédits Anthropic.");

  } catch (error: any) {
    console.error('[ai-advisor] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
