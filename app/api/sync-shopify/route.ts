import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const shopifyUrl = process.env.SHOPIFY_STORE_URL;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

  if (!shopifyUrl || !accessToken) {
    return NextResponse.json({ error: 'Shopify credentials missing' }, { status: 500 });
  }

  try {
    let allOrders: any[] = [];
    // Shopify max limit is 250 per page
    let nextPageUrl: string | null =
      `https://${shopifyUrl}/admin/api/2023-10/orders.json?status=any&limit=250`;

    // Pagination loop — fetches ALL orders
    while (nextPageUrl) {
      const response = await fetch(nextPageUrl, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Shopify API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const pageOrders = data.orders || [];
      allOrders = [...allOrders, ...pageOrders];

      // Read the Link header for the next page
      const linkHeader = response.headers.get('Link') || '';
      const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
      nextPageUrl = nextMatch ? nextMatch[1] : null;
    }

    if (allOrders.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'Aucune commande Shopify' });
    }

    const ordersToInsert = allOrders.map((order: any) => {
      const shippingCity = (order.shipping_address?.city || '').toLowerCase();
      let dashboardCity = 'Abidjan';
      if (shippingCity.includes('dakar')) dashboardCity = 'Dakar';
      if (shippingCity.includes('conakry')) dashboardCity = 'Conakry';

      const rawPrice = parseFloat(order.total_price || '0');

      return {
        shopify_id: order.id.toString(),
        customer: `${order.customer?.first_name || 'Client'} ${order.customer?.last_name || ''}`.trim(),
        phone: order.customer?.phone || order.billing_address?.phone || 'Non renseigné',
        product: order.line_items?.[0]?.title || 'Produit inconnu',
        price: Math.round(rawPrice).toString(),
        status: 'A Confirmer',
        city: dashboardCity,
        created_at: order.created_at,
      };
    });

    // Upsert in batches of 100 to avoid Supabase limits
    const batchSize = 100;
    for (let i = 0; i < ordersToInsert.length; i += batchSize) {
      const batch = ordersToInsert.slice(i, i + batchSize);
      const { error } = await supabase
        .from('orders')
        .upsert(batch, { onConflict: 'shopify_id' });
      if (error) throw error;
    }

    return NextResponse.json({ success: true, count: ordersToInsert.length });
  } catch (error: any) {
    console.error('[sync-shopify] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
