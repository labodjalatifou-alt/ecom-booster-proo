const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  console.log("Updating analyses table...");
  try {
    await p.$executeRawUnsafe(`ALTER TABLE "analyses" ADD COLUMN IF NOT EXISTS "cost_price" TEXT`);
    console.log("Column cost_price added to analyses table.");
  } catch (e) {
    console.error("Update error:", e.message);
  }
}
main().catch(console.error).finally(() => p.$disconnect());
