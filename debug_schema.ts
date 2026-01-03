import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Checking table structure...");
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'pizza_flavors';
    `;
    console.log("Columns:", result);

    console.log("Testing SELECT query...");
    const companyId = "48befc18-623d-47ae-ba99-bb08772649f3";
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
    `;
    console.log("Query result:", flavors);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
