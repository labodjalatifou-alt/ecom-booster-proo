import { NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase'
import { dispatch } from '@/lib/notification-dispatcher'

/**
 * API publique de création de commande (landing /s/[slug]).
 * Statut « A Confirmer » → visible chez le Closer, pas le Livreur.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const customerName = typeof body.customer_name === 'string' ? body.customer_name.trim() : ''
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
    const city = typeof body.city === 'string' ? body.city.trim() : ''
    const storeId = typeof body.store_id === 'string' ? body.store_id : null

    if (!customerName || !phone || !city) {
      return NextResponse.json(
        { error: 'Le nom, le téléphone et la ville sont requis.' },
        { status: 400 },
      )
    }

    const supabase = createAdminSupabase()
    const total = body.total != null ? String(body.total) : (body.price ? String(body.price) : null)
    const currency = body.currency || 'FCFA'
    const product = body.product || 'Produit'

    const qty = body.quantity || 1
    const productName = qty > 1 ? `${qty}x ${product}` : product

    let note = `Quantité : ${qty}`
    if (body.variant && typeof body.variant === 'object' && Object.keys(body.variant).length) {
      const variantSummary = Object.entries(body.variant).map(([k, v]) => `${k}: ${v}`).join(', ')
      note += ` | Variantes: ${variantSummary}`
    }

    const orderData = {
      customer: customerName,
      phone,
      city,
      product: productName,
      price: total,
      currency,
      store_id: storeId,
      status: 'A Confirmer',
      address: body.address || null,
      country: body.country || null,
      note,
    }

    const { data: order, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select('*')
      .single()

    if (error) {
      console.error('Erreur création commande:', error)
      return NextResponse.json({ error: `Impossible d'enregistrer la commande : ${error.message}` }, { status: 500 })
    }

    // 🚀 Dispatcher l'événement de création (gère Push, WhatsApp, Telegram, In-App, Audit)
    await dispatch({
      type: 'created',
      orderId: order.id,
      order: order,
      channel: 'landing'
    });

    return NextResponse.json({ success: true, orderId: String(order.id) })
  } catch (err: any) {
    console.error('Erreur serveur commande:', err)
    return NextResponse.json({ error: `Erreur serveur lors de la commande : ${err.message}` }, { status: 500 })
  }
}
