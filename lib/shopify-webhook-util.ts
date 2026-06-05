import crypto from 'crypto';
import { NextRequest } from 'next/server';

export async function verifyShopifyWebhook(req: NextRequest) {
  const rawBody = await req.text();
  const hmacHeader = req.headers.get('x-shopify-hmac-sha256');
  const shopDomain = req.headers.get('x-shopify-shop-domain');
  
  // Shopify utilise SHOPIFY_API_SECRET pour signer les webhooks pour les apps publiques
  const webhookSecret = process.env.SHOPIFY_API_SECRET; 

  if (!webhookSecret || !hmacHeader) {
    return { isValid: false, reason: 'Missing secret or hmac header', rawBody: null, shopDomain };
  }

  const generatedHash = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody, 'utf8')
    .digest('base64');

  if (generatedHash !== hmacHeader) {
    return { isValid: false, reason: 'Invalid signature', rawBody: null, shopDomain };
  }

  return { isValid: true, rawBody, shopDomain };
}
