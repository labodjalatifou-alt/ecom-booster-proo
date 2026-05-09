import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/lib/supabase';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { prompt, contextType } = await req.json();

    // 1. Récupérer du contexte réel de Supabase si nécessaire
    let businessContext = "";
    if (contextType === 'sales_analysis') {
      const { data: orders } = await supabase.from('orders').select('*').limit(100);
      businessContext = `Voici les 100 dernières commandes : ${JSON.stringify(orders)}`;
    }

    // 2. Appeler Claude
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1024,
      system: "Tu es l'expert stratégique d'Ecom Booster Pro. Ton rôle est d'analyser les données de vente en Afrique (Abidjan, Dakar, Conakry) et de donner des conseils concrets pour augmenter le taux de livraison et les ventes. Sois concis, professionnel et motivant.",
      messages: [
        { role: 'user', content: `${businessContext}\n\nQuestion de l'utilisateur : ${prompt}` }
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : "Désolé, je n'ai pas pu générer de réponse.";

    return NextResponse.json({ text: responseText });
  } catch (error: any) {
    console.error('Claude API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
