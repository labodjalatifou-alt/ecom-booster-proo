/**
 * WhatsApp Webhook Handler
 * Parse les messages entrants et les boutons reply
 */

import { createAdminSupabase } from '@/lib/supabase';
import { markAsRead } from './client';

// ---- TYPES ----

export interface WhatsAppWebhookMessage {
  id: string;
  from: string;
  timestamp: string;
  type: 'text' | 'interactive' | 'image' | 'document' | 'audio' | 'video' | 'location' | 'contacts' | 'reaction';
  text?: { body: string };
  interactive?: {
    type: 'button_reply' | 'list_reply';
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string; description?: string };
  };
}

export interface WhatsAppWebhookStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  errors?: Array<{ code: number; title: string }>;
}

export interface ParsedWebhookData {
  messages: WhatsAppWebhookMessage[];
  statuses: WhatsAppWebhookStatus[];
  phoneNumberId: string;
}

/**
 * Parse le body du webhook WhatsApp Meta
 */
export function parseWebhook(body: any): ParsedWebhookData | null {
  if (body?.object !== 'whatsapp_business_account') {
    return null;
  }

  const entry = body.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;

  if (!value) return null;

  return {
    messages: value.messages || [],
    statuses: value.statuses || [],
    phoneNumberId: value.metadata?.phone_number_id || '',
  };
}

/**
 * Extraire le texte brut d'un message (texte ou bouton reply)
 */
export function extractMessageContent(msg: WhatsAppWebhookMessage): {
  text: string | null;
  buttonReplyId: string | null;
  listReplyId: string | null;
} {
  switch (msg.type) {
    case 'text':
      return { text: msg.text?.body || null, buttonReplyId: null, listReplyId: null };

    case 'interactive':
      if (msg.interactive?.type === 'button_reply') {
        return {
          text: msg.interactive.button_reply?.title || null,
          buttonReplyId: msg.interactive.button_reply?.id || null,
          listReplyId: null,
        };
      }
      if (msg.interactive?.type === 'list_reply') {
        return {
          text: msg.interactive.list_reply?.title || null,
          buttonReplyId: null,
          listReplyId: msg.interactive.list_reply?.id || null,
        };
      }
      return { text: null, buttonReplyId: null, listReplyId: null };

    default:
      return { text: null, buttonReplyId: null, listReplyId: null };
  }
}

/**
 * Vérifier idempotence — éviter de traiter le même message 2 fois
 */
export async function isMessageProcessed(waMessageId: string): Promise<boolean> {
  const supabase = createAdminSupabase();
  const { data } = await supabase
    .from('whatsapp_messages')
    .select('id')
    .eq('wa_message_id', waMessageId)
    .maybeSingle();

  return !!data;
}

/**
 * Enregistrer un message WhatsApp dans la base
 */
export async function logWhatsAppMessage(params: {
  waMessageId: string;
  direction: 'inbound' | 'outbound';
  fromPhone?: string;
  toPhone?: string;
  messageType?: string;
  payload?: any;
  orderId?: number;
  userId?: string;
  status?: string;
}): Promise<void> {
  const supabase = createAdminSupabase();

  await supabase.from('whatsapp_messages').upsert({
    wa_message_id: params.waMessageId,
    direction: params.direction,
    from_phone: params.fromPhone,
    to_phone: params.toPhone,
    message_type: params.messageType,
    payload: params.payload || {},
    order_id: params.orderId,
    user_id: params.userId,
    status: params.status || (params.direction === 'outbound' ? 'sent' : 'received'),
  }, { onConflict: 'wa_message_id' });
}

/**
 * Mettre à jour le statut d'un message sortant (delivered, read, failed)
 */
export async function updateMessageStatus(status: WhatsAppWebhookStatus): Promise<void> {
  const supabase = createAdminSupabase();

  await supabase
    .from('whatsapp_messages')
    .update({
      status: status.status,
      ...(status.errors?.length ? { payload: { errors: status.errors } } : {}),
    })
    .eq('wa_message_id', status.id);
}

/**
 * Trouver le User EcomDash associé à un numéro WhatsApp
 */
export async function findUserByPhone(phone: string): Promise<any | null> {
  const supabase = createAdminSupabase();

  // Normaliser le numéro (retirer le +, les espaces)
  const cleanPhone = phone.replace(/[\s+\-]/g, '');

  const { data } = await supabase
    .from('User')
    .select('*')
    .or(`whatsapp_phone.eq.${cleanPhone},whatsapp_phone.eq.+${cleanPhone}`)
    .maybeSingle();

  return data;
}

/**
 * Gérer les accusés de réception (mark as read côté Meta)
 */
export async function acknowledgeMessage(messageId: string): Promise<void> {
  try {
    await markAsRead(messageId);
  } catch (error) {
    console.error('Failed to mark message as read:', error);
  }
}
