const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Fields in Order model:");
  // This won't work directly to list fields, but we can try to find one and log keys
  const order = await prisma.order.findFirst();
  if (order) {
    console.log(Object.keys(order));
  } else {
    console.log("No orders found to check fields.");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
