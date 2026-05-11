const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkColumns() {
  try {
    const ordersCols = await prisma.$queryRaw`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders'`;
    console.log('--- Orders Columns ---');
    console.table(ordersCols);

    const productsCols = await prisma.$queryRaw`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products'`;
    console.log('\n--- Products Columns ---');
    console.table(productsCols);
    
    const storeCols = await prisma.$queryRaw`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Store'`;
    console.log('\n--- Store Columns ---');
    console.table(storeCols);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkColumns();
