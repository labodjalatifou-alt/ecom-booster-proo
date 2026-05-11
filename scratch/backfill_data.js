const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function backfill() {
  try {
    // 1. Create a default store if none exists
    const existingStores = await prisma.$queryRaw`SELECT * FROM "Store"`;
    let storeId;
    
    if (existingStores.length === 0) {
      console.log('No stores found. Creating a default store...');
      const newStore = await prisma.$queryRaw`
        INSERT INTO "Store" (id, name, currency, country, "shopifyUrl", "shopifyToken", "createdAt", "updatedAt")
        VALUES (
          'default-store', 
          'Ma Boutique Shopify', 
          'FCFA', 
          'Côte d''Ivoire', 
          'labostar.myshopify.com', 
          '', 
          NOW(), 
          NOW()
        )
        RETURNING id
      `;
      storeId = 'default-store';
      console.log('Created store with ID:', storeId);
    } else {
      storeId = existingStores[0].id;
      console.log('Using existing store ID:', storeId);
    }

    // 2. Link all orders to this store
    const ordersUpdate = await prisma.$executeRawUnsafe(`UPDATE "orders" SET "store_id" = $1 WHERE "store_id" IS NULL`, storeId);
    console.log(`Linked ${ordersUpdate} orders to store ${storeId}`);

    // 3. Link all products to this store
    const productsUpdate = await prisma.$executeRawUnsafe(`UPDATE "products" SET "store_id" = $1 WHERE "store_id" IS NULL`, storeId);
    console.log(`Linked ${productsUpdate} products to store ${storeId}`);

  } catch (e) {
    console.error('Backfill error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

backfill();
