const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixSchema() {
  try {
    console.log('--- Adding store_id columns ---');
    
    // Add store_id to orders
    await prisma.$executeRawUnsafe(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "store_id" TEXT`);
    console.log('Added store_id to orders');

    // Add store_id to products
    await prisma.$executeRawUnsafe(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "store_id" TEXT`);
    console.log('Added store_id to products');

    // Also check if User needs store_id or similar if it's multi-tenant
    // But for now let's focus on orders/products visibility.

    console.log('\n--- Normalizing orders table structure ---');
    // Ensure 'customer' matches what the frontend expects (sometimes mapped to customerName)
    // The current table has both 'client_name' and 'customer'. 
    // In schema.prisma it's @map("customer") for customerName.

    console.log('Schema normalization done.');

  } catch (e) {
    console.error('Error fixing schema:', e);
  } finally {
    await prisma.$disconnect();
  }
}

fixSchema();
