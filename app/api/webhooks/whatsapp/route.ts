/**
 * Webhook WhatsApp — Réception messages Meta Cloud API
 * GET : verification challenge
 * POST : messages entrants + status updates
 */

import { NextResponse } from 'next/server';
import {
  parseWebhook,
  extractMessageContent,
  isMessageProcessed,
  logWhatsAppMessage,
  updateMessageStatus,
  findUserByPhone,
  acknowledgeMessage,
} from '@/lib/whatsapp/webhook-handler';
import { createAdminSupabase } from '@/lib/supabase';
import { sendTextMessage, sendButtonMessage } from '@/lib/whatsapp/client';
import { sendOrderAssignedLivreur } from '@/lib/whatsapp/templates';
import { dispatch } from '@/lib/notification-dispatcher';
import { processWhatsAppTextMessage } from '@/lib/bot/parser';
import { detectEscalation } from '@/lib/bot/escalation';
import { handleAIMessage } from '@/lib/telegram/ai-handler';

export const dynamic = 'force-dynamic';

// ---- GET: Webhook Verification ----

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WhatsApp webhook verified');
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// ---- POST: Incoming Messages ----

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // DEBUG: Log everything from Meta to Supabase
    const supabase = createAdminSupabase();
    await supabase.from('notifications').insert({
      type: 'DEBUG_WA',
      title: 'WA Webhook hit',
      message: JSON.stringify(body).slice(0, 500),
      target_role: 'ADMIN',
    });

    const parsed = parseWebhook(body);

    if (!parsed) {
      return NextResponse.json({ status: 'not_whatsapp' }, { status: 200 });
    }

    // Traiter les status updates (delivered, read, failed)
    for (const status of parsed.statuses) {
      await updateMessageStatus(status);
    }

    // Traiter les messages entrants
    for (const msg of parsed.messages) {
      // Idempotence: vérifier si déjà traité
      if (await isMessageProcessed(msg.id)) {
        continue;
      }

      // Logger le message
      await logWhatsAppMessage({
        waMessageId: msg.id,
        direction: 'inbound',
        fromPhone: msg.from,
        messageType: msg.type,
        payload: msg,
      });

      // Accusé de réception
      await acknowledgeMessage(msg.id);

      // Extraire le contenu
      const content = extractMessageContent(msg);

      // Identifier l'expéditeur
      const user = await findUserByPhone(msg.from);

      // ---- Boutons reply (actions livreur/closer) ----
      if (content.buttonReplyId) {
        await handleButtonReply(content.buttonReplyId, msg.from, user);
        continue;
      }

      // ---- Liste reply ----
      if (content.listReplyId) {
        await handleListReply(content.listReplyId, msg.from, user);
        continue;
      }

      // ---- Messages texte ----
      if (content.text) {
        if (user) {
          // Utilisateur EcomDash → commandes structurées
          const result = await processWhatsAppTextMessage(
            msg.from,
            content.text,
            user.id,
            user.role
          );

          if (!result.handled) {
            // Pas une commande reconnue → envoyer à l'IA Claude
            const aiResponse = await handleAIMessage(content.text);
            await sendTextMessage(msg.from, aiResponse);
          }
        } else {
          // Client non reconnu → vérifier SAV
          await detectEscalation(content.text, msg.from);
        }
        continue;
      }
    }

    // Meta exige une réponse rapide (< 5s)
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    // Toujours retourner 200 pour éviter les re-tentatives Meta
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}

// ---- BUTTON REPLY HANDLERS ----

async function handleButtonReply(
  buttonId: string,
  fromPhone: string,
  user: any
): Promise<void> {
  const supabase = createAdminSupabase();

  // Pattern: action_orderId
  const match = buttonId.match(/^(confirm|schedule|cancel|accept|en_route|delivered|livreur)_(\d+)$/);
  if (!match) {
    console.warn('Unknown button reply ID:', buttonId);
    return;
  }

  const [, action, orderIdStr] = match;
  const orderId = parseInt(orderIdStr);

  // Récupérer la commande
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    await sendTextMessage(fromPhone, `❌ Commande #${orderIdStr.slice(-6)} non trouvée.`);
    return;
  }

  switch (action) {
    case 'confirm': {
      // Closer confirme → proposer liste de livreurs
      const { data: livreurs } = await supabase
        .from('User')
        .select('id, name')
        .eq('role', 'LIVREUR')
        .eq('is_available', true)
        .limit(10);

      if (!livreurs || livreurs.length === 0) {
        await sendTextMessage(fromPhone, '⚠️ Aucun livreur disponible. Confirmez via le dashboard.');
        return;
      }

      // Envoyer liste interactive de livreurs
      const { sendListMessage } = await import('@/lib/whatsapp/client');
      await sendListMessage(
        fromPhone,
        `Choisissez le livreur pour la commande #${orderIdStr.slice(-6)} de ${order.customer}:`,
        'Livreurs',
        [{
          title: 'Livreurs disponibles',
          rows: livreurs.map((l: any) => ({
            id: `livreur_${orderId}_${l.id}`,
            title: l.name,
            description: 'Disponible',
          })),
        }]
      );
      break;
    }

    case 'schedule': {
      await sendTextMessage(
        fromPhone,
        `📅 Pour programmer la commande #${orderIdStr.slice(-6)}, utilisez le dashboard ou tapez:\n\nprogrammer ${orderId} YYYY-MM-DD`
      );
      break;
    }

    case 'cancel': {
      // Annuler la commande
      const now = new Date().toISOString();
      await supabase.from('orders').update({
        status: 'Annulé',
        cancelled_at: now,
        cancellation_reason: 'Annulé via WhatsApp',
        updated_at: now,
      }).eq('id', orderId);

      await dispatch({
        type: 'cancelled',
        orderId,
        order: { ...order, status: 'Annulé' },
        actorType: 'closer',
        actorId: user?.id,
        channel: 'whatsapp',
        metadata: { reason: 'Annulé via WhatsApp' },
      });

      await sendTextMessage(fromPhone, `❌ Commande #${orderIdStr.slice(-6)} annulée.`);
      break;
    }

    case 'accept': {
      // Livreur accepte
      const now = new Date().toISOString();
      await supabase.from('orders').update({
        accepted_at: now,
        updated_at: now,
      }).eq('id', orderId);

      await dispatch({
        type: 'accepted',
        orderId,
        order: { ...order, accepted_at: now },
        actorType: 'livreur',
        actorId: user?.id,
        channel: 'whatsapp',
      });

      await sendButtonMessage(
        fromPhone,
        `✅ Commande #${orderIdStr.slice(-6)} acceptée. Cliquez "En route" quand vous partez.`,
        [
          { id: `en_route_${orderId}`, title: '🚗 En route' },
          { id: `delivered_${orderId}`, title: '📦 Livré' },
        ]
      );
      break;
    }

    case 'en_route': {
      // Livreur en route
      const now = new Date().toISOString();
      await supabase.from('orders').update({
        en_route_at: now,
        updated_at: now,
      }).eq('id', orderId);

      await dispatch({
        type: 'en_route',
        orderId,
        order: { ...order, en_route_at: now },
        actorType: 'livreur',
        actorId: user?.id,
        channel: 'whatsapp',
      });

      await sendButtonMessage(
        fromPhone,
        `🚗 Commande #${orderIdStr.slice(-6)} — Vous êtes en route vers ${order.customer} (${order.city}).`,
        [{ id: `delivered_${orderId}`, title: '📦 Livré' }]
      );
      break;
    }

    case 'delivered': {
      // Livreur confirme livraison
      const now = new Date().toISOString();

      // Récupérer les commissions
      let livreurCommission = 1500;
      let closerDeliverBonus = 500;

      if (user?.id) {
        const { data: livreurProfile } = await supabase
          .from('User')
          .select('commissionPerDeliver')
          .eq('id', user.id)
          .single();
        if (livreurProfile?.commissionPerDeliver) {
          livreurCommission = livreurProfile.commissionPerDeliver;
        }
      }

      if (order.closer_id) {
        const { data: closerProfile } = await supabase
          .from('User')
          .select('commissionPerDeliver')
          .eq('id', order.closer_id)
          .single();
        if (closerProfile?.commissionPerDeliver) {
          closerDeliverBonus = closerProfile.commissionPerDeliver;
        }
      }

      // Mettre à jour la commande
      await supabase.from('orders').update({
        status: 'Livré',
        delivered_at: now,
        livreur_id: user?.id || order.livreur_id,
        livreur_paid: livreurCommission,
        closer_paid: (order.closer_paid || 0) + closerDeliverBonus,
        updated_at: now,
      }).eq('id', orderId);

      // Créditer les gains
      if (user?.id) {
        await supabase.rpc('increment_user_earnings', {
          target_user_id: user.id,
          amount: livreurCommission,
        });
      }
      if (order.closer_id) {
        await supabase.rpc('increment_user_earnings', {
          target_user_id: order.closer_id,
          amount: closerDeliverBonus,
        });
      }

      // Calculer durée
      let duration = '';
      if (order.assigned_at) {
        const diffMs = Date.now() - new Date(order.assigned_at).getTime();
        const hours = Math.floor(diffMs / 3600000);
        const mins = Math.floor((diffMs % 3600000) / 60000);
        duration = `${hours}h${String(mins).padStart(2, '0')}`;
      }

      await dispatch({
        type: 'delivered',
        orderId,
        order: { ...order, status: 'Livré', delivered_at: now },
        actorType: 'livreur',
        actorId: user?.id,
        channel: 'whatsapp',
        metadata: { deliveryDuration: duration },
      });

      await sendTextMessage(
        fromPhone,
        `🎉 Commande #${orderIdStr.slice(-6)} livrée !\n💰 Commission: ${livreurCommission} ${order.currency || 'FCFA'}\n⏱ Durée: ${duration || '—'}`
      );
      break;
    }
  }
}

// ---- LIST REPLY HANDLERS ----

async function handleListReply(
  listReplyId: string,
  fromPhone: string,
  user: any
): Promise<void> {
  const supabase = createAdminSupabase();

  // Pattern: livreur_orderId_userId (sélection livreur pour confirmation)
  const match = listReplyId.match(/^livreur_(\d+)_(.+)$/);
  if (!match) {
    console.warn('Unknown list reply ID:', listReplyId);
    return;
  }

  const [, orderIdStr, livreurId] = match;
  const orderId = parseInt(orderIdStr);

  // Récupérer la commande et le livreur
  const [orderResult, livreurResult] = await Promise.all([
    supabase.from('orders').select('*').eq('id', orderId).single(),
    supabase.from('User').select('name, whatsapp_phone').eq('id', livreurId).single(),
  ]);

  if (!orderResult.data || !livreurResult.data) {
    await sendTextMessage(fromPhone, '❌ Erreur: commande ou livreur non trouvé.');
    return;
  }

  const order = orderResult.data;
  const livreur = livreurResult.data;
  const now = new Date().toISOString();

  // Récupérer la commission du closer pour confirmation
  let closerCommissionConfirm = 500;
  if (user?.id) {
    const { data: closerProfile } = await supabase
      .from('User')
      .select('commissionPerConfirm')
      .eq('id', user.id)
      .single();
    if (closerProfile?.commissionPerConfirm) {
      closerCommissionConfirm = closerProfile.commissionPerConfirm;
    }
  }

  // Mettre à jour la commande en une opération atomique
  await supabase.from('orders').update({
    status: 'Confirmé',
    closer_id: user?.id || order.closer_id,
    livreur_id: livreurId,
    confirmed_assigned_at: now,
    assigned_at: now,
    closer_paid: closerCommissionConfirm,
    updated_at: now,
  }).eq('id', orderId);

  // Créditer le closer
  if (user?.id) {
    await supabase.rpc('increment_user_earnings', {
      target_user_id: user.id,
      amount: closerCommissionConfirm,
    });
  }

  // Dispatch les événements
  const updatedOrder = { ...order, status: 'Confirmé', closer_id: user?.id, livreur_id: livreurId };

  await dispatch({
    type: 'confirmed',
    orderId,
    order: updatedOrder,
    actorType: 'closer',
    actorId: user?.id,
    channel: 'whatsapp',
    metadata: {
      closerName: user?.name || 'Closer',
      livreurName: livreur.name,
    },
  });

  await dispatch({
    type: 'assigned',
    orderId,
    order: updatedOrder,
    actorType: 'closer',
    actorId: user?.id,
    channel: 'whatsapp',
    metadata: { livreurName: livreur.name },
  });

  // Notifier le livreur via WhatsApp
  if (livreur.whatsapp_phone) {
    try {
      await sendOrderAssignedLivreur(livreur.whatsapp_phone, {
        id: orderId,
        customer: order.customer,
        phone: order.phone,
        product: order.product,
        price: order.price,
        currency: order.currency || 'FCFA',
        city: order.city,
        address: order.address,
      });
    } catch (e) {
      console.error('Failed to notify livreur via WhatsApp:', e);
    }
  }

  const ref = String(orderId).slice(-6);
  await sendTextMessage(
    fromPhone,
    `✅ Commande #${ref} confirmée !\n🚚 Livreur: ${livreur.name}\n💰 Commission: +${closerCommissionConfirm} ${order.currency || 'FCFA'}`
  );
}
