import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Checking PizzaFlavor with include...");
    const flavors = await prisma.pizzaFlavor.findMany({
      include: {
        sizePrices: {
          include: {
            size: true,
          },
        },
      },
    });
    console.log("Flavors:", flavors);
  } catch (e) {
    console.error("Error querying PizzaFlavor:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
