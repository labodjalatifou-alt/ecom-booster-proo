const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  console.log("Creating push_subscriptions table...");
  try {
    // 1. Create push_subscriptions table
    await p.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public.push_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        endpoint TEXT NOT NULL UNIQUE,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    console.log("push_subscriptions table created successfully.");

    // 2. Disable RLS on public.push_subscriptions
    await p.$executeRawUnsafe(`
      ALTER TABLE public.push_subscriptions DISABLE ROW LEVEL SECURITY;
    `);
    console.log("RLS disabled on push_subscriptions.");
  } catch (e) {
    console.error("Error creating table:", e.message);
  }
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect());
