import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';
import { sendPushNotification } from '@/lib/push-helper';


/** Résout la ville dynamiquement à partir de l'adresse Shopify — AUCUN hardcode */
function resolveCity(order: any): string {
  const shipping = order.shipping_address;
  const billing = order.billing_address;
  const addr = shipping || billing;

  if (!addr) return 'Ville inconnue';

  const city = (addr.city || '').trim();
  const province = (addr.province || '').trim();
  const country = (addr.country || '').trim();

  if (city && province && city.toLowerCase() !== province.toLowerCase()) {
    return `${city}, ${province}`;
  }
  return city || province || country || 'Ville inconnue';
}

/** Résout la devise dynamiquement selon le store_id */
async function resolveStoreCurrency(storeId: string | null): Promise<string> {
  if (!storeId) return '';
  const { data } = await supabase.from('Store').select('currency').eq('id', storeId).single();
  return data?.currency || '';
}

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

    // Trouver le store correspondant via l'URL Shopify
    const shopDomain = req.headers.get('x-shopify-shop-domain') || '';
    let storeId: string | null = null;
    if (shopDomain) {
      const { data: store } = await supabase
        .from('Store')
        .select('id, currency')
        .eq('shopifyUrl', shopDomain)
        .single();
      if (store) storeId = store.id;
    }

    const city = resolveCity(order);
    const currency = await resolveStoreCurrency(storeId);
    const rawPrice = parseFloat(order.total_price || '0');

    const orderToInsert: any = {
      shopify_id: order.id.toString(),
      store_id: storeId,
      customer: `${order.customer?.first_name || 'Client'} ${order.customer?.last_name || ''}`.trim(),
      phone: order.shipping_address?.phone || order.billing_address?.phone || order.customer?.phone || 'Non renseigné',
      product: order.line_items?.[0]?.title || 'Produit inconnu',
      price: Math.round(rawPrice).toString(),
      currency,
      status: 'A Confirmer',
      city,
      created_at: order.created_at,
    };

    const { error } = await supabase
      .from('orders')
      .upsert(orderToInsert, { onConflict: 'shopify_id' });

    if (error) {
      console.error('[webhook] Supabase error:', error);
      throw error;
    }

    // Créer une notification pour l'admin
    await supabase.from('notifications').insert({
      type: 'ORDER_CREATED',
      title: 'Nouvelle Commande',
      message: `Commande de ${orderToInsert.customer} — ${orderToInsert.product} (${rawPrice} ${currency})`,
      target_role: 'ADMIN',
      store_id: storeId,
      order_id: orderToInsert.shopify_id,
    });

    // Déclencher la notification push pour tous les Closers
    sendPushNotification({
      role: 'CLOSER',
      title: "Nouvelle commande en attente ☎️",
      body: `Commande de ${orderToInsert.customer} (${orderToInsert.city || ''}) en attente de confirmation.`,
      url: "/interface-closer"
    }).catch(err => console.error('Error sending push to closers:', err));

    // Déclencher la notification push pour tous les Admins
    sendPushNotification({
      role: 'ADMIN',
      title: "Nouvelle commande reçue 🛍️",
      body: `Commande de ${orderToInsert.customer} — ${orderToInsert.product} (${rawPrice} ${currency})`,
      url: "/commandes"
    }).catch(err => console.error('Error sending push to admins:', err));


    console.log('[webhook] Order saved successfully:', order.id);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('[webhook] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
