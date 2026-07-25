/**
 * Webhook Telegram — Réception messages Telegram Bot API
 * GET : Setup webhook (one-time)
 * POST : Messages entrants
 */

import { NextResponse } from 'next/server';
import { handleTelegramUpdate } from '@/lib/telegram/webhook-handler';
import { setWebhook, getMe } from '@/lib/telegram/client';

export const dynamic = 'force-dynamic';

// ---- GET: Setup webhook (appeler une seule fois) ----

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const setup = searchParams.get('setup');

  if (setup === 'true') {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN not set' }, { status: 500 });
    }

    const host = process.env.HOST || process.env.NEXT_PUBLIC_VERCEL_URL;
    if (!host) {
      return NextResponse.json({ error: 'HOST not set' }, { status: 500 });
    }

    const webhookUrl = `${host}/api/webhooks/telegram`;
    const result = await setWebhook(webhookUrl);
    const me = await getMe();

    return NextResponse.json({
      success: true,
      webhookUrl,
      bot: me,
      result,
    });
  }

  return NextResponse.json({
    status: 'Telegram webhook active',
    setup: 'Call with ?setup=true to register webhook',
  });
}

// ---- POST: Incoming Updates ----

export async function POST(req: Request) {
  try {
    const update = await req.json();

    // Traiter en arrière-plan pour répondre vite à Telegram
    handleTelegramUpdate(update).catch(err => {
      console.error('Telegram update processing error:', err);
    });

    // Telegram attend une réponse rapide
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
