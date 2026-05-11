import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(req: Request) {
  try {
    const { id, title, description, price, inventory, imageUrls } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID produit manquant' }, { status: 400 });
    }

    // 1. Récupérer le produit et les infos de la boutique
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*, store_id')
      .eq('id', id)
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

    const shopifyUrl = store.shopifyUrl;
    const accessToken = store.shopifyToken;
    const shopifyProductId = product.shopify_id;

    if (!shopifyProductId) {
      return NextResponse.json({ error: 'ID Shopify manquant sur le produit' }, { status: 400 });
    }

    // 2. Mettre à jour Shopify
    // Note: Pour le stock, on suppose que c'est le premier variant.
    // Pour une gestion plus complexe (multi-variantes), il faudrait itérer.
    
    const updatePayload: any = {
      product: {
        id: shopifyProductId,
        title: title || product.title,
        body_html: description || product.description,
        images: imageUrls ? imageUrls.map((src: string) => ({ src })) : undefined,
        variants: [
          {
            // On ne connaît pas l'ID du variant shopify directement ici s'il n'est pas stocké, 
            // mais Shopify accepte souvent la mise à jour globale si une seule variante.
            // Si multi-variantes, l'API risque de râler sans ID.
            price: price || product.price,
            inventory_quantity: inventory !== undefined ? inventory : product.stock
          }
        ]
      }
    };

    // Pour être plus précis sur le variant, on peut d'abord récupérer le produit Shopify
    const getResp = await fetch(`https://${shopifyUrl}/admin/api/2024-01/products/${shopifyProductId}.json`, {
      headers: { 'X-Shopify-Access-Token': accessToken }
    });
    
    if (getResp.ok) {
      const shopifyData = await getResp.json();
      const firstVariantId = shopifyData.product.variants[0]?.id;
      if (firstVariantId) {
        updatePayload.product.variants[0].id = firstVariantId;
      }
    }

    const response = await fetch(
      `https://${shopifyUrl}/admin/api/2024-01/products/${shopifyProductId}.json`,
      {
        method: "PUT",
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePayload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shopify Update Error:', errorText);
      return NextResponse.json({ error: 'Erreur lors de la mise à jour Shopify', detail: errorText }, { status: 500 });
    }

    const updatedShopifyData = await response.json();
    const updatedProduct = updatedShopifyData.product;

    // 3. Mettre à jour Supabase
    const { data: finalProduct, error: updateError } = await supabase
      .from('products')
      .update({
        title: updatedProduct.title,
        price: updatedProduct.variants[0].price,
        stock: updatedProduct.variants[0].inventory_quantity,
        image_url: updatedProduct.image?.src || updatedProduct.images?.[0]?.src || product.image_url,
        images: updatedProduct.images?.map((img: any) => img.src) || [],
        status: updatedProduct.status,
        description: updatedProduct.body_html || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase Update Error:', updateError);
    }

    return NextResponse.json({ success: true, product: finalProduct });

  } catch (error: any) {
    console.error('[update-product] Global Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
