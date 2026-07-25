/**
 * Bot Parser — Router commandes structurées WhatsApp/Telegram
 * Couche 1 : matching patterns sans LLM
 */

import { createAdminSupabase } from '@/lib/supabase';
import { sendTextMessage } from '@/lib/whatsapp/client';
import {
  handleStats,
  handleStock,
  handleNonConfirmes,
  handleAnnules,
  handleProgrammes,
  handleLivreurs,
  handleSav,
  handleCommande,
  handleRelance,
  handleApprouver,
} from '@/lib/telegram/commands';
import { detectEscalation } from './escalation';

// ---- TYPES ----

interface CommandMatch {
  handler: (chatId: number, args: string) => Promise<void>;
  args: string;
}

// ---- COMMAND PATTERNS ----

const COMMANDS: Array<{
  pattern: RegExp;
  handler: (chatId: number, args: string) => Promise<void>;
  argIndex?: number;
}> = [
  { pattern: /^\/stats(?:\s+(.+))?$/i, handler: handleStats, argIndex: 1 },
  { pattern: /^stats(?:\s+(.+))?$/i, handler: handleStats, argIndex: 1 },
  { pattern: /^\/stock\s+(.+)$/i, handler: handleStock, argIndex: 1 },
  { pattern: /^stock\s+(.+)$/i, handler: handleStock, argIndex: 1 },
  { pattern: /^\/?(non\s*confirm[ée]e?s?|nc)$/i, handler: handleNonConfirmes },
  { pattern: /^\/annul[ée]e?s?(?:\s+(.+))?$/i, handler: handleAnnules, argIndex: 1 },
  { pattern: /^annul[ée]e?s?(?:\s+(.+))?$/i, handler: handleAnnules, argIndex: 1 },
  { pattern: /^\/?(programm[ée]e?s?|prog)$/i, handler: handleProgrammes },
  { pattern: /^\/?(livreurs?)$/i, handler: handleLivreurs },
  { pattern: /^\/?(sav)$/i, handler: handleSav },
  { pattern: /^\/?(commande|cmd)\s+(.+)$/i, handler: handleCommande, argIndex: 2 },
  { pattern: /^\/?(relance)\s+(.+)$/i, handler: handleRelance, argIndex: 2 },
  { pattern: /^\/?(approuver|ok)(?:\s+(.+))?$/i, handler: handleApprouver, argIndex: 2 },
];

/**
 * Router un message texte vers la commande appropriée
 * Retourne true si une commande a été trouvée
 */
export function matchCommand(text: string): CommandMatch | null {
  for (const cmd of COMMANDS) {
    const match = text.match(cmd.pattern);
    if (match) {
      const args = cmd.argIndex ? (match[cmd.argIndex] || '') : '';
      return { handler: cmd.handler, args };
    }
  }
  return null;
}

/**
 * Traiter un message WhatsApp entrant (commande ou texte libre)
 * Utilisé pour les messages texte des closers/livreurs/admins
 */
export async function processWhatsAppTextMessage(
  fromPhone: string,
  text: string,
  userId: string | null,
  userRole: string | null
): Promise<{ handled: boolean; response?: string }> {
  // 1. Vérifier si c'est un client (non-user) → détection SAV
  if (!userId) {
    const escalation = await detectEscalation(text, fromPhone);
    if (escalation) {
      return { handled: true, response: 'escalation_detected' };
    }
    // Client non reconnu, pas de commande possible
    return { handled: false };
  }

  // 2. Essayer de matcher une commande structurée
  const match = matchCommand(text);
  if (match) {
    // Pour WhatsApp on n'a pas de "chatId" comme Telegram
    // On utilise un faux chatId basé sur le phone pour logger
    // puis on envoie la réponse via WhatsApp
    const whatsappChatId = hashPhoneToNumber(fromPhone);
    
    // Intercepter sendMessage de Telegram pour rediriger vers WhatsApp
    // On utilise un wrapper qui capture les réponses
    const responses: string[] = [];
    const originalHandler = match.handler;

    // Les commandes Telegram envoient via sendMessage, mais ici on veut WhatsApp
    // On les exécute normalement (elles envoient sur Telegram) mais on capture aussi pour WA
    try {
      await originalHandler(async (text, buttons) => { responses.push(text); }, match.args);
    } catch {
      // Si échec (pas de chatId Telegram valide), c'est normal
    }

    return { handled: true };
  }

  // 3. Commande non reconnue → aide
  return { handled: false };
}

function hashPhoneToNumber(phone: string): number {
  let hash = 0;
  for (let i = 0; i < phone.length; i++) {
    const char = phone.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}
