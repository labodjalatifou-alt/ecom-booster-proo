import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';

const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET, HOST } = process.env;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const shop = searchParams.get('shop');
  const code = searchParams.get('code');
  const hmac = searchParams.get('hmac');
  const state = searchParams.get('state');
  const cookieState = req.cookies.get('shopify_state')?.value;

  // Vérifier le state anti-CSRF
  if (state !== cookieState) {
    return NextResponse.json({ error: 'State invalide' }, { status: 403 });
  }

  // Vérifier la signature Shopify
  const params: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    if (key !== 'hmac') params[key] = value;
  });
  const message = Object.keys(params).sort()
    .map(k => `${k}=${params[k]}`).join('&');
  const digest = crypto
    .createHmac('sha256', SHOPIFY_API_SECRET!)
    .update(message).digest('hex');

  if (digest !== hmac) {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 403 });
  }

  // Échanger le code contre un access token
  const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code
    })
  });
  const { access_token } = await tokenRes.json();

  // Sauvegarder dans Supabase
  const supabase = createClient();
  await supabase.from('shopify_stores').upsert({
    shop_domain: shop,
    access_token: access_token,
    updated_at: new Date().toISOString()
  }, { onConflict: 'shop_domain' });

  // Rediriger vers ton dashboard
  return NextResponse.redirect(`${HOST}/dashboard?shop=${shop}`);
}
