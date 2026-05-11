const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Running SQL via Prisma...');
    await prisma.$executeRawUnsafe(`ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Côte d''Ivoire'`);
    await prisma.$executeRawUnsafe(`UPDATE "Store" SET country = 'Côte d''Ivoire' WHERE country IS NULL`);
    console.log('Successfully added column "country" to table "Store"');
  } catch (e) {
    console.error('Error running SQL:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
