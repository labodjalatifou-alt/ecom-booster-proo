const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Creating shopify_stores table in Supabase...");
  try {
    await prisma.$executeRawUnsafe(`
      create table if not exists shopify_stores (
        id uuid primary key default gen_random_uuid(),
        shop_domain text not null unique,
        access_token text not null,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      );
    `);
    
    await prisma.$executeRawUnsafe(`
      alter table shopify_stores disable row level security;
    `);
    
    console.log("✅ Table shopify_stores successfully created / updated in Supabase!");
  } catch (err) {
    console.error("❌ Error executing migration SQL:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
