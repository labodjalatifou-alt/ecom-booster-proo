import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function resolveCity(order: any, storeCountry: string | null): string {
  const shipping = order.shipping_address;
  const billing = order.billing_address;
  const addr = shipping || billing;

  if (!addr) return storeCountry || 'Ville inconnue';

  const city = (addr.city || '').trim();
  const province = (addr.province || '').trim();
  const address1 = (addr.address1 || '').trim();

  // On privilégie la ville et province combinées si différentes
  if (city && province && city.toLowerCase() !== province.toLowerCase()) {
    return `${city}, ${province}`;
  }
  
  // Sinon ville, sinon province, sinon adresse1, sinon pays du store
  return city || province || address1 || storeCountry || 'Ville inconnue';
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

/** Devise provient directement du store — aucun hardcode */

/** Traduit le statut Shopify en statut interne */
function resolveStatus(order: any): string {
  const fin = order.financial_status;
  const ful = order.fulfillment_status;
  if (ful === 'fulfilled') return 'Livré';
  if (fin === 'refunded' || fin === 'voided') return 'Annulé';
  return 'A Confirmer';
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get('storeId');

  try {
    let storesToSync: any[] = [];

    if (storeId) {
      // Synchronisation d'une seule boutique
      const { data: store, error: storeError } = await supabase
        .from('Store')
        .select('*')
        .eq('id', storeId)
        .single();
      
      if (storeError || !store) throw new Error('Boutique non trouvée');
      storesToSync = [store];
    } else {
      // Synchronisation de TOUTES les boutiques
      const { data: allStores, error: allStoresError } = await supabase
        .from('Store')
        .select('*');
      
      if (allStoresError) throw allStoresError;
      storesToSync = allStores || [];
    }

    let totalImported = 0;

    for (const store of storesToSync) {
      const shopifyUrl = store.shopifyUrl;
      const accessToken = store.shopifyToken;
      const storeCurrency = store.currency || '';

      let allOrders: any[] = [];
      let nextPageUrl: string | null =
        `https://${shopifyUrl}/admin/api/2024-01/orders.json?status=any&limit=250&fields=id,customer,shipping_address,billing_address,line_items,total_price,financial_status,fulfillment_status,created_at,updated_at`;

      while (nextPageUrl) {
        const response: Response = await fetch(nextPageUrl, {
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.error(`Error for store ${store.name}:`, await response.text());
          break;
        }

        const data = await response.json();
        allOrders = [...allOrders, ...(data.orders || [])];

        const linkHeader = response.headers.get('Link') || '';
        const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
        nextPageUrl = nextMatch ? nextMatch[1] : null;
      }

      const ordersToInsert = allOrders.map((order: any) => {
        const city = resolveCity(order, store.country); 
        const phone = resolvePhone(order);
        const rawPrice = parseFloat(order.total_price || '0');
        const firstName = order.customer?.first_name || '';
        const lastName = order.customer?.last_name || '';
        const customer = `${firstName} ${lastName}`.trim() || 'Client';
        const product = order.line_items?.[0]?.title || 'Produit inconnu';
        const status = resolveStatus(order);

        return {
          shopify_id: order.id.toString(),
          store_id: store.id,
          customer,
          phone,
          product,
          price: Math.round(rawPrice).toString(),
          currency: storeCurrency,
          city,
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
        if (error) console.error('Upsert error:', error);
      }
      totalImported += ordersToInsert.length;
    }

    return NextResponse.json({ success: true, count: totalImported });
  } catch (error: any) {
    console.error('[sync-shopify] Erreur:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
