/**
 * Telegram Webhook Handler
 * Parse les messages entrants et route vers les commandes Couche 1
 */

import { createAdminSupabase } from '@/lib/supabase';
import { sendMessage, sendMessageWithButtons } from './client';
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
} from './commands';
import { handleAIMessage } from './ai-handler';

// ---- TYPES ----

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    text?: string;
    date: number;
  };
  callback_query?: {
    id: string;
    from: {
      id: number;
      first_name: string;
    };
    message: {
      chat: {
        id: number;
      };
    };
    data: string;
  };
}

// ---- SECURITY: Whitelist ----

async function isAuthorizedUser(telegramUserId: number): Promise<boolean> {
  const supabase = createAdminSupabase();
  const { data } = await supabase
    .from('User')
    .select('id, role')
    .eq('telegram_chat_id', telegramUserId)
    .maybeSingle();

  return !!data;
}

// ---- COMMAND ROUTER ----

const HELP_TEXT = `🤖 *EcomDash Bot — Commandes disponibles*

📊 \`/stats\` ou \`/stats 7j\` — Statistiques
🏪 \`/stock produit\` — Recherche stock
⏳ \`/nonconfirmes\` — Commandes à confirmer
❌ \`/annules\` ou \`/annules 14j\` — Annulations
📅 \`/programmes\` — Commandes programmées
🚚 \`/livreurs\` — Performance livreurs
🔔 \`/sav\` — SAV J+3 (créer relances)
📋 \`/commande 123456\` — Détail commande
📝 \`/relance 123456\` — Créer une relance
✅ \`/approuver\` — Approuver relances en attente
❓ \`/help\` — Cette aide`;

export async function handleTelegramUpdate(update: TelegramUpdate): Promise<void> {
  // Message texte classique
  if (update.message?.text) {
    const chatId = update.message.chat.id;
    const userId = update.message.from.id;
    const text = update.message.text.trim();

    // Vérifier autorisation
    const authorized = await isAuthorizedUser(userId);
    if (!authorized) {
      await sendMessage(
        chatId,
        `🚫 Accès refusé. Votre Telegram ID (${userId}) n'est pas associé à un compte EcomDash.\n\nDemandez à votre admin d'ajouter votre ID.`
      );
      return;
    }

    // Parser la commande
    const match = text.match(/^\/(\w+)\s*(.*)?$/);
    if (!match) {
      // Pas une commande slash → traitement IA
      if (text.toLowerCase() === 'help' || text === '?' || text.toLowerCase() === 'aide') {
        await sendMessage(chatId, HELP_TEXT);
      } else {
        // Envoyer indicateur de frappe puis répondre avec Claude
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendChatAction`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, action: 'typing' }),
        });
        const aiResponse = await handleAIMessage(text);
        await sendMessage(chatId, aiResponse);
      }
      return;
    }

    const [, command, args] = match;
    const cleanArgs = (args || '').trim();

    try {
      switch (command.toLowerCase()) {
        case 'start':
        case 'help':
          await sendMessage(chatId, HELP_TEXT);
          break;
        case 'stats':
          await handleStats(async (text, buttons) => { if (buttons) await sendMessageWithButtons(chatId, text, buttons); else await sendMessage(chatId, text); }, cleanArgs);
          break;
        case 'stock':
          await handleStock(async (text, buttons) => { if (buttons) await sendMessageWithButtons(chatId, text, buttons); else await sendMessage(chatId, text); }, cleanArgs);
          break;
        case 'nonconfirmes':
        case 'nc':
          await handleNonConfirmes(async (text, buttons) => { if (buttons) await sendMessageWithButtons(chatId, text, buttons); else await sendMessage(chatId, text); });
          break;
        case 'annules':
          await handleAnnules(async (text, buttons) => { if (buttons) await sendMessageWithButtons(chatId, text, buttons); else await sendMessage(chatId, text); }, cleanArgs);
          break;
        case 'programmes':
        case 'prog':
          await handleProgrammes(async (text, buttons) => { if (buttons) await sendMessageWithButtons(chatId, text, buttons); else await sendMessage(chatId, text); });
          break;
        case 'livreurs':
          await handleLivreurs(async (text, buttons) => { if (buttons) await sendMessageWithButtons(chatId, text, buttons); else await sendMessage(chatId, text); });
          break;
        case 'sav':
          await handleSav(async (text, buttons) => { if (buttons) await sendMessageWithButtons(chatId, text, buttons); else await sendMessage(chatId, text); });
          break;
        case 'commande':
        case 'cmd':
          await handleCommande(async (text, buttons) => { if (buttons) await sendMessageWithButtons(chatId, text, buttons); else await sendMessage(chatId, text); }, cleanArgs);
          break;
        case 'relance':
          await handleRelance(async (text, buttons) => { if (buttons) await sendMessageWithButtons(chatId, text, buttons); else await sendMessage(chatId, text); }, cleanArgs);
          break;
        case 'approuver':
        case 'ok':
          await handleApprouver(async (text, buttons) => { if (buttons) await sendMessageWithButtons(chatId, text, buttons); else await sendMessage(chatId, text); }, cleanArgs);
          break;
        default:
          await sendMessage(chatId, `❓ Commande \`/${command}\` non reconnue. Tapez /help.`);
      }
    } catch (error) {
      console.error(`Telegram command error (/${command}):`, error);
      await sendMessage(chatId, `❌ Erreur interne. Réessayez.`);
    }

    return;
  }

  // Callback query (boutons inline)
  if (update.callback_query) {
    const chatId = update.callback_query.message.chat.id;
    const data = update.callback_query.data;

    // TODO: Gérer les callbacks inline si nécessaire
    console.log('Telegram callback_query:', data);
  }
}
