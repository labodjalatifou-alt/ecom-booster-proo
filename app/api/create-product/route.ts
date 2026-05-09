import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const shopifyUrl = process.env.SHOPIFY_STORE_URL;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

  if (!shopifyUrl || !accessToken) {
    return NextResponse.json({ error: 'Shopify credentials missing' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { name, price, stock, category } = body;

    // 1. Création du produit sur Shopify
    const response = await fetch(`https://${shopifyUrl}/admin/api/2023-10/products.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product: {
          title: name,
          body_html: `<strong>Catégorie:</strong> ${category}`,
          vendor: 'Ecom Booster Pro',
          product_type: category,
          status: 'active',
          variants: [
            {
              price: price,
              inventory_management: 'shopify',
              inventory_quantity: parseInt(stock),
              sku: name.substring(0, 3).toUpperCase() + "-" + Math.floor(Math.random() * 1000)
            }
          ]
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Shopify API Error: ${errorData}`);
    }

    const data = await response.json();
    return NextResponse.json({ success: true, product: data.product });
  } catch (error: any) {
    console.error('Create Product Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
