import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const hmac = req.headers.get('x-shopify-hmac-sha256');

    // Optionnel : Vérification HMAC pour la sécurité
    // const hash = crypto.createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET!).update(rawBody, 'utf8').digest('base64');
    // if (hash !== hmac) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const order = JSON.parse(rawBody);
    console.log('New Order via Webhook:', order.id);

    // Détection de la ville simplifiée
    const shippingCity = order.shipping_address?.city?.toLowerCase() || '';
    let dashboardCity = 'Abidjan'; 
    if (shippingCity.includes('dakar')) dashboardCity = 'Dakar';
    if (shippingCity.includes('conakry')) dashboardCity = 'Conakry';

    const orderToInsert = {
      shopify_id: order.id.toString(),
      customer: `${order.customer?.first_name || 'Client'} ${order.customer?.last_name || ''}`,
      phone: order.customer?.phone || order.phone || 'Non renseigné',
      product: order.line_items[0]?.title || 'Produit inconnu',
      price: `${Math.round(order.total_price)}`,
      status: 'A Confirmer',
      city: dashboardCity,
      created_at: order.created_at,
    };

    const { error } = await supabase
      .from('orders')
      .upsert(orderToInsert, { onConflict: 'shopify_id' });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
