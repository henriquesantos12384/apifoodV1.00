/*
  Warnings:

  - The values [COZINHA,ENTREGA,CONCLUIDO] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [MESA,BALCAO] on the enum `OrderType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `notes` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `border_id` on the `order_pizzas` table. All the data in the column will be lost.
  - You are about to drop the column `final_price` on the `order_pizzas` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `order_pizzas` table. All the data in the column will be lost.
  - You are about to drop the column `size_id` on the `order_pizzas` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryman_id` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `payment_method` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `waiter_id` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `qr_code_token` on the `restaurant_tables` table. All the data in the column will be lost.
  - You are about to drop the `order_item_additionals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_pizza_flavors` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[company_id,table_number]` on the table `restaurant_tables` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `company_id` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_price` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `order_pizzas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `order_pizzas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_price` to the `order_pizzas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit_price` to the `order_pizzas` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CashRegisterStatus" AS ENUM ('OPEN', 'CLOSED');

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDENTE', 'EM_PREPARO', 'PRONTO', 'FINALIZADO', 'CANCELADO');
ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'PENDENTE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "OrderType_new" AS ENUM ('SALAO', 'DELIVERY', 'RETIRADA');
ALTER TABLE "orders" ALTER COLUMN "order_type" TYPE "OrderType_new" USING ("order_type"::text::"OrderType_new");
ALTER TYPE "OrderType" RENAME TO "OrderType_old";
ALTER TYPE "OrderType_new" RENAME TO "OrderType";
DROP TYPE "OrderType_old";
COMMIT;

-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'VALE_REFEICAO';

-- DropForeignKey
ALTER TABLE "order_item_additionals" DROP CONSTRAINT "order_item_additionals_additional_id_fkey";

-- DropForeignKey
ALTER TABLE "order_item_additionals" DROP CONSTRAINT "order_item_additionals_order_item_id_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_order_id_fkey";

-- DropForeignKey
ALTER TABLE "order_pizza_flavors" DROP CONSTRAINT "order_pizza_flavors_flavor_id_fkey";

-- DropForeignKey
ALTER TABLE "order_pizza_flavors" DROP CONSTRAINT "order_pizza_flavors_order_pizza_id_fkey";

-- DropForeignKey
ALTER TABLE "order_pizzas" DROP CONSTRAINT "order_pizzas_border_id_fkey";

-- DropForeignKey
ALTER TABLE "order_pizzas" DROP CONSTRAINT "order_pizzas_order_id_fkey";

-- DropForeignKey
ALTER TABLE "order_pizzas" DROP CONSTRAINT "order_pizzas_size_id_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_company_id_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_deliveryman_id_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_waiter_id_fkey";

-- DropForeignKey
ALTER TABLE "restaurant_tables" DROP CONSTRAINT "restaurant_tables_company_id_fkey";

-- DropIndex
DROP INDEX "restaurant_tables_qr_code_token_key";

-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "notes",
ADD COLUMN     "company_id" UUID NOT NULL,
ADD COLUMN     "total_price" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "order_pizzas" DROP COLUMN "border_id",
DROP COLUMN "final_price",
DROP COLUMN "notes",
DROP COLUMN "size_id",
ADD COLUMN     "company_id" UUID NOT NULL,
ADD COLUMN     "size" TEXT NOT NULL,
ADD COLUMN     "total_price" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "unit_price" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "deliveryman_id",
DROP COLUMN "payment_method",
DROP COLUMN "waiter_id",
ADD COLUMN     "delivery_area_id" UUID,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "restaurant_tables" DROP COLUMN "qr_code_token",
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- DropTable
DROP TABLE "order_item_additionals";

-- DropTable
DROP TABLE "order_pizza_flavors";

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_areas" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "delivery_fee" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "delivery_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_registers" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "status" "CashRegisterStatus" NOT NULL DEFAULT 'OPEN',
    "openedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "openingAmount" DECIMAL(10,2) NOT NULL,
    "closingAmount" DECIMAL(10,2),
    "openedBy" UUID NOT NULL,
    "closedBy" UUID,

    CONSTRAINT "cash_registers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "cash_register_id" UUID,
    "method" "PaymentMethod" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receivedBy" UUID NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_company_id_phone_key" ON "customers"("company_id", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_areas_company_id_neighborhood_key" ON "delivery_areas"("company_id", "neighborhood");

-- CreateIndex
CREATE INDEX "orders_company_id_status_idx" ON "orders"("company_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_tables_company_id_table_number_key" ON "restaurant_tables"("company_id", "table_number");

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_areas" ADD CONSTRAINT "delivery_areas_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_delivery_area_id_fkey" FOREIGN KEY ("delivery_area_id") REFERENCES "delivery_areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_pizzas" ADD CONSTRAINT "order_pizzas_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_pizzas" ADD CONSTRAINT "order_pizzas_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_tables" ADD CONSTRAINT "restaurant_tables_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_registers" ADD CONSTRAINT "cash_registers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_cash_register_id_fkey" FOREIGN KEY ("cash_register_id") REFERENCES "cash_registers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_receivedBy_fkey" FOREIGN KEY ("receivedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
