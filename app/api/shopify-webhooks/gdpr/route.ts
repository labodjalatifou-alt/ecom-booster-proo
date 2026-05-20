import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Route obligatoire pour les webhooks RGPD de Shopify.
 * Shopify exige que toute application publique configure ces 3 webhooks.
 * Si ces webhooks ne répondent pas par un statut 200 OK, l'application sera rejetée.
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const hmacHeader = req.headers.get('x-shopify-hmac-sha256');
    const topic = req.headers.get('x-shopify-topic'); // ex: 'customers/data_request'
    const shopDomain = req.headers.get('x-shopify-shop-domain');
    const webhookSecret = process.env.SHOPIFY_API_SECRET; // Les webhooks RGPD utilisent l'API Secret, pas le Webhook Secret classique

    // Vérification stricte de la signature Shopify
    if (webhookSecret && hmacHeader) {
      const generatedHash = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody, 'utf8')
        .digest('base64');

      if (generatedHash !== hmacHeader) {
        console.error(`[GDPR Webhook] Invalid signature for topic ${topic}`);
        return NextResponse.json({ error: 'Invalid Signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    console.log(`[GDPR Webhook] Received topic: ${topic} for shop: ${shopDomain}`);

    // Gestion des 3 webhooks obligatoires
    switch (topic) {
      case 'customers/data_request':
        // Shopify demande les données d'un client. 
        // Si vous ne stockez pas de données client spécifiques au-delà des commandes de base, aucune action lourde n'est requise.
        console.log(`[GDPR] Customer data request for customer ID: ${payload.customer?.id}`);
        break;

      case 'customers/redact':
        // Shopify demande la suppression des données d'un client.
        // Vous devriez anonymiser ou supprimer le client de votre table 'orders' si nécessaire.
        console.log(`[GDPR] Customer redact request for customer ID: ${payload.customer?.id}`);
        break;

      case 'shop/redact':
        // Shopify demande la suppression de toutes les données de la boutique 48h après la désinstallation.
        // Vous devez supprimer les clés API et les données de la boutique de la base de données.
        console.log(`[GDPR] Shop redact request for shop: ${shopDomain}`);
        // Logique de suppression à implémenter dans Supabase (ex: delete from Store where shopifyUrl = shopDomain)
        break;

      default:
        console.log(`[GDPR Webhook] Unhandled topic: ${topic}`);
        break;
    }

    // Shopify exige de toujours répondre avec un statut 200 OK pour accuser réception
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('[GDPR Webhook] Error:', error.message);
    // Même en cas d'erreur interne temporaire, on peut renvoyer une erreur, 
    // mais Shopify réessaiera. Pour le moment on renvoie 500.
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
