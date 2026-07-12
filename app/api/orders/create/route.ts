import { NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase'
import { sendPushNotification } from '@/lib/push-helper'

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

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
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
      })
      .select('id')
      .single()

    if (error) {
      console.error('Erreur création commande:', error)
      return NextResponse.json({ error: `Impossible d'enregistrer la commande : ${error.message}` }, { status: 500 })
    }

    const orderIdStr = order?.id ? String(order.id) : ''
    const orderRef = orderIdStr ? orderIdStr.slice(-6) : '??????'
    const msg = `${customerName} — ${product} (${total} ${currency}) · ${city}`

    try {
      const { error: notifError } = await supabase.from('notifications').insert([
        {
          type: 'ORDER_CREATED',
          title: 'Nouvelle commande boutique',
          message: msg,
          target_role: 'ADMIN',
          store_id: storeId,
          order_id: orderIdStr || null,
          read: false,
        },
        {
          type: 'ORDER_CREATED',
          title: 'Commande à confirmer ☎️',
          message: `${customerName} (${city}) — ${product}`,
          target_role: 'CLOSER',
          store_id: storeId,
          order_id: orderIdStr || null,
          read: false,
        },
      ])
      if (notifError) {
        console.error('Erreur insertion notifications:', notifError)
      }
    } catch (notifErr) {
      console.error('Erreur catch insertion notifications:', notifErr)
    }

    Promise.allSettled([
      sendPushNotification({
        role: 'CLOSER',
        title: 'Nouvelle commande à confirmer ☎️',
        body: `${customerName} (${city}) attend votre appel.`,
        url: '/interface-closer',
      }),
      sendPushNotification({
        role: 'ADMIN',
        title: 'Nouvelle commande boutique 🛍️',
        body: msg,
        url: '/commandes',
      }),
    ]).then(results => {
      results.forEach((r, i) => {
        if (r.status === 'rejected') console.error(`Push notification ${i} failed:`, r.reason)
      })
    })

    return NextResponse.json({ success: true, orderId: orderIdStr })
  } catch (err: any) {
    console.error('Erreur serveur commande:', err)
    return NextResponse.json({ error: `Erreur serveur lors de la commande : ${err.message}` }, { status: 500 })
  }
}
