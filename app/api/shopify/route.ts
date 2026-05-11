import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

async function shopifyFetch(domain: string, token: string, endpoint: string, options: RequestInit = {}) {
  const url = `https://${domain}/admin/api/2024-01/${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Shopify ${res.status}: ${error}`);
  }
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, productId, updateData, storeId } = body;

    if (!storeId) {
      return NextResponse.json({ error: 'storeId requis' }, { status: 400 });
    }

    // Récupérer les credentials de la boutique
    const { data: store, error: storeError } = await supabase
      .from('Store')
      .select('*')
      .eq('id', storeId)
      .single();

    if (storeError || !store) {
      return NextResponse.json({ error: 'Boutique non trouvée' }, { status: 404 });
    }

    const domain = store.shopifyUrl;
    const token = store.shopifyToken;

    switch (action) {
      case 'get_products':
        const products = await shopifyFetch(domain, token, 'products.json?status=active&limit=250&fields=id,title,status,body_html,images,variants,tags,vendor,product_type');
        return NextResponse.json(products);

      case 'get_product':
        const product = await shopifyFetch(domain, token, `products/${productId}.json`);
        return NextResponse.json(product);

      case 'update_product':
        const updated = await shopifyFetch(domain, token, `products/${productId}.json`, {
          method: 'PUT',
          body: JSON.stringify({ product: updateData }),
        });
        
        // Optionnel : Mettre à jour le cache Supabase
        await supabase
          .from('products')
          .update({
            title: updated.product.title,
            description: updated.product.body_html,
            price: updated.product.variants[0].price,
            stock: updated.product.variants[0].inventory_quantity,
            image_url: updated.product.image?.src || updated.product.images[0]?.src,
            status: updated.product.status
          })
          .eq('shopify_id', productId.toString());

        return NextResponse.json(updated);

      default:
        return NextResponse.json({ error: `Action inconnue: ${action}` }, { status: 400 });
    }
  } catch (err: any) {
    console.error('[api/shopify]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
