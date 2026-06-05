import { NextRequest, NextResponse } from 'next/server';
import { verifyShopifyWebhook } from '@/lib/shopify-webhook-util';

export async function POST(req: NextRequest) {
  try {
    const { isValid, rawBody, shopDomain, reason } = await verifyShopifyWebhook(req);

    if (!isValid) {
      console.error('[Webhook data_request] Invalid signature:', reason);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody!);
    console.log(`[Webhook data_request] Request received for shop ${shopDomain}, customer ${payload?.customer?.id}`);

    // TODO: Vous pouvez enregistrer cette demande en base de données de manière asynchrone si vous le souhaitez
    // Exemple : processDataRequestInBackground(shopDomain, payload);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('[Webhook data_request] Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
