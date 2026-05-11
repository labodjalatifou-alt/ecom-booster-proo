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

    // 3. GAINS CLOSER & LIVREUR
    //    - Closer : +500 à la confirmation. Si livré, +500 de plus (total 1000).
    //    - Livreur : +1500 à la livraison.
    
    if (status === 'Confirmé' && previousStatus !== 'Confirmé') {
      updateData.closer_paid = 500; // Premier palier

      // Créditer le closer de 500
      if (userId) {
        console.log("Crediting Closer 500:", userId);
        const { error: rpcError } = await supabase.rpc('increment_user_earnings', { target_user_id: userId, amount: 500 });
        if (rpcError) {
          console.error("RPC Error (500):", rpcError);
          // Fallback : update direct (si l'RPC n'est pas encore créé)
          const { data: user } = await supabase.from('User').select('earnings').eq('id', userId).single();
          if (user) await supabase.from('User').update({ earnings: (user.earnings || 0) + 500 }).eq('id', userId);
          else await supabase.from('User').insert({ id: userId, earnings: 500, name: 'Closer' });
        }
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

    } else if (status === 'Livré' && previousStatus !== 'Livré') {
      const closerBonus = 1000 - currentCloserPaid; // On complète pour arriver à 1000
      updateData.closer_paid = 1000;
      updateData.delivered_at = new Date().toISOString();

      // Créditer le closer du bonus (500 si déjà confirmé, 1000 sinon)
      const closerId = order.closer_id;
      if (closerId && closerBonus > 0) {
        console.log("Crediting Closer Bonus:", closerId, closerBonus);
        const { error: rpcError } = await supabase.rpc('increment_user_earnings', { target_user_id: closerId, amount: closerBonus });
        if (rpcError) {
          const { data: closerUser } = await supabase.from('User').select('earnings').eq('id', closerId).single();
          if (closerUser) await supabase.from('User').update({ earnings: (closerUser.earnings || 0) + closerBonus }).eq('id', closerId);
          else await supabase.from('User').insert({ id: closerId, earnings: closerBonus, name: 'Closer' });
        }
      }

      // Créditer le livreur (1500 par livraison)
      if (userId) {
        console.log("Crediting Livreur 1500:", userId);
        const { error: rpcError } = await supabase.rpc('increment_user_earnings', { target_user_id: userId, amount: 1500 });
        if (rpcError) {
          const { data: livreurUser } = await supabase.from('User').select('earnings').eq('id', userId).single();
          if (livreurUser) await supabase.from('User').update({ earnings: (livreurUser.earnings || 0) + 1500 }).eq('id', userId);
          else await supabase.from('User').insert({ id: userId, earnings: 1500, name: 'Livreur' });
        }
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
