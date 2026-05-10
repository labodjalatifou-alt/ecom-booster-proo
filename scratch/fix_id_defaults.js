const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Adding database-level defaults for 'id' columns...");
  
  const tables = ['Store', 'User', 'analyses'];
  
  for (const table of tables) {
    console.log(`Processing table: ${table}`);
    try {
      // First ensure pgcrypto is available (though gen_random_uuid is built-in in PG 13+)
      await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);
      
      // Add the default
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "${table}" 
        ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
      `);
      console.log(`Successfully added default to ${table}.id`);
    } catch (e) {
      console.error(`Error processing ${table}:`, e.message);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
