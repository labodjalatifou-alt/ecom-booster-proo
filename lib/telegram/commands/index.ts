/**
 * Commandes Telegram Bot — Couche 1 (sans LLM, SQL direct)
 * Toutes les commandes structurées du bot interne
 */

import { createAdminSupabase } from '@/lib/supabase';
import { sendMessage, sendMessageWithButtons } from '../client';

const supabase = createAdminSupabase();

// ---- /stats [Nj] — statistiques commandes ----

export async function handleStats(chatId: number, args: string): Promise<void> {
  const daysMatch = args.match(/(\d+)/);
  const days = daysMatch ? parseInt(daysMatch[1]) : 7;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data: orders, error } = await supabase
    .from('orders')
    .select('status, price, currency')
    .gte('created_at', since.toISOString());

  if (error || !orders) {
    await sendMessage(chatId, '❌ Erreur lors de la récupération des stats.');
    return;
  }

  const total = orders.length;
  const byStatus: Record<string, number> = {};
  let totalRevenue = 0;

  for (const o of orders) {
    byStatus[o.status] = (byStatus[o.status] || 0) + 1;
    if (o.status === 'Livré') {
      totalRevenue += parseInt(o.price) || 0;
    }
  }

  const statusLines = Object.entries(byStatus)
    .map(([s, c]) => `  • ${s}: *${c}*`)
    .join('\n');

  const currency = orders[0]?.currency || 'FCFA';
  const text = [
    `📊 *Stats ${days} derniers jours*`,
    ``,
    `📦 Total: *${total}* commandes`,
    statusLines,
    ``,
    `💰 CA livré: *${totalRevenue.toLocaleString('fr-FR')} ${currency}*`,
    `📈 Taux de livraison: *${total > 0 ? Math.round(((byStatus['Livré'] || 0) / total) * 100) : 0}%*`,
  ].join('\n');

  await sendMessage(chatId, text);
}

// ---- /stock [produit] — recherche stock ----

export async function handleStock(chatId: number, args: string): Promise<void> {
  if (!args.trim()) {
    await sendMessage(chatId, '⚠️ Usage: `/stock nom du produit`');
    return;
  }

  const { data: products, error } = await supabase
    .from('products')
    .select('title, stock, price, currency')
    .ilike('title', `%${args.trim()}%`)
    .limit(10);

  if (error) {
    await sendMessage(chatId, '❌ Erreur lors de la recherche de stock.');
    return;
  }

  if (!products || products.length === 0) {
    await sendMessage(chatId, `🔍 Aucun produit trouvé pour "*${args.trim()}*".`);
    return;
  }

  const lines = products.map(p =>
    `📦 *${p.title}*\n  Stock: ${p.stock ?? '?'} | ${p.price} ${p.currency || 'FCFA'}`
  );

  await sendMessage(chatId, `🏪 *Résultats pour "${args.trim()}"*\n\n${lines.join('\n\n')}`);
}

// ---- /nonconfirmes — commandes en attente ----

export async function handleNonConfirmes(chatId: number): Promise<void> {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, customer, phone, city, product, price, currency, created_at')
    .eq('status', 'A Confirmer')
    .order('created_at', { ascending: false })
    .limit(15);

  if (error || !orders) {
    await sendMessage(chatId, '❌ Erreur lors de la récupération.');
    return;
  }

  if (orders.length === 0) {
    await sendMessage(chatId, '✅ Aucune commande en attente de confirmation.');
    return;
  }

  const lines = orders.map(o => {
    const ref = String(o.id).slice(-6);
    const age = getAge(o.created_at);
    return `#${ref} | ${o.customer} | ${o.city} | ${o.price} ${o.currency || ''} | ${age}`;
  });

  await sendMessage(chatId, `⏳ *Commandes à confirmer (${orders.length})*\n\n${lines.join('\n')}`);
}

// ---- /annules — commandes annulées récentes ----

export async function handleAnnules(chatId: number, args: string): Promise<void> {
  const daysMatch = args.match(/(\d+)/);
  const days = daysMatch ? parseInt(daysMatch[1]) : 7;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, customer, phone, city, product, price, currency, cancelled_at, cancellation_reason, note')
    .eq('status', 'Annulé')
    .gte('updated_at', since.toISOString())
    .order('updated_at', { ascending: false })
    .limit(20);

  if (error || !orders) {
    await sendMessage(chatId, '❌ Erreur lors de la récupération.');
    return;
  }

  if (orders.length === 0) {
    await sendMessage(chatId, `✅ Aucune annulation les ${days} derniers jours.`);
    return;
  }

  const lines = orders.map(o => {
    const ref = String(o.id).slice(-6);
    const reason = o.cancellation_reason || '—';
    return `#${ref} | ${o.customer} | ${o.phone} | ${reason}`;
  });

  await sendMessage(chatId, `❌ *Annulations (${days}j) — ${orders.length}*\n\n${lines.join('\n')}`);
}

// ---- /programmes — commandes programmées ----

export async function handleProgrammes(chatId: number): Promise<void> {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, customer, phone, city, product, price, currency, programmed_date, note')
    .eq('status', 'Programmé')
    .order('programmed_date', { ascending: true })
    .limit(20);

  if (error || !orders) {
    await sendMessage(chatId, '❌ Erreur lors de la récupération.');
    return;
  }

  if (orders.length === 0) {
    await sendMessage(chatId, '✅ Aucune commande programmée.');
    return;
  }

  const lines = orders.map(o => {
    const ref = String(o.id).slice(-6);
    const date = o.programmed_date
      ? new Date(o.programmed_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : extractDateFromNote(o.note);
    return `#${ref} | ${o.customer} | 📞 ${o.phone} | 📅 ${date || '?'}`;
  });

  await sendMessage(chatId, `📅 *Commandes programmées (${orders.length})*\n\n${lines.join('\n')}`);
}

// ---- /livreurs — performance livreurs ----

export async function handleLivreurs(chatId: number): Promise<void> {
  const { data, error } = await supabase
    .from('livreur_performance')
    .select('*');

  if (error) {
    // Vue pas encore créée ? fallback
    const { data: users } = await supabase
      .from('User')
      .select('id, name, is_available')
      .eq('role', 'LIVREUR');

    if (!users || users.length === 0) {
      await sendMessage(chatId, '🚚 Aucun livreur trouvé.');
      return;
    }

    const lines = users.map(u =>
      `${u.is_available !== false ? '🟢' : '🔴'} *${u.name}*`
    );

    await sendMessage(chatId, `🚚 *Livreurs (${users.length})*\n\n${lines.join('\n')}`);
    return;
  }

  if (!data || data.length === 0) {
    await sendMessage(chatId, '🚚 Aucun livreur trouvé.');
    return;
  }

  const lines = data.map((l: any) => {
    const rate = (l.deliveries + l.failures) > 0
      ? Math.round((l.deliveries / (l.deliveries + l.failures)) * 100)
      : 0;
    return [
      `🚚 *${l.name}*`,
      `  ✅ ${l.deliveries} livrées | ❌ ${l.failures} échecs | ${rate}%`,
      l.avg_hours_to_deliver ? `  ⏱ Moy: ${l.avg_hours_to_deliver}h | Accept: ${l.avg_minutes_to_accept || '?'}min` : '',
    ].filter(Boolean).join('\n');
  });

  await sendMessage(chatId, `🚚 *Performance livreurs*\n\n${lines.join('\n\n')}`);
}

// ---- /sav — commandes livrées J+3 sans suivi ----

export async function handleSav(chatId: number): Promise<void> {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const fourDaysAgo = new Date();
  fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, customer, phone, city, product, delivered_at')
    .eq('status', 'Livré')
    .gte('delivered_at', fourDaysAgo.toISOString())
    .lte('delivered_at', threeDaysAgo.toISOString())
    .limit(20);

  if (error || !orders) {
    await sendMessage(chatId, '❌ Erreur lors de la récupération SAV.');
    return;
  }

  if (orders.length === 0) {
    await sendMessage(chatId, '✅ Aucune commande SAV en attente (J+3).');
    return;
  }

  // Vérifier si des followups existent déjà
  const orderIds = orders.map(o => o.id);
  const { data: existingFollowups } = await supabase
    .from('pending_followups')
    .select('order_id')
    .in('order_id', orderIds)
    .eq('followup_type', 'satisfaction_j3');

  const existingOrderIds = new Set((existingFollowups || []).map((f: any) => f.order_id));
  const newOrders = orders.filter(o => !existingOrderIds.has(o.id));

  if (newOrders.length === 0) {
    await sendMessage(chatId, '✅ Toutes les relances J+3 sont déjà créées. Utilisez `/approuver` pour les envoyer.');
    return;
  }

  // Créer les pending followups
  const followups = newOrders.map(o => ({
    order_id: o.id,
    customer_phone: o.phone,
    suggested_message: `Bonjour ${o.customer} ! 🙏\n\nNous espérons que votre ${o.product} vous donne satisfaction. Si vous avez des questions ou besoin d'aide, n'hésitez pas à nous écrire ici.\n\nMerci de votre confiance ! 🌟`,
    followup_type: 'satisfaction_j3',
    status: 'awaiting_approval',
  }));

  await supabase.from('pending_followups').insert(followups);

  const lines = newOrders.map(o => {
    const ref = String(o.id).slice(-6);
    return `#${ref} | ${o.customer} | 📞 ${o.phone}`;
  });

  await sendMessage(
    chatId,
    `🔔 *SAV J+3 — ${newOrders.length} relances créées*\n\n${lines.join('\n')}\n\n👉 Utilisez \`/approuver\` pour voir et envoyer.`
  );
}

// ---- /commande [id] — détail commande ----

export async function handleCommande(chatId: number, args: string): Promise<void> {
  const idStr = args.trim();
  if (!idStr) {
    await sendMessage(chatId, '⚠️ Usage: `/commande 123456`');
    return;
  }

  // Recherche par ID complet ou par les 6 derniers chiffres
  let query = supabase.from('orders').select('*, User:closer_id(name), Livreur:livreur_id(name)');

  if (idStr.length <= 6) {
    // Recherche par suffix
    query = query.like('id', `%${idStr}`);
  } else {
    query = query.eq('id', parseInt(idStr));
  }

  const { data: orders, error } = await query.limit(1);

  if (error || !orders || orders.length === 0) {
    await sendMessage(chatId, `❌ Commande "${idStr}" non trouvée.`);
    return;
  }

  const o = orders[0];
  const ref = String(o.id).slice(-6);

  // Récupérer les événements
  const { data: events } = await supabase
    .from('order_events')
    .select('event_type, created_at, channel')
    .eq('order_id', o.id)
    .order('created_at', { ascending: true })
    .limit(10);

  const eventLines = (events || []).map((e: any) => {
    const time = new Date(e.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    return `  ${time} — ${e.event_type} (${e.channel || '?'})`;
  });

  const closerName = (o as any).User?.name || '—';
  const livreurName = (o as any).Livreur?.name || '—';

  const text = [
    `📋 *Commande #${ref}*`,
    ``,
    `📌 Statut: *${o.status}*`,
    `👤 Client: ${o.customer}`,
    `📞 ${o.phone}`,
    `📍 ${o.city}${o.address ? ` — ${o.address}` : ''}`,
    `📦 ${o.product}`,
    `💰 ${o.price} ${o.currency || ''}`,
    ``,
    `👔 Closer: ${closerName}`,
    `🚚 Livreur: ${livreurName}`,
    o.note ? `📝 Note: ${o.note.slice(0, 100)}` : '',
    ``,
    eventLines.length > 0 ? `📜 *Historique:*\n${eventLines.join('\n')}` : '',
  ].filter(Boolean).join('\n');

  await sendMessage(chatId, text);
}

// ---- /relance [id] — créer une relance ----

export async function handleRelance(chatId: number, args: string): Promise<void> {
  const idStr = args.trim();
  if (!idStr) {
    await sendMessage(chatId, '⚠️ Usage: `/relance 123456`');
    return;
  }

  let query = supabase.from('orders').select('*');
  if (idStr.length <= 6) {
    query = query.like('id', `%${idStr}`);
  } else {
    query = query.eq('id', parseInt(idStr));
  }

  const { data: orders } = await query.limit(1);
  if (!orders || orders.length === 0) {
    await sendMessage(chatId, `❌ Commande "${idStr}" non trouvée.`);
    return;
  }

  const o = orders[0];
  const ref = String(o.id).slice(-6);

  // Générer un message de relance selon le statut
  let suggestedMessage = '';
  let followupType = '';

  if (o.status === 'Annulé') {
    suggestedMessage = `Bonjour ${o.customer} ! 😊\n\nNous avions noté votre intérêt pour ${o.product}. Si vous souhaitez finaliser votre commande, nous sommes disponibles pour vous aider.\n\nBonne journée ! 🌟`;
    followupType = 'relaunch_cancelled';
  } else if (o.status === 'Programmé') {
    suggestedMessage = `Bonjour ${o.customer} ! 📅\n\nVotre commande de ${o.product} est toujours prévue. Souhaitez-vous confirmer le rendez-vous ou modifier la date ?\n\nMerci de votre confiance ! 🙏`;
    followupType = 'relaunch_scheduled';
  } else {
    suggestedMessage = `Bonjour ${o.customer} ! 👋\n\nComment allez-vous ? Nous voulions prendre de vos nouvelles concernant ${o.product}.\n\nN'hésitez pas à nous contacter si besoin ! 😊`;
    followupType = 'relaunch_general';
  }

  // Créer le followup
  const { data: followup, error } = await supabase.from('pending_followups').insert({
    order_id: o.id,
    customer_phone: o.phone,
    suggested_message: suggestedMessage,
    followup_type: followupType,
    status: 'awaiting_approval',
  }).select('id').single();

  if (error || !followup) {
    await sendMessage(chatId, '❌ Erreur lors de la création de la relance.');
    return;
  }

  const fId = followup.id.slice(-8);
  await sendMessage(
    chatId,
    `📝 *Relance créée pour #${ref}*\n\n📱 ${o.phone}\n💬 Message proposé:\n\n_${suggestedMessage}_\n\n👉 \`/approuver ${fId}\` pour envoyer`
  );
}

// ---- /approuver [id] — approuver et envoyer une relance ----

export async function handleApprouver(chatId: number, args: string): Promise<void> {
  if (!args.trim()) {
    // Lister les relances en attente
    const { data: pending } = await supabase
      .from('pending_followups')
      .select('id, order_id, customer_phone, followup_type, suggested_message, created_at')
      .eq('status', 'awaiting_approval')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!pending || pending.length === 0) {
      await sendMessage(chatId, '✅ Aucune relance en attente d\'approbation.');
      return;
    }

    const lines = pending.map(p => {
      const fId = p.id.slice(-8);
      const oRef = String(p.order_id).slice(-6);
      return `\`${fId}\` | #${oRef} | ${p.customer_phone} | ${p.followup_type}`;
    });

    await sendMessage(
      chatId,
      `📋 *Relances en attente (${pending.length})*\n\n${lines.join('\n')}\n\n👉 \`/approuver [id]\` pour envoyer`
    );
    return;
  }

  // Approuver une relance spécifique
  const fIdSuffix = args.trim();

  const { data: followups } = await supabase
    .from('pending_followups')
    .select('*')
    .eq('status', 'awaiting_approval')
    .like('id', `%${fIdSuffix}`);

  if (!followups || followups.length === 0) {
    await sendMessage(chatId, `❌ Relance "${fIdSuffix}" non trouvée ou déjà traitée.`);
    return;
  }

  const followup = followups[0];

  // Mettre en queue WhatsApp
  if (process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN) {
    await supabase.from('notification_queue').insert({
      channel: 'whatsapp',
      recipient: followup.customer_phone,
      template_name: 'approved_followup',
      payload: { message: followup.suggested_message },
      order_id: followup.order_id,
    });
  }

  // Marquer comme approuvé
  await supabase.from('pending_followups').update({
    status: 'approved',
    approved_by: String(chatId),
  }).eq('id', followup.id);

  const oRef = String(followup.order_id).slice(-6);
  await sendMessage(
    chatId,
    `✅ Relance approuvée pour commande #${oRef}\n📱 ${followup.customer_phone}\n\n_Le message sera envoyé par le prochain cycle de la queue._`
  );
}

// ---- HELPERS ----

function getAge(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  return `${Math.floor(diffHours / 24)}j`;
}

function extractDateFromNote(note: string | null): string | null {
  if (!note) return null;
  const match = note.match(/PROGRAMMÉ LE:\s*([\d-]+)/);
  return match?.[1] || null;
}
