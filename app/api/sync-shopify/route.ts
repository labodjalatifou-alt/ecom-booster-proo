import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const shopifyUrl = process.env.SHOPIFY_STORE_URL;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

  if (!shopifyUrl || !accessToken) {
    return NextResponse.json({ error: 'Shopify credentials missing' }, { status: 500 });
  }

  try {
    const response = await fetch(`https://${shopifyUrl}/admin/api/2023-10/orders.json?status=any&limit=50`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error(`Shopify API error: ${response.status}`);

    const data = await response.json();
    const shopifyOrders = data.orders || [];

    if (shopifyOrders.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    const ordersToInsert = shopifyOrders.map((order: any) => {
      // Détection de la ville simplifiée
      const shippingCity = order.shipping_address?.city?.toLowerCase() || '';
      let dashboardCity = 'Abidjan'; // Par défaut
      
      if (shippingCity.includes('dakar')) dashboardCity = 'Dakar';
      if (shippingCity.includes('conakry')) dashboardCity = 'Conakry';

      return {
        shopify_id: order.id.toString(),
        customer: `${order.customer?.first_name || 'Client'} ${order.customer?.last_name || ''}`,
        phone: order.customer?.phone || order.phone || 'Non renseigné',
        product: order.line_items[0]?.title || 'Produit inconnu',
        price: `${Math.round(order.total_price)}`,
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
