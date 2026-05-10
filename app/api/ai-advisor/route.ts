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

    // Liste mise à jour pour Mai 2026 avec les IDs complets
    const models = [
      'claude-3-5-sonnet-20241022',
      'claude-3-7-sonnet-20250219',
      'claude-4-6-sonnet-20260217',
      'claude-4-7-opus-20260416'
    ];
    
    console.log("=== AI ADVISOR ENDPOINT TRIGGERED ===");
    console.log("Models to try:", models);

    let lastErrorDetail = "";
    
    // On essaie d'abord les modèles les plus récents (on inverse la liste pour tester les 4.x d'abord)
    const priorityModels = [...models].reverse();

    for (const model of priorityModels) {
      try {
        const message = await anthropic.messages.create({
          model: model,
          max_tokens: 4096, // Augmenté pour des réponses JSON complètes
          system: "Tu es l'expert stratégique d'Ecom Booster Pro spécialisé dans le marché Africain. Analyse le produit et réponds EXCLUSIVEMENT en JSON valide. Ne fournis aucune explication avant ou après le JSON.",
          messages: [{ role: 'user', content: prompt }],
        });

        // @ts-ignore
        return NextResponse.json({ text: message.content[0].text, model_used: model });
      } catch (err: any) {
        lastErrorDetail = err.message;
        console.warn(`Model ${model} failed:`, err.message);
        // Si c'est une erreur d'authentification, on arrête tout de suite
        if (err.status === 401) break;
        continue;
      }
    }

    return NextResponse.json({ 
      error: "Échec de l'IA sur tous les modèles.", 
      detail: lastErrorDetail,
      suggestion: "Vérifiez vos crédits Anthropic ou la validité de votre clé API."
    }, { status: 500 });

  } catch (error: any) {
    console.error('[ai-advisor] Global Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
