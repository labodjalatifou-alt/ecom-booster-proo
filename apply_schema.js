const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Applying schema updates...");
  
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "orders" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'FCFA';`);
    console.log("Added currency column to orders.");
  } catch (e) {
    if (e.message.includes('already exists')) {
      console.log("Currency column already exists.");
    } else {
      console.error("Error adding currency:", e.message);
    }
  }

  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "analyses" (
          "id" TEXT NOT NULL,
          "product_name" TEXT NOT NULL,
          "score" INTEGER NOT NULL,
          "price_recommendation" TEXT NOT NULL,
          "customer_avatar" JSONB NOT NULL,
          "shopify_page_content" JSONB NOT NULL,
          "facebook_ad_content" JSONB NOT NULL,
          "voiceover_script" TEXT NOT NULL,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "analyses_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log("Created analyses table.");
  } catch (e) {
    console.error("Error creating analyses table:", e.message);
  }

  console.log("Schema applied successfully.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
