/**
 * Telegram Bot API Client
 * Wrapper pour l'API Telegram Bot (100% gratuit)
 */

const TG_API_BASE = 'https://api.telegram.org';

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is required');
  return token;
}

function apiUrl(method: string): string {
  return `${TG_API_BASE}/bot${getBotToken()}/${method}`;
}

/**
 * Envoyer un message texte
 */
export async function sendMessage(
  chatId: string | number,
  text: string,
  options?: { parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML'; reply_markup?: any }
): Promise<any> {
  const body: any = {
    chat_id: chatId,
    text,
    parse_mode: options?.parse_mode || 'Markdown',
  };

  if (options?.reply_markup) {
    body.reply_markup = JSON.stringify(options.reply_markup);
  }

  const response = await fetch(apiUrl('sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!data.ok) {
    console.error('Telegram sendMessage error:', data);
    throw new Error(`Telegram API error: ${data.description}`);
  }

  return data.result;
}

/**
 * Envoyer un message avec boutons inline
 */
export async function sendMessageWithButtons(
  chatId: string | number,
  text: string,
  buttons: Array<Array<{ text: string; callback_data: string }>>,
  parseMode: 'Markdown' | 'HTML' = 'Markdown'
): Promise<any> {
  return sendMessage(chatId, text, {
    parse_mode: parseMode,
    reply_markup: {
      inline_keyboard: buttons,
    },
  });
}

/**
 * Répondre à un callback query (fermer le spinner du bouton)
 */
export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string
): Promise<void> {
  await fetch(apiUrl('answerCallbackQuery'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text: text || '',
    }),
  });
}

/**
 * Configurer le webhook Telegram
 * Appeler une seule fois au setup : /api/webhooks/telegram?setup=true
 */
export async function setWebhook(webhookUrl: string): Promise<any> {
  const response = await fetch(apiUrl('setWebhook'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: webhookUrl,
      allowed_updates: ['message', 'callback_query'],
    }),
  });

  return response.json();
}

/**
 * Obtenir les infos du bot
 */
export async function getMe(): Promise<any> {
  const response = await fetch(apiUrl('getMe'));
  const data = await response.json();
  return data.result;
}

/**
 * Escape caractères spéciaux pour MarkdownV2
 */
export function escapeMarkdownV2(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}
