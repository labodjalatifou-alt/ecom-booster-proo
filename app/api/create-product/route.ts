import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const shopifyUrl = process.env.SHOPIFY_STORE_URL;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

  if (!shopifyUrl || !accessToken) {
    return NextResponse.json({ error: 'Shopify credentials missing' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { name, price, stock, category, description } = body;

    if (!name || !price) {
      return NextResponse.json({ error: 'Nom et prix sont requis' }, { status: 400 });
    }

    // Shopify API: price must be a string with 2 decimal places
    const priceFormatted = parseFloat(price).toFixed(2);
    const inventoryQty = parseInt(stock || '0');

    const shopifyPayload = {
      product: {
        title: name,
        body_html: description || `<strong>Catégorie:</strong> ${category || 'Général'}`,
        vendor: 'Ecom Booster Pro',
        product_type: category || 'Général',
        status: 'active',
        variants: [
          {
            price: priceFormatted,
            sku: name.substring(0, 3).toUpperCase() + '-' + Date.now().toString().slice(-4),
            inventory_management: 'shopify',
            inventory_quantity: inventoryQty,
            fulfillment_service: 'manual',
          },
        ],
      },
    };

    const response = await fetch(
      `https://${shopifyUrl}/admin/api/2023-10/products.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shopifyPayload),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[create-product] Shopify error:', errorData);
      throw new Error(`Shopify API Error ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    const shopifyProduct = data.product;

    // 2. Sauvegarder dans la base de données locale Supabase
    // On utilise shopify_id pour le mapping
    const { error: dbError } = await supabase.from('products').upsert({
      shopify_id: shopifyProduct.id.toString(),
      title: shopifyProduct.title,
      price: priceFormatted,
      status: 'active',
      stock: inventoryQty,
      image_url: shopifyProduct.image?.src || null,
      currency: 'FCFA' // TODO: Récupérer dynamiquement
    }, { onConflict: 'shopify_id' });

    if (dbError) {
      console.error('[create-product] Database save error:', dbError);
      // On ne throw pas forcément ici car le produit est déjà sur Shopify
    }

    console.log('[create-product] Product created and saved:', shopifyProduct.id);
    return NextResponse.json({ success: true, product: shopifyProduct });
  } catch (error: any) {
    console.error('[create-product] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
