import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const shopifyUrl = process.env.SHOPIFY_STORE_URL;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

  if (!shopifyUrl || !accessToken) {
    console.error('Shopify sync error: Credentials missing');
    return NextResponse.json({ error: 'Shopify credentials missing' }, { status: 500 });
  }

  try {
    console.log('Fetching orders from Shopify...');
    const response = await fetch(`https://${shopifyUrl}/admin/api/2023-10/orders.json?status=any&limit=50`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Shopify API error:', errorData);
      throw new Error(`Shopify API error: ${response.status}`);
    }

    const data = await response.json();
    const shopifyOrders = data.orders || [];
    console.log(`Found ${shopifyOrders.length} orders on Shopify`);

    if (shopifyOrders.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'Aucune commande trouvée' });
    }

    const ordersToInsert = shopifyOrders.map((order: any) => {
      // Normalisation de la ville pour le filtrage du Dashboard
      let city = (order.shipping_address?.city || 'Abidjan').trim();
      if (city.toLowerCase().includes('dakar')) city = 'Dakar';
      if (city.toLowerCase().includes('conakry')) city = 'Conakry';
      if (!['Abidjan', 'Dakar', 'Conakry'].includes(city)) city = 'Abidjan'; // Fallback par défaut

      return {
        shopify_id: order.id.toString(),
        customer: `${order.customer?.first_name || 'Client'} ${order.customer?.last_name || ''}`,
        phone: order.customer?.phone || order.phone || 'Non renseigné',
        product: order.line_items[0]?.title || 'Produit inconnu',
        price: `${Math.round(order.total_price)}`,
        status: 'A Confirmer',
        city: city,
        created_at: order.created_at,
      };
    });

    console.log('Inserting orders into Supabase...');
    const { error } = await supabase
      .from('orders')
      .upsert(ordersToInsert, { onConflict: 'shopify_id' });

    if (error) {
      console.error('Supabase Upsert Error:', error);
      throw error;
    }

    return NextResponse.json({ success: true, count: ordersToInsert.length });
  } catch (error: any) {
    console.error('Sync process failed:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
