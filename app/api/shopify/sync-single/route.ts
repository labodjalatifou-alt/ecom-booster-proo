import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'ID produit manquant' }, { status: 400 });
    }

    // 1. Récupérer le produit et les infos de la boutique
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*, store_id')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    const { data: store, error: storeError } = await supabase
      .from('Store')
      .select('*')
      .eq('id', product.store_id)
      .single();

    if (storeError || !store) {
      return NextResponse.json({ error: 'Boutique non trouvée' }, { status: 404 });
    }

    // 2. Appeler Shopify (Côté Serveur - Pas de CORS)
    const response = await fetch(
      `https://${store.shopifyUrl}/admin/api/2024-01/products/${product.shopify_id}.json`,
      {
        headers: {
          "X-Shopify-Access-Token": store.shopifyToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: 'Erreur Shopify', detail: errorText }, { status: 500 });
    }

    const { product: shopifyProduct } = await response.json();

    // 3. Mettre à jour Supabase
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({
        title: shopifyProduct.title,
        description: shopifyProduct.body_html,
        price: shopifyProduct.variants[0].price,
        stock: shopifyProduct.variants[0].inventory_quantity,
        images: shopifyProduct.images.map((img: any) => img.src),
        image_url: shopifyProduct.image?.src || shopifyProduct.images[0]?.src,
        status: shopifyProduct.status,
      })
      .eq('id', productId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, product: updatedProduct });

  } catch (error: any) {
    console.error('[sync-single] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
