const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Applying schema updates...");
  
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'FCFA';`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "cash_collected" INTEGER;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "programmed_date" TIMESTAMP;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "commission_per_confirm" INTEGER DEFAULT 0;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "commission_per_deliver" INTEGER DEFAULT 0;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "earnings" INTEGER DEFAULT 0;`);
    console.log("Updated columns in orders and User tables.");
  } catch (e) {
    console.error("Error updating columns:", e.message);
  }

  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "analyses" (
          "id" TEXT NOT NULL,
          "product_name" TEXT NOT NULL,
          "score" INTEGER NOT NULL,
          "price_recommendation" TEXT NOT NULL,
          "cost_price" TEXT,
          "customer_avatar" JSONB NOT NULL,
          "shopify_page_content" JSONB NOT NULL,
          "facebook_ad_content" JSONB NOT NULL,
          "voiceover_script" TEXT NOT NULL,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "analyses_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log("Created/Updated analyses table.");
  } catch (e) {
    console.error("Error with analyses table:", e.message);
  }

  // Create products table for stock/inventory management
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "products" (
          "id" UUID NOT NULL DEFAULT gen_random_uuid(),
          "shopify_id" TEXT UNIQUE,
          "title" TEXT NOT NULL,
          "price" TEXT DEFAULT '0',
          "compare_price" TEXT,
          "status" TEXT DEFAULT 'active',
          "stock" INTEGER DEFAULT 0,
          "image_url" TEXT,
          "currency" TEXT DEFAULT 'FCFA',
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "products_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log("Created/Updated products table.");
  } catch (e) {
    console.error("Error with products table:", e.message);
  }

  // Add missing columns to orders
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "cash_received" BOOLEAN DEFAULT false;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "closerId" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "livreurId" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delivery_fee_included" BOOLEAN DEFAULT false;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delivery_fee" INTEGER DEFAULT 0;`);
    console.log("Added cash_received, closerId, livreurId, delivery_fee_included, delivery_fee to orders.");
  } catch (e) {
    console.error("Error adding extra order columns:", e.message);
  }

  // Add proper commission columns to User (camelCase names)
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "commissionPerConfirm" INTEGER DEFAULT 500;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "commissionPerDeliver" INTEGER DEFAULT 1000;`);
    console.log("Added commissionPerConfirm/commissionPerDeliver to User.");
  } catch (e) {
    console.error("Error adding commission columns:", e.message);
  }

  console.log("Manual schema update completed.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
