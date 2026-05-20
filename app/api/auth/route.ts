import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const { SHOPIFY_API_KEY, SHOPIFY_SCOPES, HOST } = process.env;

export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get('shop');
  if (!shop) return NextResponse.json({ error: 'shop manquant' }, { status: 400 });

  const state = crypto.randomBytes(16).toString('hex');
  const sanitizedHost = HOST ? HOST.replace(/\/$/, '') : '';
  const redirectUri = `${sanitizedHost}/api/auth/callback`;

  const installUrl = `https://${shop}/admin/oauth/authorize?` +
    `client_id=${SHOPIFY_API_KEY}` +
    `&scope=${SHOPIFY_SCOPES}` +
    `&state=${state}` +
    `&redirect_uri=${redirectUri}`;

  const response = NextResponse.redirect(installUrl);
  response.cookies.set('shopify_state', state, { 
    httpOnly: true, 
    secure: true,
    maxAge: 60 * 10
  });
  return response;
}
