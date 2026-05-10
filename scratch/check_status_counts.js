const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const r = await p.order.findMany({ select: { status: true } });
  const counts = r.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
  console.log(JSON.stringify(counts, null, 2));
}
main().catch(console.error).finally(() => p.$disconnect());
