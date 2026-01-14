import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking orders with status 'PRONTO_PARA_ENTREGA'...");
  try {
    // @ts-ignore
    const orders = await prisma.order.findMany({
      where: {
        // @ts-ignore
        status: "PRONTO_PARA_ENTREGA",
      },
    });
    console.log(`Found ${orders.length} orders ready for delivery.`);
    orders.forEach((o) => {
      console.log(
        `- Order ${o.id.slice(0, 8)} Status: ${o.status}, Driver: ${(o as any).driverId}, Company: ${o.companyId}`
      );
    });

    if (orders.length > 0) {
      console.log("\nTrying to query specifically with driverId: null...");
      try {
        // @ts-ignore
        const queue = await prisma.order.findMany({
          where: {
            // @ts-ignore
            status: "PRONTO_PARA_ENTREGA",
            // @ts-ignore
            driverId: null,
          },
        });
        console.log(`Found ${queue.length} orders in queue (driverId=null).`);
      } catch (e) {
        console.error("Error querying with driverId:", e.message);
      }
    }
  } catch (e) {
    console.error("Error connecting or querying:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
