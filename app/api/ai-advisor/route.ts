import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Clé API Anthropic manquante" }, { status: 500 });
    }

    console.log("=== AI ADVISOR ENDPOINT TRIGGERED ===");

    // Try models in order of preference - using direct HTTP to avoid SDK version issues
    const models = [
      'claude-sonnet-4-20250514',
      'claude-3-5-sonnet-20241022',
      'claude-3-haiku-20240307',
    ];

    let lastErrorDetail = "";
    
    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`);
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: model,
            max_tokens: 4096,
            system: "Tu es l'expert stratégique d'Ecom Booster Pro spécialisé dans le marché Africain. Analyse le produit et réponds EXCLUSIVEMENT en JSON valide suivant la structure exacte demandée par l'utilisateur. Ne fournis aucune explication avant ou après le JSON.",
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`Model ${model} HTTP ${response.status}:`, errText);
          lastErrorDetail = `${model}: HTTP ${response.status}`;
          
          // If auth error, no point trying other models
          if (response.status === 401) break;
          continue;
        }

        const data = await response.json();
        const text = data.content?.[0]?.text || '';
        
        // Robust JSON extraction
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : text;

        console.log(`✅ Success with model: ${model}`);
        return NextResponse.json({ text: cleanJson, model_used: model });
        
      } catch (err: any) {
        lastErrorDetail = err.message;
        console.warn(`Model ${model} exception:`, err.message);
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
