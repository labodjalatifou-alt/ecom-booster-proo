import { NextRequest, NextResponse } from 'next/server';
import { verifyShopifyWebhook } from '@/lib/shopify-webhook-util';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { isValid, shopDomain, reason } = await verifyShopifyWebhook(req);

    if (!isValid) {
      console.error('[Webhook app/uninstalled] Invalid signature:', reason);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`[Webhook app/uninstalled] Uninstalled from shop: ${shopDomain}`);

    if (shopDomain) {
      // Background execution for deletion logic (using Edge or serverless without awaiting the end necessarily, 
      // though Next.js might kill the function when response is sent. Using a standard await is fast enough for db).
      const supabase = createClient();
      await supabase.from('shopify_stores').delete().eq('shop_domain', shopDomain);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('[Webhook app/uninstalled] Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
