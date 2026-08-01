/**
 * Gestionnaire IA pour le bot Telegram
 * Utilise Claude pour comprendre les questions en langage naturel
 * et requête Supabase pour répondre avec les vraies données
 */

import { createAdminSupabase } from '@/lib/supabase';
import Anthropic from '@anthropic-ai/sdk';

const supabase = createAdminSupabase();

// ---- Fonctions de requête Supabase ----

async function getOrderStats(days: number) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data } = await supabase
    .from('orders')
    .select('status, price, currency, created_at')
    .gte('created_at', since.toISOString());
  return data || [];
}

async function getAllTimeStats() {
  const { data } = await supabase
    .from('orders')
    .select('status, price, currency, created_at');
  return data || [];
}

async function searchClientOrders(name: string) {
  const { data } = await supabase
    .from('orders')
    .select('id, customer, phone, city, address, product, price, currency, status, created_at, delivered_at')
    .ilike('customer', `%${name}%`)
    .order('created_at', { ascending: false })
    .limit(20);
  return data || [];
}

async function getRecentOrders(limit: number = 10) {
  const { data } = await supabase
    .from('orders')
    .select('id, customer, city, product, price, currency, status, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}

async function getOrdersByStatus(status: string) {
  const { data } = await supabase
    .from('orders')
    .select('id, customer, phone, city, product, price, currency, created_at')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(30);
  return data || [];
}

// ---- Analyse de l'intention ----

function buildSystemPrompt(dbSummary: string): string {
  return `Tu es l'assistant intelligent du tableau de bord EcomDash. Tu aides un administrateur e-commerce à analyser ses données.

DONNÉES DISPONIBLES ACTUELLEMENT:
${dbSummary}

RÈGLES:
- Réponds TOUJOURS en français
- Sois concis et direct, utilise des chiffres précis
- Utilise des emojis pour rendre la réponse lisible sur mobile
- Si tu calcules un CA, précise la devise (XOF ou FCFA)
- Pour les clients, liste leurs commandes avec dates et montants
- Si tu ne sais pas, propose la commande slash appropriée
- Taux de livraison = (Livré / Total) × 100
- Ne mentionne jamais Claude ou l'IA dans tes réponses
- Termine toujours par une question ou suggestion d'action utile`;
}

function calcStats(orders: any[]) {
  const total = orders.length;
  const byStatus: Record<string, number> = {};
  let revenue = 0;
  for (const o of orders) {
    byStatus[o.status] = (byStatus[o.status] || 0) + 1;
    if (o.status === 'Livré') revenue += parseInt(o.price) || 0;
  }
  const currency = orders[0]?.currency || 'XOF';
  const deliveryRate = total > 0 ? Math.round(((byStatus['Livré'] || 0) / total) * 100) : 0;
  return { total, byStatus, revenue, currency, deliveryRate };
}

// ---- Point d'entrée principal ----

export async function handleAIMessage(userMessage: string): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const lowerMsg = userMessage.toLowerCase();

  // Déterminer quelles données charger selon la question
  let dbSummary = '';
  let contextData: any = {};

  try {
    // Recherche par nom de client
    const nameMatch = lowerMsg.match(/client[s]?\s+(?:nomm[ée]|appelé|nommée)?\s*([a-zàâäéèêëïîôùûüç\s]+)|informations?\s+sur\s+([a-zàâäéèêëïîôùûüç\s]+)/i)
      || lowerMsg.match(/(?:commandes?|historique)\s+(?:de|du|d[eu])\s+([a-zàâäéèêëïîôùûüç\s]+)/i);

    if (nameMatch) {
      const clientName = (nameMatch[1] || nameMatch[2] || '').trim();
      if (clientName.length > 2) {
        const orders = await searchClientOrders(clientName);
        contextData.clientOrders = orders;
        if (orders.length > 0) {
          const stats = calcStats(orders);
          dbSummary = `RECHERCHE CLIENT "${clientName}": ${orders.length} commande(s) trouvée(s)\n`;
          dbSummary += `CA total: ${stats.revenue.toLocaleString('fr-FR')} ${stats.currency}\n`;
          dbSummary += `Statuts: ${JSON.stringify(stats.byStatus)}\n`;
          dbSummary += `Commandes:\n${orders.map(o =>
            `- #${o.id} | ${o.customer} | ${o.city} | ${o.product} | ${o.price} ${o.currency} | ${o.status} | ${new Date(o.created_at).toLocaleDateString('fr-FR')}`
          ).join('\n')}`;
        } else {
          dbSummary = `Aucun client trouvé avec le nom "${clientName}"`;
        }
      }
    }

    // Statistiques temporelles
    if (!dbSummary) {
      let days = 7;
      let label = 'cette semaine (7 jours)';

      if (lowerMsg.includes('aujourd') || lowerMsg.includes('journée')) {
        days = 1; label = 'aujourd\'hui';
      } else if (lowerMsg.includes('semaine derni') || lowerMsg.includes('7 jour') || lowerMsg.includes('7j')) {
        days = 7; label = '7 derniers jours';
      } else if (lowerMsg.includes('deux semaine') || lowerMsg.includes('2 semaine') || lowerMsg.includes('14 jour') || lowerMsg.includes('14j')) {
        days = 14; label = '14 derniers jours';
      } else if (lowerMsg.includes('mois derni') || lowerMsg.includes('30 jour') || lowerMsg.includes('30j') || lowerMsg.includes('ce mois')) {
        days = 30; label = '30 derniers jours';
      } else if (lowerMsg.includes('3 mois') || lowerMsg.includes('trimestre') || lowerMsg.includes('90 jour')) {
        days = 90; label = '3 derniers mois';
      } else if (lowerMsg.includes('création') || lowerMsg.includes('tout') || lowerMsg.includes('depuis le début') || lowerMsg.includes('toujours')) {
        // Tout temps
        const orders = await getAllTimeStats();
        const stats = calcStats(orders);
        dbSummary = `STATISTIQUES DEPUIS LA CRÉATION:\n`;
        dbSummary += `Total: ${stats.total} commandes\nCA livré: ${stats.revenue.toLocaleString('fr-FR')} ${stats.currency}\n`;
        dbSummary += `Taux livraison: ${stats.deliveryRate}%\nPar statut: ${JSON.stringify(stats.byStatus)}`;
      }

      if (!dbSummary) {
        const orders = await getOrderStats(days);
        const stats = calcStats(orders);
        dbSummary = `STATISTIQUES ${label.toUpperCase()}:\n`;
        dbSummary += `Total: ${stats.total} commandes\nCA livré: ${stats.revenue.toLocaleString('fr-FR')} ${stats.currency}\n`;
        dbSummary += `Taux livraison: ${stats.deliveryRate}%\nPar statut: ${JSON.stringify(stats.byStatus)}`;

        // Ajouter les commandes récentes pour plus de contexte
        const recent = await getRecentOrders(5);
        dbSummary += `\n\nDERNIÈRES COMMANDES:\n${recent.map(o =>
          `- #${o.id} | ${o.customer} | ${o.city} | ${o.status}`
        ).join('\n')}`;
      }
    }

  } catch (err) {
    console.error('AI Handler data fetch error:', err);
    dbSummary = 'Données non disponibles momentanément.';
  }

  // Appel Claude
  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 600,
      system: buildSystemPrompt(dbSummary),
      messages: [{ role: 'user', content: userMessage }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }
  } catch (err: any) {
    console.error('Claude API error:', err?.message);
  }

  return '❌ Impossible de traiter votre question pour l\'instant. Essayez `/stats`, `/nc` ou `/help`.';
}
