import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/** Extrait la ville réelle de l'adresse Shopify */
function resolveCity(order: any): string {
  const shipping = order.shipping_address;
  const billing = order.billing_address;
  const addr = shipping || billing;

  if (!addr) return 'Ville inconnue';

  // Utilise city + province pour une identification précise
  const city = (addr.city || '').trim();
  const province = (addr.province || '').trim();

  // Retourne ville réelle + province si différents (évite les doublons)
  if (city && province && city.toLowerCase() !== province.toLowerCase()) {
    return `${city}, ${province}`;
  }
  return city || province || 'Ville inconnue';
}

/** Extrait le meilleur numéro de téléphone disponible */
function resolvePhone(order: any): string {
  return (
    order.shipping_address?.phone ||
    order.billing_address?.phone ||
    order.customer?.phone ||
    order.customer?.default_address?.phone ||
    'Non renseigné'
  );
}

/** Détermine la devise selon la ville */
function resolveCurrency(city: string): string {
  const gnKeywords = ['conakry', 'kankan', 'kindia', 'labe', 'labé', 'mamou', 'nzerekore', 'guinée', 'guinea'];
  const cityLower = city.toLowerCase();
  return gnKeywords.some(k => cityLower.includes(k)) ? 'GNF' : 'FCFA';
}

/** Traduit le statut Shopify en statut interne */
function resolveStatus(order: any): string {
  const fin = order.financial_status;
  const ful = order.fulfillment_status;
  if (ful === 'fulfilled') return 'Livré';
  if (fin === 'refunded' || fin === 'voided') return 'Annulé';
  return 'A Confirmer';
}

export async function GET() {
  const shopifyUrl = process.env.SHOPIFY_STORE_URL;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

  if (!shopifyUrl || !accessToken) {
    return NextResponse.json({ error: 'Identifiants Shopify manquants' }, { status: 500 });
  }

  try {
    let allOrders: any[] = [];
    let nextPageUrl: string | null =
      `https://${shopifyUrl}/admin/api/2023-10/orders.json?status=any&limit=250&fields=id,customer,shipping_address,billing_address,line_items,total_price,financial_status,fulfillment_status,created_at,updated_at`;

    // Pagination — charge TOUTES les commandes
    while (nextPageUrl) {
      const response: Response = await fetch(nextPageUrl, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Shopify API ${response.status}: ${err}`);
      }

      const data = await response.json();
      allOrders = [...allOrders, ...(data.orders || [])];

      const linkHeader = response.headers.get('Link') || '';
      const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
      nextPageUrl = nextMatch ? nextMatch[1] : null;
    }

    if (allOrders.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'Aucune commande Shopify trouvée' });
    }

    const ordersToInsert = allOrders.map((order: any) => {
      const city = resolveCity(order);
      const phone = resolvePhone(order);
      const rawPrice = parseFloat(order.total_price || '0');
      const currency = resolveCurrency(city);
      const firstName = order.customer?.first_name || '';
      const lastName = order.customer?.last_name || '';
      const customer = `${firstName} ${lastName}`.trim() || 'Client';
      const product = order.line_items?.[0]?.title || 'Produit inconnu';
      const status = resolveStatus(order);

      return {
        shopify_id: order.id.toString(),
        customer,
        phone,
        product,
        price: Math.round(rawPrice).toString(),
        city,
        currency,
        status,
        created_at: order.created_at,
        updated_at: order.updated_at,
      };
    });

    // Upsert par batch de 100
    for (let i = 0; i < ordersToInsert.length; i += 100) {
      const batch = ordersToInsert.slice(i, i + 100);
      const { error } = await supabase
        .from('orders')
        .upsert(batch, { onConflict: 'shopify_id' });
      if (error) throw error;
    }

    return NextResponse.json({ success: true, count: ordersToInsert.length });
  } catch (error: any) {
    console.error('[sync-shopify] Erreur:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
