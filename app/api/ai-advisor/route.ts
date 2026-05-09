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

    // Liste des modèles à essayer par ordre de priorité
    const models = [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-sonnet-20240620',
      'claude-3-haiku-20240307'
    ];

    let lastError = null;
    
    for (const model of models) {
      try {
        const message = await anthropic.messages.create({
          model: model,
          max_tokens: 1024,
          system: "Tu es l'expert stratégique d'Ecom Booster Pro, spécialiste du E-commerce en Afrique de l'Ouest. Ton rôle est d'analyser les produits et les données de vente pour maximiser les profits. Tu maîtrises le neuromarketing et les spécificités du Cash on Delivery. Réponds toujours de manière structurée et actionnable.",
          messages: [{ role: 'user', content: prompt }],
        });

        // @ts-ignore
        return NextResponse.json({ text: message.content[0].text });
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed:`, err.message);
        if (err.status !== 404) break; // If it's not a 404, the error might be key-related, so stop.
      }
    }

    throw lastError || new Error("Tous les modèles ont échoué.");

  } catch (error: any) {
    console.error('[ai-advisor] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
