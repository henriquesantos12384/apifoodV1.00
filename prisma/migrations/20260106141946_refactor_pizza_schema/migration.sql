/*
  Warnings:

  - You are about to drop the column `size` on the `order_pizzas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "order_pizzas" DROP COLUMN "size",
ADD COLUMN     "border_id" UUID,
ADD COLUMN     "observation" TEXT,
ADD COLUMN     "size_id" UUID;

-- AlterTable
ALTER TABLE "pizza_flavors" ADD COLUMN     "category_id" UUID;

-- CreateTable
CREATE TABLE "order_pizza_flavors" (
    "id" UUID NOT NULL,
    "order_pizza_id" UUID NOT NULL,
    "flavor_id" UUID NOT NULL,

    CONSTRAINT "order_pizza_flavors_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pizza_flavors" ADD CONSTRAINT "pizza_flavors_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_pizzas" ADD CONSTRAINT "order_pizzas_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "pizza_sizes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_pizzas" ADD CONSTRAINT "order_pizzas_border_id_fkey" FOREIGN KEY ("border_id") REFERENCES "pizza_borders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_pizza_flavors" ADD CONSTRAINT "order_pizza_flavors_order_pizza_id_fkey" FOREIGN KEY ("order_pizza_id") REFERENCES "order_pizzas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_pizza_flavors" ADD CONSTRAINT "order_pizza_flavors_flavor_id_fkey" FOREIGN KEY ("flavor_id") REFERENCES "pizza_flavors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
