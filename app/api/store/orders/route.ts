import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      store_id,
      customer_name,
      customer_phone,
      customer_email = '',
      customer_address = '',
      quantity = 1,
      total_price = 0,
      variant_chosen = null,
      notes = '',
    } = body

    // Validate required fields
    if (!store_id || typeof store_id !== 'string') {
      return NextResponse.json({ error: 'store_id requis.' }, { status: 400 })
    }
    if (!customer_name || typeof customer_name !== 'string' || !customer_name.trim()) {
      return NextResponse.json({ error: 'Le nom est requis.' }, { status: 400 })
    }
    if (!customer_phone || typeof customer_phone !== 'string' || !customer_phone.trim()) {
      return NextResponse.json({ error: 'Le téléphone est requis.' }, { status: 400 })
    }

    const supabase = createClient()

    // Verify the store exists (prevents inserting orders for ghost stores)
    const { data: store, error: storeErr } = await supabase
      .from('stores')
      .select('id, name')
      .eq('id', store_id)
      .maybeSingle()

    if (storeErr || !store) {
      console.error('[store/orders] store not found:', store_id, storeErr)
      return NextResponse.json({ error: 'Boutique introuvable.' }, { status: 404 })
    }

    // Insert the order
    const { data: order, error: insertErr } = await supabase
      .from('store_orders')
      .insert({
        store_id,
        customer_name: customer_name.trim(),
        customer_phone: customer_phone.trim(),
        customer_email: customer_email?.trim() ?? '',
        customer_address: customer_address?.trim() ?? '',
        quantity: Math.max(1, Number(quantity) || 1),
        total_price: Math.max(0, Number(total_price) || 0),
        variant_chosen: variant_chosen ?? null,
        status: 'pending',
        notes: typeof notes === 'string' ? notes : JSON.stringify(notes),
      })
      .select()
      .single()

    if (insertErr) {
      console.error('[store/orders] insert error:', insertErr)
      return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, order }, { status: 201 })
  } catch (err) {
    console.error('[store/orders] unexpected error:', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
