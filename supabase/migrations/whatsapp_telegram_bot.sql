-- =============================================
-- EcomDash: WhatsApp + Telegram Bot Migration
-- =============================================

-- 1. Extension de la table orders (timestamps cycle de vie)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmed_assigned_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS en_route_at TIMESTAMPTZ;
-- delivered_at existe déjà

ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rescheduled_to TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rescheduled_reason TEXT;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS last_whatsapp_msg_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_opt_in_whatsapp BOOLEAN DEFAULT false;

-- 2. Extension de la table User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS telegram_chat_id BIGINT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS delivery_group_id TEXT;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_telegram_chat_id ON "User"(telegram_chat_id) WHERE telegram_chat_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_whatsapp_phone ON "User"(whatsapp_phone) WHERE whatsapp_phone IS NOT NULL;

-- 3. Table order_events (audit + stats livreurs)
CREATE TABLE IF NOT EXISTS order_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  actor_type TEXT,
  actor_id TEXT,
  channel TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON order_events(order_id);
CREATE INDEX IF NOT EXISTS idx_order_events_event_type ON order_events(event_type);

-- 4. Table whatsapp_messages (idempotence webhooks + debug)
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wa_message_id TEXT UNIQUE,
  direction TEXT NOT NULL,
  from_phone TEXT,
  to_phone TEXT,
  message_type TEXT,
  payload JSONB,
  order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
  user_id TEXT,
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wa_messages_order_id ON whatsapp_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_wa_messages_wa_id ON whatsapp_messages(wa_message_id);

-- 5. Table whatsapp_templates (cache local)
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  language TEXT DEFAULT 'fr',
  category TEXT,
  status TEXT,
  components JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. File d'envoi (retry, rate limit)
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL,
  recipient TEXT NOT NULL,
  template_name TEXT,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  scheduled_for TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ,
  error TEXT,
  order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nq_status ON notification_queue(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_nq_scheduled ON notification_queue(scheduled_for) WHERE status = 'pending';

-- 7. SAV / réclamations
CREATE TABLE IF NOT EXISTS customer_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
  customer_phone TEXT NOT NULL,
  escalation_type TEXT,
  detected_by TEXT,
  status TEXT DEFAULT 'open',
  bot_response_sent BOOLEAN DEFAULT false,
  admin_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Relances en attente de validation admin
CREATE TABLE IF NOT EXISTS pending_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
  customer_phone TEXT,
  suggested_message TEXT NOT NULL,
  followup_type TEXT,
  status TEXT DEFAULT 'awaiting_approval',
  approved_by TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pf_status ON pending_followups(status) WHERE status = 'awaiting_approval';

-- 9. Sessions bot (contexte conversation)
CREATE TABLE IF NOT EXISTS bot_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL,
  chat_id TEXT NOT NULL,
  user_id TEXT,
  current_flow TEXT,
  context JSONB DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(channel, chat_id)
);

-- 10. Vue stats livreurs
CREATE OR REPLACE VIEW livreur_performance AS
SELECT
  u.id,
  u.name,
  COUNT(*) FILTER (WHERE o.status = 'Livré') AS deliveries,
  COUNT(*) FILTER (WHERE o.status = 'Annulé' AND o.livreur_id::text = u.id::text) AS failures,
  ROUND(AVG(EXTRACT(EPOCH FROM (o.delivered_at - o.assigned_at)) / 3600)::numeric, 1) AS avg_hours_to_deliver,
  ROUND(AVG(EXTRACT(EPOCH FROM (o.accepted_at - o.assigned_at)) / 60)::numeric, 0) AS avg_minutes_to_accept
FROM "User" u
LEFT JOIN orders o ON o.livreur_id::text = u.id::text
WHERE u.role = 'LIVREUR'
GROUP BY u.id, u.name;

-- Enable Realtime on new tables
ALTER PUBLICATION supabase_realtime ADD TABLE order_events;
ALTER PUBLICATION supabase_realtime ADD TABLE notification_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE customer_escalations;
ALTER PUBLICATION supabase_realtime ADD TABLE pending_followups;

-- RLS policies (basic — allow service_role full access)
ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_sessions ENABLE ROW LEVEL SECURITY;

-- Service role bypass (all tables)
CREATE POLICY "service_role_all" ON order_events FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_all" ON whatsapp_messages FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_all" ON whatsapp_templates FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_all" ON notification_queue FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_all" ON customer_escalations FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_all" ON pending_followups FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_all" ON bot_sessions FOR ALL TO service_role USING (true);
