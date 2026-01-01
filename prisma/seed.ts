import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const roles = ["master", "admin", "cashier", "waiter", "kitchen", "courier"];

  console.log("Seeding roles...");

  for (const roleName of roles) {
    // We use upsert to avoid duplicates if the script is run multiple times
    // However, since 'name' is not unique in the schema provided earlier (it was just String),
    // we might create duplicates if we are not careful.
    // Let's check if it exists first or just create.
    // The user didn't specify 'name' as unique in the prompt "name (TEXT: ...)",
    // but usually role names should be unique.
    // Let's check the schema I wrote.

    // In the previous turn:
    // model Role {
    //   id   String @id @default(uuid()) @db.Uuid
    //   name String // master, admin, cashier, waiter, kitchen, courier
    // ...
    // }

    // Since name is not unique, upsert by name won't work directly unless I find by name.
    // But findFirst + create is safer here.

    const existingRole = await prisma.role.findFirst({
      where: { name: roleName },
    });

    if (!existingRole) {
      await prisma.role.create({
        data: {
          name: roleName,
        },
      });
      console.log(`Created role: ${roleName}`);
    } else {
      console.log(`Role already exists: ${roleName}`);
    }
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
