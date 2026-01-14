import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Configuring Supabase Realtime...");

  try {
    // 1. Adicionar tabelas à publicação do Realtime
    // Usamos 'catch' para ignorar erro se já estiver adicionado
    try {
      await prisma.$executeRawUnsafe(`
        ALTER PUBLICATION supabase_realtime ADD TABLE restaurant_tables;
      `);
      console.log("Added restaurant_tables to realtime publication.");
    } catch (e) {
      console.log(
        "restaurant_tables might already be in realtime publication."
      );
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER PUBLICATION supabase_realtime ADD TABLE orders;
      `);
      console.log("Added orders to realtime publication.");
    } catch (e) {
      console.log("orders might already be in realtime publication.");
    }

    // 2. Configurar RLS (Row Level Security)
    // Habilitar RLS nas tabelas (boa prática)
    await prisma.$executeRawUnsafe(
      `ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE orders ENABLE ROW LEVEL SECURITY;`
    );

    // 3. Criar políticas de leitura para 'anon' (público)
    // Como o app filtra por company_id no front, vamos permitir leitura geral para o realtime funcionar
    // Em produção, idealmente você usaria autenticação Supabase ou RLS mais restrito

    try {
      await prisma.$executeRawUnsafe(`
        CREATE POLICY "Enable read access for all users" ON "public"."restaurant_tables"
        AS PERMISSIVE FOR SELECT
        TO public
        USING (true);
      `);
      console.log("Created read policy for restaurant_tables.");
    } catch (e) {
      console.log("Policy for restaurant_tables might already exist.");
    }

    try {
      await prisma.$executeRawUnsafe(`
        CREATE POLICY "Enable read access for all users" ON "public"."orders"
        AS PERMISSIVE FOR SELECT
        TO public
        USING (true);
      `);
      console.log("Created read policy for orders.");
    } catch (e) {
      console.log("Policy for orders might already exist.");
    }

    console.log("Configuration finished successfully!");
  } catch (error) {
    console.error("Error configuring realtime:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
