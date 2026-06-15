import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      store_id,
      product_id,
      customer_name,
      customer_phone,
      customer_address,
      customer_email,
      quantity,
      variant_chosen,
      notes,
    } = body

    if (!store_id || !customer_name || !customer_phone) {
      return NextResponse.json({ error: 'Champs requis manquants (store_id, customer_name, customer_phone)' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('store_orders')
      .insert({
        store_id,
        product_id: product_id || null,
        customer_name,
        customer_phone,
        customer_email: customer_email || null,
        customer_address: customer_address || '',
        quantity: quantity || 1,
        variant_chosen: variant_chosen || null,
        notes: notes || '',
        status: 'pending',
      })
      .select('id')
      .single()

    if (error) {
      console.error('store_orders insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, order_id: data.id })
  } catch (err: any) {
    console.error('store/orders error:', err)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
