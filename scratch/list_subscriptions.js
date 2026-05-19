const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  console.log("Listing push subscriptions...");
  try {
    const subs = await p.pushSubscription.findMany({});
    console.log("Subscriptions found:", subs);
  } catch (e) {
    console.error("Error fetching subscriptions:", e.message);
  }
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect());
