import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Testing findAll...");
    const companyId = "00000000-0000-0000-0000-000000000000"; // Replace with a valid UUID if needed, or keep dummy
    const type = undefined;

    console.log("Executing query...");
    const flavors = await prisma.$queryRaw`
      SELECT 
        id, 
        company_id as "companyId", 
        type, 
        name, 
        description, 
        is_menu as "isMenu", 
        is_active as "isActive", 
        created_at as "createdAt", 
        updated_at as "updatedAt"
      FROM "pizza_flavors"
      WHERE "company_id" = ${companyId}::uuid
      ${type ? Prisma.sql`AND "type" = ${type}` : Prisma.empty}
    `;
    console.log("Query successful:", flavors);
  } catch (e) {
    console.error("Query failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
