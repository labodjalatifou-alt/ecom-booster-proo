/**
 * Escalation SAV — Détection réclamations clients (Couche 1, mots-clés)
 * Pas de LLM, latence ~5ms
 */

import { createAdminSupabase } from '@/lib/supabase';
import { sendEscalationResponse } from '@/lib/whatsapp/templates';

// ---- KEYWORDS ----

const ESCALATION_KEYWORDS = [
  'défectueux', 'defectueux',
  'cassé', 'casse',
  'remboursement', 'rembourser', 'remboursez',
  'échange', 'echange', 'echanger', 'échanger',
  'produit abîmé', 'abimé', 'abime',
  'arnaque', 'arnaquer',
  'plainte',
  'réclamation', 'reclamation',
  'pas reçu', 'pas recu', 'pas recue', 'pas reçue',
  'ne fonctionne pas', 'fonctionne pas', 'marche pas',
  'mauvais produit', 'mauvaise qualité', 'mauvaise qualite',
  'déçu', 'decu', 'decevoir',
  'endommagé', 'endommage',
  'retour', 'retourner le produit',
  'faux produit', 'contrefaçon',
  'voleur', 'escroc', 'escroquerie',
];

// Expressions plus lâches qui nécessitent un contexte
const SOFT_KEYWORDS = [
  'problème', 'probleme',
  'aide', 'aidez',
  'pas satisfait', 'insatisfait',
  'désolé', 'desole',
];

// ---- DETECTION ----

export interface EscalationResult {
  detected: boolean;
  type: string;
  matchedKeywords: string[];
  confidence: 'high' | 'medium';
}

/**
 * Détecter si un message client contient une réclamation SAV
 */
export function detectKeywords(text: string): EscalationResult {
  const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const textNormalized = text.toLowerCase();

  const matchedHard: string[] = [];
  const matchedSoft: string[] = [];

  for (const keyword of ESCALATION_KEYWORDS) {
    const keyNorm = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (lower.includes(keyNorm) || textNormalized.includes(keyword)) {
      matchedHard.push(keyword);
    }
  }

  for (const keyword of SOFT_KEYWORDS) {
    const keyNorm = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (lower.includes(keyNorm) || textNormalized.includes(keyword)) {
      matchedSoft.push(keyword);
    }
  }

  // Classification
  if (matchedHard.length > 0) {
    // Déterminer le type d'escalade
    let type = 'complaint';
    if (matchedHard.some(k => ['remboursement', 'rembourser', 'remboursez'].includes(k))) type = 'refund';
    if (matchedHard.some(k => ['échange', 'echange', 'echanger', 'échanger'].includes(k))) type = 'exchange';
    if (matchedHard.some(k => ['défectueux', 'defectueux', 'cassé', 'casse', 'endommagé', 'endommage', 'abîmé', 'abimé', 'abime'].includes(k))) type = 'defect';
    if (matchedHard.some(k => ['pas reçu', 'pas recu', 'pas recue', 'pas reçue'].includes(k))) type = 'not_received';

    return {
      detected: true,
      type,
      matchedKeywords: matchedHard,
      confidence: 'high',
    };
  }

  // Soft keywords seuls = confiance moyenne, on laisse passer mais on flag
  if (matchedSoft.length >= 2) {
    return {
      detected: true,
      type: 'complaint',
      matchedKeywords: matchedSoft,
      confidence: 'medium',
    };
  }

  return {
    detected: false,
    type: '',
    matchedKeywords: [],
    confidence: 'medium',
  };
}

/**
 * Traiter une escalade détectée
 * 1. Réponse template fixe au client
 * 2. INSERT customer_escalations
 * 3. Alerte admin (WhatsApp + Telegram + dashboard)
 */
export async function detectEscalation(
  text: string,
  customerPhone: string,
  orderId?: number
): Promise<EscalationResult | null> {
  const result = detectKeywords(text);

  if (!result.detected) return null;

  const supabase = createAdminSupabase();

  // 1. Réponse client
  try {
    if (process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN) {
      await sendEscalationResponse(customerPhone);
    }
  } catch (e) {
    console.error('Failed to send escalation response:', e);
  }

  // 2. INSERT escalation
  await supabase.from('customer_escalations').insert({
    order_id: orderId || null,
    customer_phone: customerPhone,
    escalation_type: result.type,
    detected_by: 'keyword',
    status: 'open',
    bot_response_sent: true,
    admin_notified_at: new Date().toISOString(),
  });

  // 3. Alerte admin (in-app)
  await supabase.from('notifications').insert({
    type: 'SAV_ESCALATION',
    title: '⚠️ Réclamation client',
    message: `Client ${customerPhone} — ${result.type} (${result.matchedKeywords.join(', ')})`,
    target_role: 'ADMIN',
    order_id: orderId ? String(orderId) : null,
  });

  // 4. Alerte admin Telegram
  if (process.env.TELEGRAM_BOT_TOKEN) {
    const { data: admins } = await supabase
      .from('User')
      .select('telegram_chat_id')
      .eq('role', 'ADMIN')
      .not('telegram_chat_id', 'is', null);

    if (admins && admins.length > 0) {
      const { sendMessage } = await import('@/lib/telegram/client');
      const alertText = `⚠️ *ALERTE SAV*\n\n📱 Client: ${customerPhone}\n📝 Type: ${result.type}\n🔑 Mots-clés: ${result.matchedKeywords.join(', ')}\n💬 Message: _${text.slice(0, 200)}_${orderId ? `\n📦 Commande: #${String(orderId).slice(-6)}` : ''}`;

      for (const admin of admins) {
        try {
          await sendMessage(admin.telegram_chat_id, alertText);
        } catch (e) {
          console.error('Failed to send Telegram escalation alert:', e);
        }
      }
    }
  }

  return result;
}
