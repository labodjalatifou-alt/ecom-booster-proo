const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  console.log("Listing users and their roles...");
  try {
    const users = await p.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        name: true
      }
    });
    console.log("Users found:", users);
  } catch (e) {
    console.error("Error fetching users:", e.message);
  }
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect());
