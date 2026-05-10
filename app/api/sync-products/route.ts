import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // 1. Récupérer toutes les boutiques connectées
    const { data: stores, error: storesError } = await supabase
      .from('Store')
      .select('*');

    if (storesError) throw storesError;
    if (!stores || stores.length === 0) {
      return NextResponse.json({ error: 'Aucune boutique connectée' }, { status: 400 });
    }

    let totalImported = 0;

    // 2. Pour chaque boutique, importer les produits
    for (const store of stores) {
      const shopifyUrl = store.shopifyUrl;
      const accessToken = store.shopifyToken;
      const currency = store.currency || 'FCFA';

      let allProducts: any[] = [];
      let nextPageUrl: string | null =
        `https://${shopifyUrl}/admin/api/2024-01/products.json?limit=250`;

      while (nextPageUrl) {
        const response: Response = await fetch(nextPageUrl, {
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.error(`Shopify API error for ${store.name}:`, await response.text());
          break;
        }

        const data = await response.json();
        allProducts = [...allProducts, ...(data.products || [])];

        const linkHeader = response.headers.get('Link') || '';
        const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
        nextPageUrl = nextMatch ? nextMatch[1] : null;
      }

      const productsToInsert = allProducts.map((p: any) => ({
        shopify_id: p.id.toString(),
        title: p.title,
        price: p.variants?.[0]?.price || '0',
        compare_price: p.variants?.[0]?.compare_at_price || null,
        status: p.status,
        stock: p.variants?.[0]?.inventory_quantity || 0,
        image_url: p.image?.src || null,
        currency,
      }));

      // Upsert in batches
      for (let i = 0; i < productsToInsert.length; i += 100) {
        const batch = productsToInsert.slice(i, i + 100);
        const { error } = await supabase
          .from('products')
          .upsert(batch, { onConflict: 'shopify_id' });
        if (error) console.error(`Upsert error for ${store.name}:`, error);
      }
      totalImported += productsToInsert.length;
    }

    return NextResponse.json({ success: true, count: totalImported });
  } catch (error: any) {
    console.error('[sync-products]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
