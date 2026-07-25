/**
 * API pour approuver une relance SAV depuis le Dashboard
 * Marque le followup comme approuvé et l'ajoute à la file WhatsApp
 */

import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { id, userId } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID de la relance requis' }, { status: 400 });
    }

    const supabase = createAdminSupabase();

    // 1. Récupérer la relance
    const { data: followup, error: fetchError } = await supabase
      .from('pending_followups')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !followup) {
      return NextResponse.json({ error: 'Relance non trouvée' }, { status: 404 });
    }

    if (followup.status !== 'awaiting_approval') {
      return NextResponse.json({ error: 'Cette relance a déjà été traitée' }, { status: 400 });
    }

    // 2. Ajouter à la file WhatsApp
    if (process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN) {
      const { error: queueError } = await supabase.from('notification_queue').insert({
        channel: 'whatsapp',
        recipient: followup.customer_phone,
        template_name: 'approved_followup',
        payload: { message: followup.suggested_message },
        order_id: followup.order_id,
      });

      if (queueError) {
        throw new Error(`Erreur d'insertion dans la queue: ${queueError.message}`);
      }
    } else {
      console.warn('WhatsApp credentials missing, approval recorded but message not queued.');
    }

    // 3. Mettre à jour le statut
    const { data: updated, error: updateError } = await supabase
      .from('pending_followups')
      .update({
        status: 'approved',
        approved_by: userId || 'admin',
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Approve followup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
