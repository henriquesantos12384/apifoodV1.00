-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'PRONTO_PARA_ENTREGA';
ALTER TYPE "OrderStatus" ADD VALUE 'SAIU_PARA_ENTREGA';
ALTER TYPE "OrderStatus" ADD VALUE 'ENTREGUE';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "driver_id" UUID;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
