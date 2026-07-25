/**
 * Notification Dispatcher — point d'entrée unique pour tous les événements métier
 * Dispatche vers: in-app notifications, push (FCM/Web), WhatsApp, Telegram
 */

import { createAdminSupabase } from '@/lib/supabase';
import { sendPushNotification } from '@/lib/push-helper';

// ---- TYPES ----

export type OrderEventType =
  | 'created'
  | 'confirmed'
  | 'assigned'
  | 'accepted'
  | 'en_route'
  | 'delivered'
  | 'cancelled'
  | 'rescheduled'
  | 'programmed_ready';

export interface OrderEvent {
  type: OrderEventType;
  orderId: number | string;
  order: any; // order row from DB
  actorType?: 'closer' | 'livreur' | 'admin' | 'system' | 'customer';
  actorId?: string;
  channel?: 'whatsapp' | 'dashboard' | 'telegram' | 'shopify' | 'landing';
  metadata?: Record<string, any>;
}

// ---- MAIN DISPATCHER ----

/**
 * Dispatch un événement métier vers tous les canaux appropriés
 * Appelé depuis: /api/orders/create, /api/update-order-status, webhooks WhatsApp
 */
export async function dispatch(event: OrderEvent): Promise<void> {
  const tasks = [
    insertOrderEvent(event).catch(e => console.error('order_event insert failed:', e)),
    insertInAppNotifications(event).catch(e => console.error('in-app notif failed:', e)),
    sendPushNotifications(event).catch(e => console.error('push notif failed:', e)),
    enqueueWhatsApp(event).catch(e => console.error('whatsapp enqueue failed:', e)),
    enqueueTelegram(event).catch(e => console.error('telegram enqueue failed:', e)),
  ];

  await Promise.allSettled(tasks);
}

// ---- ORDER EVENTS (audit trail) ----

async function insertOrderEvent(event: OrderEvent): Promise<void> {
  const supabase = createAdminSupabase();

  await supabase.from('order_events').insert({
    order_id: event.orderId,
    event_type: event.type,
    actor_type: event.actorType || 'system',
    actor_id: event.actorId,
    channel: event.channel || 'dashboard',
    metadata: event.metadata || {},
  });
}

// ---- IN-APP NOTIFICATIONS (existantes) ----

async function insertInAppNotifications(event: OrderEvent): Promise<void> {
  const supabase = createAdminSupabase();
  const order = event.order;
  const ref = String(event.orderId).slice(-6);
  const notifications: any[] = [];

  switch (event.type) {
    case 'created':
      notifications.push(
        {
          type: 'ORDER_CREATED',
          title: 'Nouvelle commande boutique',
          message: `${order.customer} — ${order.product} (${order.price} ${order.currency || ''}) · ${order.city}`,
          target_role: 'ADMIN',
          store_id: order.store_id,
          order_id: String(event.orderId),
        },
        {
          type: 'ORDER_CREATED',
          title: 'Commande à confirmer ☎️',
          message: `${order.customer} (${order.city}) — ${order.product}`,
          target_role: 'CLOSER',
          store_id: order.store_id,
          order_id: String(event.orderId),
        }
      );
      break;

    case 'confirmed':
      notifications.push({
        type: 'ORDER_CONFIRMED',
        title: 'Commande Confirmée',
        message: `Commande #${ref} confirmée${event.metadata?.closerName ? ` par ${event.metadata.closerName}` : ''}.${event.metadata?.livreurName ? ` Livreur: ${event.metadata.livreurName}` : ''}`,
        target_role: 'ADMIN',
        order_id: String(event.orderId),
        store_id: order.store_id,
      });
      break;

    case 'assigned':
      if (order.livreur_id) {
        notifications.push({
          type: 'ORDER_ASSIGNED',
          title: 'Livraison assignée 🚚',
          message: `Commande #${ref} — ${order.customer} (${order.city})`,
          target_user_id: order.livreur_id,
          order_id: String(event.orderId),
          store_id: order.store_id,
        });
      }
      break;

    case 'accepted':
      notifications.push({
        type: 'ORDER_ACCEPTED',
        title: 'Livreur a accepté 👍',
        message: `Commande #${ref} acceptée par le livreur.`,
        target_role: 'ADMIN',
        order_id: String(event.orderId),
        store_id: order.store_id,
      });
      break;

    case 'en_route':
      notifications.push({
        type: 'ORDER_EN_ROUTE',
        title: 'En route 🚗',
        message: `Commande #${ref} — Le livreur est en route vers ${order.customer} (${order.city}).`,
        target_role: 'ADMIN',
        order_id: String(event.orderId),
        store_id: order.store_id,
      });
      break;

    case 'delivered':
      notifications.push(
        {
          type: 'ORDER_DELIVERED',
          title: 'Commande Livrée ✅',
          message: `Commande #${ref} livrée. Cash: ${order.cash_collected || order.price} ${order.currency || ''}`,
          target_role: 'ADMIN',
          order_id: String(event.orderId),
          store_id: order.store_id,
        },
        {
          type: 'MONEY_ADDED',
          title: 'Encaissement 💰',
          message: `${order.cash_collected || order.price} ${order.currency || ''} sur commande #${ref}`,
          target_role: 'ADMIN',
          order_id: String(event.orderId),
          store_id: order.store_id,
        }
      );
      break;

    case 'cancelled':
      notifications.push({
        type: 'ORDER_CANCELLED',
        title: 'Commande Annulée ❌',
        message: `Commande #${ref} annulée.${event.metadata?.reason ? ` Raison: ${event.metadata.reason}` : ''}`,
        target_role: 'ADMIN',
        order_id: String(event.orderId),
        store_id: order.store_id,
      });
      break;

    case 'rescheduled':
      notifications.push({
        type: 'ORDER_RESCHEDULED',
        title: 'Commande Programmée 📅',
        message: `Commande #${ref} reprogrammée${event.metadata?.date ? ` au ${event.metadata.date}` : ''}.`,
        target_role: 'ADMIN',
        order_id: String(event.orderId),
        store_id: order.store_id,
      });
      break;

    case 'programmed_ready':
      notifications.push(
        {
          type: 'ORDER_PROGRAMMED_READY',
          title: '⏰ Commande Programmée Prête',
          message: `La commande de ${order.customer} est arrivée à échéance.`,
          target_role: 'ADMIN',
          order_id: String(event.orderId),
          store_id: order.store_id,
        },
        {
          type: 'ORDER_PROGRAMMED_READY',
          title: '⏰ Commande Programmée Prête',
          message: `La commande de ${order.customer} est arrivée à échéance.`,
          target_role: 'CLOSER',
          order_id: String(event.orderId),
          store_id: order.store_id,
        }
      );
      break;
  }

  if (notifications.length > 0) {
    await supabase.from('notifications').insert(notifications);
  }
}

// ---- PUSH NOTIFICATIONS ----

async function sendPushNotifications(event: OrderEvent): Promise<void> {
  const order = event.order;
  const ref = String(event.orderId).slice(-6);

  switch (event.type) {
    case 'created':
      await Promise.allSettled([
        sendPushNotification({
          role: 'CLOSER',
          title: 'Nouvelle commande à confirmer ☎️',
          body: `${order.customer} (${order.city}) attend votre appel.`,
          url: '/interface-closer',
        }),
        sendPushNotification({
          role: 'ADMIN',
          title: 'Nouvelle commande boutique 🛍️',
          body: `${order.customer} — ${order.product} (${order.price} ${order.currency || ''})`,
          url: '/commandes',
        }),
      ]);
      break;

    case 'confirmed':
      if (order.livreur_id) {
        await sendPushNotification({
          userId: order.livreur_id,
          title: 'Commande confirmée à livrer 📦',
          body: `Commande de ${order.customer} (${order.city}) est prête.`,
          url: '/interface-livreur',
        });
      }
      break;

    case 'assigned':
      if (order.livreur_id) {
        await sendPushNotification({
          userId: order.livreur_id,
          title: 'Nouvelle livraison assignée 🚚',
          body: `Commande de ${order.customer} (${order.city}) vous a été assignée.`,
          url: '/interface-livreur',
        });
      }
      break;

    case 'delivered':
      await sendPushNotification({
        role: 'ADMIN',
        title: `Commande #${ref} livrée ✅`,
        body: `${order.cash_collected || order.price} ${order.currency || ''} encaissés.`,
        url: '/commandes',
      });
      break;

    case 'cancelled':
      await sendPushNotification({
        role: 'ADMIN',
        title: `Commande #${ref} annulée ❌`,
        body: `Commande de ${order.customer} annulée.`,
        url: '/commandes',
      });
      break;
  }
}

// ---- WHATSAPP QUEUE ----

async function enqueueWhatsApp(event: OrderEvent): Promise<void> {
  // Si WhatsApp n'est pas configuré, skip silencieusement
  if (!process.env.WHATSAPP_PHONE_NUMBER_ID || !process.env.WHATSAPP_ACCESS_TOKEN) {
    return;
  }

  const supabase = createAdminSupabase();
  const order = event.order;
  const entries: any[] = [];

  // Récupérer les phones des users si besoin
  const getAdminPhones = async (): Promise<string[]> => {
    const { data } = await supabase
      .from('User')
      .select('whatsapp_phone')
      .eq('role', 'ADMIN')
      .eq('whatsapp_opt_in', true)
      .not('whatsapp_phone', 'is', null);
    return data?.map((u: any) => u.whatsapp_phone).filter(Boolean) || [];
  };

  const getUserPhone = async (userId: string): Promise<string | null> => {
    const { data } = await supabase
      .from('User')
      .select('whatsapp_phone')
      .eq('id', userId)
      .maybeSingle();
    return data?.whatsapp_phone || null;
  };

  switch (event.type) {
    case 'created': {
      const adminPhones = await getAdminPhones();
      for (const phone of adminPhones) {
        entries.push({
          channel: 'whatsapp',
          recipient: phone,
          template_name: 'new_order_admin',
          payload: { type: event.type, order },
          order_id: event.orderId,
        });
      }
      // Notifier le closer du store (si disponible)
      if (order.closer_id) {
        const closerPhone = await getUserPhone(order.closer_id);
        if (closerPhone) {
          entries.push({
            channel: 'whatsapp',
            recipient: closerPhone,
            template_name: 'new_order_closer',
            payload: { type: event.type, order },
            order_id: event.orderId,
          });
        }
      }
      break;
    }

    case 'confirmed':
    case 'assigned': {
      // Notifier le livreur assigné
      if (order.livreur_id) {
        const livreurPhone = await getUserPhone(order.livreur_id);
        if (livreurPhone) {
          entries.push({
            channel: 'whatsapp',
            recipient: livreurPhone,
            template_name: 'order_assigned_livreur',
            payload: { type: event.type, order },
            order_id: event.orderId,
          });
        }
      }
      // Notifier admin de la confirmation
      const adminPhones = await getAdminPhones();
      for (const phone of adminPhones) {
        entries.push({
          channel: 'whatsapp',
          recipient: phone,
          template_name: 'order_confirmed_admin',
          payload: { type: event.type, order, metadata: event.metadata },
          order_id: event.orderId,
        });
      }
      break;
    }

    case 'delivered': {
      const adminPhones = await getAdminPhones();
      for (const phone of adminPhones) {
        entries.push({
          channel: 'whatsapp',
          recipient: phone,
          template_name: 'order_delivered_admin',
          payload: { type: event.type, order, metadata: event.metadata },
          order_id: event.orderId,
        });
      }
      break;
    }

    case 'cancelled': {
      const adminPhones = await getAdminPhones();
      for (const phone of adminPhones) {
        entries.push({
          channel: 'whatsapp',
          recipient: phone,
          template_name: 'order_cancelled_admin',
          payload: { type: event.type, order, metadata: event.metadata },
          order_id: event.orderId,
        });
      }
      break;
    }
  }

  if (entries.length > 0) {
    await supabase.from('notification_queue').insert(entries);
  }
}

// ---- TELEGRAM QUEUE ----

async function enqueueTelegram(event: OrderEvent): Promise<void> {
  // Si Telegram n'est pas configuré, skip
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return;
  }

  const supabase = createAdminSupabase();
  const order = event.order;
  const ref = String(event.orderId).slice(-6);

  // Récupérer les chat_ids des admins
  const { data: admins } = await supabase
    .from('User')
    .select('telegram_chat_id')
    .eq('role', 'ADMIN')
    .not('telegram_chat_id', 'is', null);

  if (!admins || admins.length === 0) return;

  let message = '';

  switch (event.type) {
    case 'created':
      message = `🛍️ *Nouvelle commande #${ref}*\n👤 ${order.customer}\n📦 ${order.product}\n💰 ${order.price} ${order.currency || ''}\n📍 ${order.city}`;
      break;
    case 'confirmed':
      message = `✅ *Commande #${ref} confirmée*\n${event.metadata?.closerName ? `👔 Closer: ${event.metadata.closerName}` : ''}\n${event.metadata?.livreurName ? `🚚 Livreur: ${event.metadata.livreurName}` : ''}`;
      break;
    case 'delivered':
      message = `📦 *Commande #${ref} livrée*\n💰 ${order.cash_collected || order.price} ${order.currency || ''}\n📍 ${order.city}`;
      break;
    case 'cancelled':
      message = `❌ *Commande #${ref} annulée*\n👤 ${order.customer}\n${event.metadata?.reason ? `📝 ${event.metadata.reason}` : ''}`;
      break;
    case 'accepted':
      message = `👍 *Commande #${ref}* — Livreur a accepté`;
      break;
    case 'en_route':
      message = `🚗 *Commande #${ref}* — Livreur en route`;
      break;
    default:
      return; // Pas de notification Telegram pour les autres événements
  }

  if (!message) return;

  const entries = admins.map((admin: any) => ({
    channel: 'telegram',
    recipient: String(admin.telegram_chat_id),
    template_name: event.type,
    payload: { message, parse_mode: 'Markdown' },
    order_id: event.orderId,
  }));

  await supabase.from('notification_queue').insert(entries);
}
