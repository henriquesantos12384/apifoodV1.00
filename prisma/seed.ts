import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: "master", description: "Acesso total ao sistema" },
    { name: "admin", description: "Administrador da loja" },
    { name: "caixa", description: "Operador de PDV" },
    { name: "cozinha", description: "Visualização de pedidos KDS" },
    { name: "entregador", description: "App de entregas" },
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
