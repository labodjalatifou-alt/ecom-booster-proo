import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const shopifyUrl = process.env.SHOPIFY_STORE_URL;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

  if (!shopifyUrl || !accessToken) {
    return NextResponse.json({ error: 'Shopify credentials missing' }, { status: 500 });
  }

  try {
    // 1. Récupérer les dernières commandes de Shopify
    const response = await fetch(`https://${shopifyUrl}/admin/api/2023-10/orders.json?status=any&limit=50`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    const shopifyOrders = data.orders || [];

    // 2. Préparer les données pour Supabase
    const ordersToInsert = shopifyOrders.map((order: any) => ({
      shopify_id: order.id.toString(),
      customer: `${order.customer?.first_name || 'Client'} ${order.customer?.last_name || ''}`,
      phone: order.customer?.phone || order.phone || 'Non renseigné',
      product: order.line_items[0]?.title || 'Produit inconnu',
      price: `${Math.round(order.total_price)}`, // On garde le format texte pour la compatibilité existante
      status: 'A Confirmer',
      city: order.shipping_address?.city || 'Inconnue',
      created_at: order.created_at,
    }));

    // 3. Insérer dans Supabase (avec upsert pour éviter les doublons)
    const { error } = await supabase
      .from('orders')
      .upsert(ordersToInsert, { onConflict: 'shopify_id' });

    if (error) throw error;

    return NextResponse.json({ success: true, count: ordersToInsert.length });
  } catch (error: any) {
    console.error('Sync Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
