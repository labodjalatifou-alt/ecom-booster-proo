import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const shopifyUrl = process.env.SHOPIFY_STORE_URL;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

  if (!shopifyUrl || !accessToken) {
    return NextResponse.json({ error: 'Shopify credentials missing' }, { status: 500 });
  }

  try {
    // Get store currency first
    const shopRes = await fetch(`https://${shopifyUrl}/admin/api/2023-10/shop.json`, {
      headers: { 'X-Shopify-Access-Token': accessToken },
    });
    const shopData = shopRes.ok ? await shopRes.json() : {};
    const currency = shopData.shop?.currency || 'GNF';

    let allProducts: any[] = [];
    let nextPageUrl: string | null =
      `https://${shopifyUrl}/admin/api/2023-10/products.json?limit=250&fields=id,title,status,variants,image`;

    while (nextPageUrl) {
      const response: Response = await fetch(nextPageUrl, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Shopify API error ${response.status}: ${errorText}`);
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
      if (error) throw error;
    }

    return NextResponse.json({ success: true, count: productsToInsert.length, currency });
  } catch (error: any) {
    console.error('[sync-products]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
