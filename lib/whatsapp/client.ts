/**
 * WhatsApp Cloud API Client
 * Wrapper pour l'API Meta Graph (WhatsApp Business)
 */

const WA_API_VERSION = 'v21.0';
const WA_BASE_URL = `https://graph.facebook.com/${WA_API_VERSION}`;

interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
}

function getConfig(): WhatsAppConfig {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    throw new Error('WhatsApp config missing: WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN are required');
  }

  return { phoneNumberId, accessToken };
}

/**
 * Envoyer un message texte simple
 */
export async function sendTextMessage(to: string, text: string): Promise<any> {
  const { phoneNumberId, accessToken } = getConfig();

  const response = await fetch(`${WA_BASE_URL}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { body: text },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('WhatsApp sendTextMessage error:', error);
    throw new Error(`WhatsApp API error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

/**
 * Envoyer un message interactif avec boutons (max 3)
 */
export async function sendButtonMessage(
  to: string,
  body: string,
  buttons: Array<{ id: string; title: string }>,
  header?: string,
  footer?: string
): Promise<any> {
  const { phoneNumberId, accessToken } = getConfig();

  if (buttons.length > 3) {
    throw new Error('WhatsApp buttons: max 3 boutons par message');
  }

  const interactive: any = {
    type: 'button',
    body: { text: body },
    action: {
      buttons: buttons.map(b => ({
        type: 'reply',
        reply: { id: b.id, title: b.title.slice(0, 20) }, // max 20 chars
      })),
    },
  };

  if (header) {
    interactive.header = { type: 'text', text: header };
  }
  if (footer) {
    interactive.footer = { text: footer };
  }

  const response = await fetch(`${WA_BASE_URL}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('WhatsApp sendButtonMessage error:', error);
    throw new Error(`WhatsApp API error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

/**
 * Envoyer un message avec liste interactive (max 10 items)
 */
export async function sendListMessage(
  to: string,
  body: string,
  buttonText: string,
  sections: Array<{
    title: string;
    rows: Array<{ id: string; title: string; description?: string }>;
  }>,
  header?: string,
  footer?: string
): Promise<any> {
  const { phoneNumberId, accessToken } = getConfig();

  const interactive: any = {
    type: 'list',
    body: { text: body },
    action: {
      button: buttonText.slice(0, 20),
      sections,
    },
  };

  if (header) {
    interactive.header = { type: 'text', text: header };
  }
  if (footer) {
    interactive.footer = { text: footer };
  }

  const response = await fetch(`${WA_BASE_URL}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('WhatsApp sendListMessage error:', error);
    throw new Error(`WhatsApp API error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

/**
 * Marquer un message comme lu
 */
export async function markAsRead(messageId: string): Promise<void> {
  const { phoneNumberId, accessToken } = getConfig();

  await fetch(`${WA_BASE_URL}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    }),
  });
}

/**
 * Obtenir l'URL du média (pour images, audio, documents reçus)
 */
export async function getMediaUrl(mediaId: string): Promise<string> {
  const { accessToken } = getConfig();

  const response = await fetch(`${WA_BASE_URL}/${mediaId}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to get media URL for ${mediaId}`);
  }

  const data = await response.json();
  return data.url;
}
