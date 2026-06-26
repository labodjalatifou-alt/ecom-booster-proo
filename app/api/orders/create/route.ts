import { NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase'

/**
 * API publique de création de commande.
 * Appelée par le formulaire de commande de la landing page (/s/[slug]).
 *
 * Crée une commande avec le statut "A Confirmer" — le marchand la verra
 * dans son interface Commandes et recevra une notification.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Champs requis
    const customerName = typeof body.customer_name === 'string' ? body.customer_name.trim() : ''
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
    const city = typeof body.city === 'string' ? body.city.trim() : ''
    const storeId = typeof body.store_id === 'string' ? body.store_id : null

    if (!customerName || !phone || !city) {
      return NextResponse.json(
        { error: 'Le nom, le téléphone et la ville sont requis.' },
        { status: 400 }
      )
    }

    const supabase = createAdminSupabase()

    // Insérer la commande
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        customer: customerName,
        phone,
        city,
        product: body.product || null,
        price: body.total != null ? String(body.total) : (body.price ? String(body.price) : null),
        quantity: body.quantity || 1,
        currency: body.currency || 'FCFA',
        store_id: storeId,
        status: 'A Confirmer',
        address: body.address || null,
        country: body.country || null,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Erreur création commande:', error)
      return NextResponse.json(
        { error: 'Impossible d\'enregistrer la commande.' },
        { status: 500 }
      )
    }

    // TODO: déclencher une notification au marchand (push/email/WhatsApp)
    // On peut insérer dans une table notifications ici.

    return NextResponse.json({ success: true, orderId: order?.id })
  } catch (err) {
    console.error('Erreur serveur commande:', err)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la commande.' },
      { status: 500 }
    )
  }
}
