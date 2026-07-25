/**
 * Cron SAV J+3 — Créer des relances de satisfaction pour les commandes livrées il y a 3 jours
 * Exécuté quotidiennement via Vercel Cron
 */

import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminSupabase();

    // Commandes livrées il y a 3 jours
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const threeDaysAgoStart = new Date(threeDaysAgo);
    threeDaysAgoStart.setHours(0, 0, 0, 0);
    const threeDaysAgoEnd = new Date(threeDaysAgo);
    threeDaysAgoEnd.setHours(23, 59, 59, 999);

    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, customer, phone, product, delivered_at, city')
      .eq('status', 'Livré')
      .gte('delivered_at', threeDaysAgoStart.toISOString())
      .lte('delivered_at', threeDaysAgoEnd.toISOString());

    if (error || !orders || orders.length === 0) {
      return NextResponse.json({ success: true, created: 0, message: 'No orders to follow up' });
    }

    // Filtrer ceux qui ont déjà un followup
    const orderIds = orders.map(o => o.id);
    const { data: existingFollowups } = await supabase
      .from('pending_followups')
      .select('order_id')
      .in('order_id', orderIds)
      .eq('followup_type', 'satisfaction_j3');

    const existingOrderIds = new Set((existingFollowups || []).map((f: any) => f.order_id));
    const newOrders = orders.filter(o => !existingOrderIds.has(o.id));

    if (newOrders.length === 0) {
      return NextResponse.json({ success: true, created: 0, message: 'All followups already exist' });
    }

    // Créer les pending followups
    const followups = newOrders.map(o => ({
      order_id: o.id,
      customer_phone: o.phone,
      suggested_message: `Bonjour ${o.customer} ! 🙏\n\nNous espérons que votre ${o.product} vous donne entière satisfaction. Si vous avez la moindre question ou besoin d'aide, n'hésitez pas à nous écrire ici.\n\nMerci de votre confiance ! 🌟`,
      followup_type: 'satisfaction_j3',
      status: 'awaiting_approval',
    }));

    const { error: insertError } = await supabase.from('pending_followups').insert(followups);

    if (insertError) {
      console.error('SAV J+3 insert error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Notifier les admins
    await supabase.from('notifications').insert({
      type: 'SAV_J3_CREATED',
      title: `🔔 SAV J+3 — ${newOrders.length} relances`,
      message: `${newOrders.length} relances de satisfaction créées. Approuvez via Telegram (/approuver) ou le dashboard.`,
      target_role: 'ADMIN',
    });

    // Notifier via Telegram si configuré
    if (process.env.TELEGRAM_BOT_TOKEN) {
      try {
        const { data: admins } = await supabase
          .from('User')
          .select('telegram_chat_id')
          .eq('role', 'ADMIN')
          .not('telegram_chat_id', 'is', null);

        if (admins && admins.length > 0) {
          const { sendMessage } = await import('@/lib/telegram/client');
          const text = `🔔 *SAV J+3 — ${newOrders.length} relances créées*\n\nUtilisez \`/approuver\` pour voir et envoyer.`;

          for (const admin of admins) {
            await sendMessage(admin.telegram_chat_id, text);
          }
        }
      } catch (e) {
        console.error('SAV J+3 Telegram notification error:', e);
      }
    }

    return NextResponse.json({ success: true, created: newOrders.length });
  } catch (err: any) {
    console.error('SAV J+3 cron error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
