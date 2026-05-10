const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tables = ['Store', 'orders', 'User', 'analyses', 'products'];
  for (const table of tables) {
    console.log(`--- Table: ${table} ---`);
    try {
      const columns = await prisma.$queryRawUnsafe(`
        SELECT column_name, data_type, column_default 
        FROM information_schema.columns 
        WHERE table_name = '${table}'
        AND column_name = 'id'
      `);
      console.log(JSON.stringify(columns, null, 2));
    } catch (e) {
      console.error(`Error querying table ${table}:`, e.message);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
