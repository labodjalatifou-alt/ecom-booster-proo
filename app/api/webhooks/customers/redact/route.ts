import { NextRequest, NextResponse } from 'next/server';
import { verifyShopifyWebhook } from '@/lib/shopify-webhook-util';

export async function POST(req: NextRequest) {
  try {
    const { isValid, rawBody, shopDomain, reason } = await verifyShopifyWebhook(req);

    if (!isValid) {
      console.error('[Webhook customers/redact] Invalid signature:', reason);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody!);
    console.log(`[Webhook customers/redact] Redact request for shop ${shopDomain}, customer ${payload?.customer?.id}`);

    // TODO: Supprimer ou anonymiser asynchroniquement les données client dans la base de données
    // Exemple : removeCustomerDataInBackground(shopDomain, payload?.customer?.id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('[Webhook customers/redact] Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
