const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const r = await p.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'orders'`;
  console.log(JSON.stringify(r, null, 2));
}
main().catch(console.error).finally(() => p.$disconnect());
