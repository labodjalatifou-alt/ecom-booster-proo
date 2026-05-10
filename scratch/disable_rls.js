const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  console.log("Disabling RLS on tables...");
  try {
    // Disable RLS on Store, Order, User, UserStore, analyses, products
    const tables = ['Store', 'orders', 'User', 'UserStore', 'analyses', 'products'];
    for (const table of tables) {
      try {
        await p.$executeRawUnsafe(`ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY;`);
        console.log(`RLS disabled on ${table}`);
      } catch (e) {
        console.warn(`Could not disable RLS on ${table}: ${e.message}`);
      }
    }
  } catch (e) {
    console.error("Critical error:", e.message);
  }
}
main().catch(console.error).finally(() => p.$disconnect());
