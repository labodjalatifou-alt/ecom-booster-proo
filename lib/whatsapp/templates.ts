/**
 * WhatsApp Templates — envoi de templates Meta approuvés
 * Utility templates pour notifications proactives COD
 */

import { sendButtonMessage, sendTextMessage } from './client';

// ---- TYPES ----

interface OrderInfo {
  id: number | string;
  customer: string;
  phone: string;
  product: string;
  price: string | number;
  currency: string;
  city: string;
  address?: string;
  store_id?: string;
}

interface DeliveryInfo extends OrderInfo {
  closerName: string;
  livreurName: string;
  deliveryDuration?: string;
}

// ---- TEMPLATE SENDERS ----

/**
 * Notifier l'admin d'une nouvelle commande
 */
export async function sendNewOrderAdmin(adminPhone: string, order: OrderInfo) {
  const ref = String(order.id).slice(-6);
  const text = [
    `🛍️ *Nouvelle commande #${ref}*`,
    ``,
    `👤 Client: ${order.customer}`,
    `📦 Produit: ${order.product}`,
    `💰 Montant: ${order.price} ${order.currency}`,
    `📍 Ville: ${order.city}`,
    order.address ? `🏠 Adresse: ${order.address}` : '',
    `📞 Tél: ${order.phone}`,
  ].filter(Boolean).join('\n');

  return sendTextMessage(adminPhone, text);
}

/**
 * Notifier le closer d'une nouvelle commande avec boutons d'action
 */
export async function sendNewOrderCloser(closerPhone: string, order: OrderInfo) {
  const ref = String(order.id).slice(-6);
  const body = [
    `📞 Commande #${ref}`,
    `👤 ${order.customer} — ${order.city}`,
    `📦 ${order.product}`,
    `💰 ${order.price} ${order.currency}`,
    `📱 ${order.phone}`,
  ].join('\n');

  return sendButtonMessage(
    closerPhone,
    body,
    [
      { id: `confirm_${order.id}`, title: '✅ Confirmer' },
      { id: `schedule_${order.id}`, title: '📅 Programmer' },
      { id: `cancel_${order.id}`, title: '❌ Annuler' },
    ],
    'Nouvelle commande',
    'Cliquez pour agir'
  );
}

/**
 * Notifier le livreur d'une commande assignée avec boutons de suivi
 */
export async function sendOrderAssignedLivreur(livreurPhone: string, order: OrderInfo) {
  const ref = String(order.id).slice(-6);
  const body = [
    `🚚 Commande #${ref} assignée`,
    ``,
    `👤 ${order.customer}`,
    `📍 ${order.city}${order.address ? ` — ${order.address}` : ''}`,
    `📱 ${order.phone}`,
    `📦 ${order.product}`,
    `💰 ${order.price} ${order.currency}`,
  ].join('\n');

  return sendButtonMessage(
    livreurPhone,
    body,
    [
      { id: `accept_${order.id}`, title: '✅ Accepter' },
      { id: `en_route_${order.id}`, title: '🚗 En route' },
      { id: `delivered_${order.id}`, title: '📦 Livré' },
    ],
    'Livraison assignée',
    'Mettez à jour le statut'
  );
}

/**
 * Notifier l'admin qu'une commande est confirmée et assignée
 */
export async function sendOrderConfirmedAdmin(adminPhone: string, order: OrderInfo, closerName: string, livreurName: string) {
  const ref = String(order.id).slice(-6);
  const text = [
    `✅ *Commande #${ref} confirmée*`,
    ``,
    `👤 Client: ${order.customer}`,
    `📦 ${order.product} — ${order.price} ${order.currency}`,
    `📍 ${order.city}`,
    ``,
    `👔 Closer: ${closerName}`,
    `🚚 Livreur: ${livreurName}`,
  ].join('\n');

  return sendTextMessage(adminPhone, text);
}

/**
 * Notifier l'admin qu'une commande est livrée avec détails financiers
 */
export async function sendOrderDeliveredAdmin(adminPhone: string, info: DeliveryInfo) {
  const ref = String(info.id).slice(-6);
  const text = [
    `✅ *Commande #${ref} livrée*`,
    ``,
    `💰 Encaissé: ${info.price} ${info.currency}`,
    `👤 Closer: ${info.closerName}`,
    `🚚 Livreur: ${info.livreurName}`,
    info.deliveryDuration ? `⏱ Délai: ${info.deliveryDuration}` : '',
    `📍 ${info.city}`,
  ].filter(Boolean).join('\n');

  return sendTextMessage(adminPhone, text);
}

/**
 * Notification livreur — mise à jour de statut
 */
export async function sendStatusUpdateLivreur(livreurPhone: string, orderId: string | number, newStatus: string) {
  const ref = String(orderId).slice(-6);

  const statusMessages: Record<string, string> = {
    'accepted': `✅ Commande #${ref} acceptée. Allez-y quand vous êtes prêt et cliquez "En route".`,
    'en_route': `🚗 Commande #${ref} en route. Cliquez "Livré" une fois terminé.`,
    'delivered': `🎉 Commande #${ref} livrée avec succès ! Merci.`,
  };

  const text = statusMessages[newStatus] || `Commande #${ref} mise à jour: ${newStatus}`;
  return sendTextMessage(livreurPhone, text);
}

/**
 * Message SAV auto — réponse client escalade
 */
export async function sendEscalationResponse(customerPhone: string) {
  const text = `Merci pour votre message. Un responsable vous recontactera sous 24h. Votre satisfaction est notre priorité. 🙏`;
  return sendTextMessage(customerPhone, text);
}

/**
 * Envoyer une relance approuvée à un client
 */
export async function sendApprovedFollowup(customerPhone: string, message: string) {
  return sendTextMessage(customerPhone, message);
}
