const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== Applying all schema fixes ===");

  // 1. Add closer_paid column to orders
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "closer_paid" INTEGER DEFAULT 0;`);
    console.log("✅ Added closer_paid to orders");
  } catch (e) { console.error("closer_paid:", e.message); }

  // 2. Fix updatedAt defaults everywhere
  const updatedAtFixes = [
    { table: 'Store', col: 'updatedAt' },
    { table: 'User', col: 'updatedAt' },
    { table: 'products', col: 'updated_at' },
    { table: 'analyses', col: 'updated_at' },
  ];
  for (const fix of updatedAtFixes) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "${fix.table}" ALTER COLUMN "${fix.col}" SET DEFAULT CURRENT_TIMESTAMP;`);
      console.log(`✅ Default on ${fix.table}.${fix.col}`);
    } catch (e) { console.error(`${fix.table}.${fix.col}:`, e.message); }
  }

  // 3. Fix id defaults everywhere
  const idFixes = ['Store', 'User', 'analyses'];
  for (const table of idFixes) {
    try {
      await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;`);
      console.log(`✅ Default UUID on ${table}.id`);
    } catch (e) { console.error(`${table}.id:`, e.message); }
  }

  // 4. Create notifications table
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "read" BOOLEAN DEFAULT false,
        "target_role" TEXT DEFAULT 'ADMIN',
        "target_user_id" TEXT,
        "order_id" TEXT,
        "store_id" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log("✅ Created notifications table");
  } catch (e) { console.error("notifications:", e.message); }

  // 5. Update existing products updatedAt to now where null
  try {
    await prisma.$executeRawUnsafe(`UPDATE "products" SET "updated_at" = CURRENT_TIMESTAMP WHERE "updated_at" IS NULL;`);
    console.log("✅ Fixed null updated_at in products");
  } catch (e) { console.error("products fix:", e.message); }

  console.log("=== All fixes applied ===");
}

main().catch(console.error).finally(() => prisma.$disconnect());
