import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;

const PUBLIC_PATHS = [
  '/manifest.webmanifest',
  '/manifest.json',
  '/sw.js',
  '/favicon.ico',
  '/icons',
  '/api/push/subscribe',
  '/api/push/send',
  '/connexion',
];

function base64urlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function verifyShopifySessionToken(token: string): Promise<{ shop: string } | null> {
  if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET) {
    console.error('SHOPIFY_API_KEY or SHOPIFY_API_SECRET is not configured');
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerStr, payloadStr, signatureStr] = parts;

  try {
    // 1. Verify signature using Web Crypto API (HMAC SHA-256)
    const encoder = new TextEncoder();
    const secretKeyData = encoder.encode(SHOPIFY_API_SECRET);
    const key = await crypto.subtle.importKey(
      'raw',
      secretKeyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = base64urlDecode(signatureStr);
    const dataBytes = encoder.encode(`${headerStr}.${payloadStr}`);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as any,
      dataBytes as any
    );

    if (!isValid) {
      console.warn('Invalid Shopify session token signature');
      return null;
    }

    // 2. Decode and verify payload claims
    const payloadBytes = base64urlDecode(payloadStr);
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes));

    const now = Math.floor(Date.now() / 1000);

    // Validate expiration
    if (payload.exp && payload.exp < now) {
      console.warn('Shopify session token has expired');
      return null;
    }

    // Validate nbf (not before)
    if (payload.nbf && payload.nbf > now) {
      console.warn('Shopify session token is not active yet');
      return null;
    }

    // Validate audience (must match Shopify API Key)
    if (payload.aud !== SHOPIFY_API_KEY) {
      console.warn('Shopify session token audience mismatch', payload.aud, SHOPIFY_API_KEY);
      return null;
    }

    // Extract shop domain from 'dest' claim
    if (!payload.dest) {
      console.warn('Shopify session token is missing dest claim');
      return null;
    }

    const destUrl = new URL(payload.dest);
    const shop = destUrl.hostname;

    return { shop };
  } catch (err) {
    console.error('Error verifying Shopify session token:', err);
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Ne jamais bloquer ces chemins publics
  const isPublic = PUBLIC_PATHS.some(path => pathname.startsWith(path));
  if (isPublic) return NextResponse.next();

  // Validate session token for Shopify administrative routes
  // Note: webhook endpoints verify raw signature instead of session tokens
  if (
    (pathname.startsWith('/api/shopify') || 
     pathname.startsWith('/api/sync-') || 
     pathname.startsWith('/api/create-product') ||
     pathname.startsWith('/api/update-order-status')) &&
    !pathname.startsWith('/api/shopify-webhook') &&
    !pathname.startsWith('/api/auth')
  ) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or malformed Authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const session = await verifyShopifySessionToken(token);

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid Shopify session token' },
        { status: 401 }
      );
    }

    // Token is valid. Inject shop domain into request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-shopify-shop-domain', session.shop);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
