const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const r = await p.$queryRaw`SELECT status, count(*) FROM orders GROUP BY status`;
  const result = r.map(row => ({
    status: row.status,
    count: row.count.toString()
  }));
  console.log(JSON.stringify(result, null, 2));
}
main().catch(console.error).finally(() => p.$disconnect());
