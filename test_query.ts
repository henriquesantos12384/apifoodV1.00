import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Testing raw query...");
    const companyId = "00000000-0000-0000-0000-000000000000"; // Dummy UUID
    const result = await prisma.$queryRaw`
      SELECT id, type FROM "pizza_flavors" LIMIT 1
    `;
    console.log("Query successful:", result);
  } catch (e) {
    console.error("Query failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
