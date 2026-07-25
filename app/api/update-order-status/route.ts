import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { dispatch } from '@/lib/notification-dispatcher';

export async function POST(req: Request) {
  try {
    const { orderId, status, userId, cashCollected, deliveryFee, deliveryFeeIncluded, note, livreurId, cancellationReason, rescheduledTo, rescheduledReason } = await req.json();


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

    // Validation: Exiger livreurId si on passe à "Confirmé" (et que ça n'était pas déjà confirmé)
    if (status === 'Confirmé' && !livreurId && !order.livreur_id) {
       return NextResponse.json({ error: "Un livreur doit être assigné pour confirmer la commande." }, { status: 400 });
    }

    const now = new Date().toISOString();

    // 2. Construire les données de mise à jour
    const updateData: any = {
      status,
      updated_at: now,
    };

    // Cash collecté (livreur)
    if (cashCollected !== undefined) updateData.cash_collected = parseInt(cashCollected);
    if (deliveryFee !== undefined) updateData.cash_from_customer = parseInt(deliveryFee);
    if (deliveryFeeIncluded !== undefined) updateData.is_included_in_total = deliveryFeeIncluded;
    if (note !== undefined) updateData.note = note;
    
    // Annulation / Report
    if (status === 'Annulé') {
        updateData.cancelled_at = now;
        if (cancellationReason) updateData.cancellation_reason = cancellationReason;
    }
    if (status === 'Programmé') {
        if (rescheduledTo) updateData.rescheduled_to = rescheduledTo;
        if (rescheduledReason) updateData.rescheduled_reason = rescheduledReason;
    }

    // Assigner le closer ou livreur
    if (status === 'Confirmé' && userId) updateData.closer_id = userId;
    if (status === 'Confirmé' || livreurId !== undefined) {
      updateData.livreur_id = livreurId !== undefined ? livreurId : order.livreur_id;
    }
    
    // Timestamps Lifecycle
    if (status === 'Confirmé' && previousStatus !== 'Confirmé') {
        updateData.confirmed_assigned_at = now;
        updateData.assigned_at = now;
    }
    if (status === 'Livré') {
        updateData.delivered_at = now;
    }


    // 3. GAINS (Enregistrés directement dans la commande)
    // Fetch dynamic rates from User table
    let closerCommissionConfirm = 500;
    let closerCommissionDeliver = 500;
    let livreurCommissionDelivery = 1500;

    let userRole = 'ADMIN';
    let userName = 'User';

    if (userId) {
      const { data: userProfile } = await supabase.from('User').select('name, role, commissionPerConfirm, commissionPerDeliver').eq('id', userId).single();
      if (userProfile) {
        userRole = userProfile.role;
        userName = userProfile.name || 'User';
        if (userProfile.role === 'CLOSER') {
          closerCommissionConfirm = userProfile.commissionPerConfirm || 500;
          closerCommissionDeliver = userProfile.commissionPerDeliver || 500;
        } else if (userProfile.role === 'LIVREUR') {
          livreurCommissionDelivery = userProfile.commissionPerDeliver || 1500;
        }
      }
    }

    if (order.closer_id && order.closer_id !== userId) {
      // If closer is not the one doing the action, fetch closer's specific deliver bonus
      const { data: closerProfile } = await supabase.from('User').select('commissionPerDeliver, commissionPerConfirm').eq('id', order.closer_id).single();
      if (closerProfile) {
        closerCommissionDeliver = closerProfile.commissionPerDeliver || 500;
        // Also keep their confirm rate if we need to calculate total
        closerCommissionConfirm = closerProfile.commissionPerConfirm || 500;
      }
    }
    
    if (status === 'Confirmé' && previousStatus !== 'Confirmé') {
      updateData.closer_paid = closerCommissionConfirm;

      // Créditer le closer (background)
      if (userId && userRole === 'CLOSER') {
        supabase.rpc('increment_user_earnings', { target_user_id: userId, amount: closerCommissionConfirm }).then();
      } else if (order.closer_id) {
        supabase.rpc('increment_user_earnings', { target_user_id: order.closer_id, amount: closerCommissionConfirm }).then();
      }

    } else if (status === 'Livré' && previousStatus !== 'Livré') {
      updateData.closer_paid = currentCloserPaid + closerCommissionDeliver; // total closer pay
      updateData.livreur_paid = livreurCommissionDelivery;

      // Créditer le closer et le livreur (background)
      if (order.closer_id) {
        supabase.rpc('increment_user_earnings', { target_user_id: order.closer_id, amount: closerCommissionDeliver }).then();
      }
      const targetLivreurId = updateData.livreur_id || order.livreur_id;
      if (targetLivreurId) {
        supabase.rpc('increment_user_earnings', { target_user_id: targetLivreurId, amount: livreurCommissionDelivery }).then();
      }
    }

    // 4. Appliquer la mise à jour
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) throw updateError;
    
    let livreurName = '';
    if (updatedOrder.livreur_id) {
       const { data: liv } = await supabase.from('User').select('name').eq('id', updatedOrder.livreur_id).single();
       if (liv) livreurName = liv.name;
    }

    // 5. Déclencher le dispatcher unifié
    if (status === 'Confirmé' && previousStatus !== 'Confirmé') {
        await dispatch({
            type: 'confirmed',
            orderId,
            order: updatedOrder,
            actorType: userRole.toLowerCase() as any,
            actorId: userId,
            channel: 'dashboard',
            metadata: { closerName: userRole === 'CLOSER' ? userName : 'Admin', livreurName }
        });
        await dispatch({
            type: 'assigned',
            orderId,
            order: updatedOrder,
            actorType: userRole.toLowerCase() as any,
            actorId: userId,
            channel: 'dashboard',
            metadata: { livreurName }
        });
    } else if (status === 'Livré' && previousStatus !== 'Livré') {
        // Calculer durée
        let duration = '';
        if (updatedOrder.assigned_at) {
          const diffMs = Date.now() - new Date(updatedOrder.assigned_at).getTime();
          const hours = Math.floor(diffMs / 3600000);
          const mins = Math.floor((diffMs % 3600000) / 60000);
          duration = `${hours}h${String(mins).padStart(2, '0')}`;
        }
        await dispatch({
            type: 'delivered',
            orderId,
            order: updatedOrder,
            actorType: userRole.toLowerCase() as any,
            actorId: userId,
            channel: 'dashboard',
            metadata: { 
                closerName: 'Closer', // Could fetch actual closer name 
                livreurName: userRole === 'LIVREUR' ? userName : livreurName,
                deliveryDuration: duration
            }
        });
    } else if (status === 'Annulé' && previousStatus !== 'Annulé') {
        await dispatch({
            type: 'cancelled',
            orderId,
            order: updatedOrder,
            actorType: userRole.toLowerCase() as any,
            actorId: userId,
            channel: 'dashboard',
            metadata: { reason: cancellationReason || note }
        });
    } else if (status === 'Programmé' && previousStatus !== 'Programmé') {
        await dispatch({
            type: 'rescheduled',
            orderId,
            order: updatedOrder,
            actorType: userRole.toLowerCase() as any,
            actorId: userId,
            channel: 'dashboard',
            metadata: { date: rescheduledTo || note }
        });
    } else if (updatedOrder.livreur_id && updatedOrder.livreur_id !== order.livreur_id) {
         // Réassignation
         await dispatch({
            type: 'assigned',
            orderId,
            order: updatedOrder,
            actorType: userRole.toLowerCase() as any,
            actorId: userId,
            channel: 'dashboard',
            metadata: { livreurName }
        });
    }

    return NextResponse.json(updatedOrder);

  } catch (error: any) {
    console.error('Update Order Status Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
