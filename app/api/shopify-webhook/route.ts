import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const hmacHeader = req.headers.get('x-shopify-hmac-sha256');
    const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET;

    // Vérification HMAC si le secret est configuré
    if (webhookSecret && hmacHeader) {
      const generatedHash = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody, 'utf8')
        .digest('base64');

      if (generatedHash !== hmacHeader) {
        console.error('[webhook] Invalid Shopify signature');
        return NextResponse.json({ error: 'Invalid Signature' }, { status: 401 });
      }
    }

    const order = JSON.parse(rawBody);
    console.log('[webhook] Received order:', order.id);

    const shippingCity = (order.shipping_address?.city || '').toLowerCase();
    let dashboardCity = 'Abidjan';
    if (shippingCity.includes('dakar')) dashboardCity = 'Dakar';
    if (shippingCity.includes('conakry')) dashboardCity = 'Conakry';

    const rawPrice = parseFloat(order.total_price || '0');

    const orderToInsert = {
      shopify_id: order.id.toString(),
      customer: `${order.customer?.first_name || 'Client'} ${order.customer?.last_name || ''}`.trim(),
      phone: order.customer?.phone || order.billing_address?.phone || 'Non renseigné',
      product: order.line_items?.[0]?.title || 'Produit inconnu',
      price: Math.round(rawPrice).toString(),
      status: 'A Confirmer',
      city: dashboardCity,
      created_at: order.created_at,
    };

    const { error } = await supabase
      .from('orders')
      .upsert(orderToInsert, { onConflict: 'shopify_id' });

    if (error) {
      console.error('[webhook] Supabase error:', error);
      throw error;
    }

    console.log('[webhook] Order saved successfully:', order.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[webhook] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
