import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE products ADD COLUMN description TEXT, ADD COLUMN images JSONB DEFAULT \'[]\'::jsonb');
    console.log('Columns added successfully');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}
run();
