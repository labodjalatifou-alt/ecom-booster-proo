import { NextRequest, NextResponse } from 'next/server';
import { verifyShopifyWebhook } from '@/lib/shopify-webhook-util';

export async function POST(req: NextRequest) {
  try {
    const { isValid, rawBody, shopDomain, reason } = await verifyShopifyWebhook(req);

    if (!isValid) {
      console.error('[Webhook shop/redact] Invalid signature:', reason);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody!);
    console.log(`[Webhook shop/redact] Shop redact request for shop ${shopDomain}, id ${payload?.shop_id}`);

    // TODO: Supprimer toutes les données de la boutique en arrière-plan
    // Exemple : removeShopDataInBackground(shopDomain);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('[Webhook shop/redact] Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
