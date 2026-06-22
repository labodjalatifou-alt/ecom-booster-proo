const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "public_upload" 
      ON storage.objects 
      FOR INSERT 
      WITH CHECK (bucket_id = 'store-images');
    `);
    console.log("Storage INSERT policy created for store-images.");
  } catch (e) {
    if (e.message.includes('already exists')) {
      console.log("Policy already exists.");
    } else {
      console.error(e);
    }
  }

  try {
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "public_update" 
      ON storage.objects 
      FOR UPDATE
      USING (bucket_id = 'store-images');
    `);
    console.log("Storage UPDATE policy created for store-images.");
  } catch (e) {
    // Ignore already exists
  }
  
  try {
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "public_delete" 
      ON storage.objects 
      FOR DELETE
      USING (bucket_id = 'store-images');
    `);
    console.log("Storage DELETE policy created for store-images.");
  } catch (e) {
    // Ignore already exists
  }

  await prisma.$disconnect();
}

run();
