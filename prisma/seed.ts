import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: "master", description: "Acesso total ao sistema" },
    { name: "admin", description: "Administrador da loja" },
    { name: "caixa", description: "Operador de PDV" },
    { name: "cozinha", description: "Visualização de pedidos KDS" },
    { name: "entregador", description: "App de entregas" },
    { name: "garcom", description: "Atendimento de mesas" },
  ];

  console.log("Seeding roles...");

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: {
        name: role.name,
        description: role.description,
      },
    });
    console.log(`Upserted role: ${role.name}`);
  }

  // Create default admin user
  const adminRole = await prisma.role.findUnique({ where: { name: "admin" } });

  if (adminRole) {
    const hashedPassword = await bcrypt.hash("123456", 10);

    await prisma.user.upsert({
      where: { email: "admin@admin.com" },
      update: {},
      create: {
        email: "admin@admin.com",
        fullName: "Admin User",
        passwordHash: hashedPassword,
        roleId: adminRole.id,
      },
    });
    console.log("Upserted user: admin@admin.com / 123456");
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
