/**
 * Cron Notification Queue Processor
 * Traite la file d'envoi (WhatsApp + Telegram) avec retry
 * Exécuté toutes les minutes ou toutes les 5 minutes
 */

import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase';
import { sendTextMessage, sendButtonMessage } from '@/lib/whatsapp/client';
import {
  sendNewOrderAdmin,
  sendNewOrderCloser,
  sendOrderAssignedLivreur,
  sendOrderConfirmedAdmin,
  sendOrderDeliveredAdmin,
  sendApprovedFollowup,
} from '@/lib/whatsapp/templates';
import { sendMessage as sendTelegramMessage } from '@/lib/telegram/client';

export const dynamic = 'force-dynamic';

const BATCH_SIZE = 20; // Traiter 20 messages à la fois

export async function GET() {
  try {
    const supabase = createAdminSupabase();

    // Récupérer les messages en attente (scheduled_for <= now)
    const { data: pending, error } = await supabase
      .from('notification_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .lt('attempts', 3)
      .order('scheduled_for', { ascending: true })
      .limit(BATCH_SIZE);

    if (error || !pending || pending.length === 0) {
      return NextResponse.json({ success: true, processed: 0 });
    }

    let processed = 0;
    let failed = 0;

    for (const item of pending) {
      try {
        // Marquer comme en cours
        await supabase
          .from('notification_queue')
          .update({ attempts: item.attempts + 1 })
          .eq('id', item.id);

        if (item.channel === 'whatsapp') {
          await processWhatsAppQueue(item);
        } else if (item.channel === 'telegram') {
          await processTelegramQueue(item);
        }

        // Marquer comme envoyé
        await supabase
          .from('notification_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
          })
          .eq('id', item.id);

        processed++;
      } catch (err: any) {
        console.error(`Queue item ${item.id} failed:`, err);

        const newAttempts = item.attempts + 1;
        const newStatus = newAttempts >= (item.max_attempts || 3) ? 'failed' : 'pending';

        // Si erreur temporaire, reprogrammer dans 5 minutes
        const reschedule = newStatus === 'pending'
          ? new Date(Date.now() + 5 * 60 * 1000).toISOString()
          : undefined;

        await supabase
          .from('notification_queue')
          .update({
            status: newStatus,
            error: err.message?.slice(0, 500),
            ...(reschedule ? { scheduled_for: reschedule } : {}),
          })
          .eq('id', item.id);

        failed++;
      }
    }

    return NextResponse.json({ success: true, processed, failed, total: pending.length });
  } catch (err: any) {
    console.error('Queue processor error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ---- WHATSAPP QUEUE PROCESSOR ----

async function processWhatsAppQueue(item: any): Promise<void> {
  const payload = item.payload;
  const order = payload?.order;

  switch (item.template_name) {
    case 'new_order_admin':
      if (order) {
        await sendNewOrderAdmin(item.recipient, order);
      }
      break;

    case 'new_order_closer':
      if (order) {
        await sendNewOrderCloser(item.recipient, order);
      }
      break;

    case 'order_assigned_livreur':
      if (order) {
        await sendOrderAssignedLivreur(item.recipient, order);
      }
      break;

    case 'order_confirmed_admin':
      if (order) {
        await sendOrderConfirmedAdmin(
          item.recipient,
          order,
          payload?.metadata?.closerName || 'Closer',
          payload?.metadata?.livreurName || 'Livreur'
        );
      }
      break;

    case 'order_delivered_admin':
      if (order) {
        await sendOrderDeliveredAdmin(item.recipient, {
          ...order,
          closerName: payload?.metadata?.closerName || 'Closer',
          livreurName: payload?.metadata?.livreurName || 'Livreur',
          deliveryDuration: payload?.metadata?.deliveryDuration,
        });
      }
      break;

    case 'approved_followup':
      if (payload?.message) {
        await sendApprovedFollowup(item.recipient, payload.message);
      }
      break;

    default:
      // Message générique
      if (payload?.message) {
        await sendTextMessage(item.recipient, payload.message);
      } else {
        console.warn(`Unknown WhatsApp template: ${item.template_name}`);
      }
  }
}

// ---- TELEGRAM QUEUE PROCESSOR ----

async function processTelegramQueue(item: any): Promise<void> {
  const payload = item.payload;

  if (payload?.message) {
    await sendTelegramMessage(
      item.recipient,
      payload.message,
      { parse_mode: payload.parse_mode || 'Markdown' }
    );
  }
}
