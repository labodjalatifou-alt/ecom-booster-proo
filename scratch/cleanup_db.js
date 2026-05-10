const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  console.log("Cleaning up redundant columns...");
  try {
    await p.$executeRawUnsafe(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "closerId"`);
    await p.$executeRawUnsafe(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "livreurId"`);
    console.log("Redundant columns dropped.");
  } catch (e) {
    console.error("Cleanup error:", e.message);
  }
}
main().catch(console.error).finally(() => p.$disconnect());
