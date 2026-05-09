import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const shopifyUrl = process.env.SHOPIFY_STORE_URL;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

  if (!shopifyUrl || !accessToken) {
    return NextResponse.json({ error: 'Shopify credentials missing' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://${shopifyUrl}/admin/api/2023-10/orders.json?status=any&limit=50`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Shopify API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const shopifyOrders = data.orders || [];

    if (shopifyOrders.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'Aucune commande Shopify' });
    }

    const ordersToInsert = shopifyOrders.map((order: any) => {
      const shippingCity = (order.shipping_address?.city || '').toLowerCase();
      let dashboardCity = 'Abidjan';
      if (shippingCity.includes('dakar')) dashboardCity = 'Dakar';
      if (shippingCity.includes('conakry')) dashboardCity = 'Conakry';

      // Normaliser le prix : prendre uniquement les chiffres
      const rawPrice = parseFloat(order.total_price || '0');
      const priceStr = Math.round(rawPrice).toString();

      return {
        shopify_id: order.id.toString(),
        customer: `${order.customer?.first_name || 'Client'} ${order.customer?.last_name || ''}`.trim(),
        phone: order.customer?.phone || order.billing_address?.phone || 'Non renseigné',
        product: order.line_items?.[0]?.title || 'Produit inconnu',
        price: priceStr,
        status: 'A Confirmer',
        city: dashboardCity,
        created_at: order.created_at,
      };
    });

    const { error } = await supabase
      .from('orders')
      .upsert(ordersToInsert, { onConflict: 'shopify_id' });

    if (error) throw error;

    return NextResponse.json({ success: true, count: ordersToInsert.length });
  } catch (error: any) {
    console.error('[sync-shopify] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
