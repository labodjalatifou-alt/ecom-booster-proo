import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { orderId, status, userId, cashCollected, deliveryFee, deliveryFeeIncluded, note } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Récupérer la commande actuelle
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const previousStatus = order.status;
    const currentCloserPaid = order.closer_paid || 0;

    // 2. Construire les données de mise à jour
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Cash collecté (livreur)
    if (cashCollected !== undefined) updateData.cash_collected = parseInt(cashCollected);
    if (deliveryFee !== undefined) updateData.cash_from_customer = parseInt(deliveryFee);
    if (deliveryFeeIncluded !== undefined) updateData.is_included_in_total = deliveryFeeIncluded;
    if (note !== undefined) updateData.note = note;

    // Assigner le closer ou livreur
    if (status === 'Confirmé' && userId) updateData.closer_id = userId;
    if (status === 'Livré' && userId) updateData.livreur_id = userId;

    // 3. GAINS (Enregistrés directement dans la commande)
    //    - Closer : 500 à la confirmation. Total 1000 si livré.
    //    - Livreur : 1500 à la livraison.
    
    if (status === 'Confirmé') {
      updateData.closer_paid = 500;

      // Créditer le closer (background)
      if (userId) {
        supabase.rpc('increment_user_earnings', { target_user_id: userId, amount: 500 }).then();
      }

      // Notification
      await supabase.from('notifications').insert({
        type: 'ORDER_CONFIRMED',
        title: 'Commande Confirmée',
        message: `Commande #${String(orderId).slice(-6)} confirmée. +500 ${order.currency || ''} crédités.`,
        target_role: 'ADMIN',
        order_id: orderId,
        store_id: order.store_id,
      });

    } else if (status === 'Livré') {
      updateData.closer_paid = 1000;
      updateData.livreur_paid = 1500;
      updateData.delivered_at = new Date().toISOString();

      // Créditer le closer et le livreur (background)
      if (order.closer_id) {
        supabase.rpc('increment_user_earnings', { target_user_id: order.closer_id, amount: 500 }).then();
      }
      if (userId) {
        supabase.rpc('increment_user_earnings', { target_user_id: userId, amount: 1500 }).then();
      }

      // Notifications
      await supabase.from('notifications').insert([
        {
          type: 'ORDER_DELIVERED',
          title: 'Commande Livrée',
          message: `Commande #${String(orderId).slice(-6)} livrée. Cash encaissé: ${cashCollected || order.price} ${order.currency || ''}`,
          target_role: 'ADMIN',
          order_id: orderId,
          store_id: order.store_id,
        },
        {
          type: 'MONEY_ADDED',
          title: 'Encaissement',
          message: `${cashCollected || order.price} ${order.currency || ''} encaissés sur commande #${String(orderId).slice(-6)}`,
          target_role: 'ADMIN',
          order_id: orderId,
          store_id: order.store_id,
        }
      ]);
    }

    // 4. Appliquer la mise à jour
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error('Update Order Status Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
