const crypto = require('crypto');

// Configuration
const HOST = 'http://localhost:3000'; // Change si nécessaire
const SECRET = process.env.SHOPIFY_API_SECRET || 'c4b430852d5bd1f90c195deee9399965cde6b533075579d61cd1627e31f814dd';
const SHOP = 'test-shop.myshopify.com';

const endpoints = [
  { path: '/api/webhooks/customers/data_request', payload: { shop_id: 123, customer: { id: 456 } } },
  { path: '/api/webhooks/customers/redact', payload: { shop_id: 123, customer: { id: 456 } } },
  { path: '/api/webhooks/shop/redact', payload: { shop_id: 123, shop_domain: SHOP } },
  { path: '/api/webhooks/app/uninstalled', payload: { shop_id: 123, shop_domain: SHOP } },
];

async function testWebhooks() {
  console.log('Testing Shopify Compliance Webhooks...\n');
  
  for (const endpoint of endpoints) {
    const rawBody = JSON.stringify(endpoint.payload);
    
    // Génération du HMAC comme Shopify le fait
    const hmac = crypto.createHmac('sha256', SECRET).update(rawBody, 'utf8').digest('base64');
    
    try {
      const res = await fetch(`${HOST}${endpoint.path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-shopify-hmac-sha256': hmac,
          'x-shopify-shop-domain': SHOP,
        },
        body: rawBody
      });
      
      const text = await res.text();
      console.log(`[POST ${endpoint.path}]`);
      console.log(`Status: ${res.status} ${res.status === 200 ? '✅' : '❌'}`);
      console.log(`Response: ${text}\n`);
      
    } catch (err) {
      console.error(`[POST ${endpoint.path}] ❌ Error: ${err.message}\n`);
    }
  }
}

testWebhooks();
