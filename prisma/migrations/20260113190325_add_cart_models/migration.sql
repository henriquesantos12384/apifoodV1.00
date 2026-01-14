-- CreateTable
CREATE TABLE "carts" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "table_id" UUID,
    "waiter_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" UUID NOT NULL,
    "cart_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_pizzas" (
    "id" UUID NOT NULL,
    "cart_id" UUID NOT NULL,
    "size_id" UUID NOT NULL,
    "border_id" UUID,
    "quantity" INTEGER NOT NULL,
    "observation" TEXT,
    "unit_price" DECIMAL(10,2),

    CONSTRAINT "cart_pizzas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_pizza_flavors" (
    "id" UUID NOT NULL,
    "cart_pizza_id" UUID NOT NULL,
    "flavor_id" UUID NOT NULL,

    CONSTRAINT "cart_pizza_flavors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "carts_table_id_key" ON "carts"("table_id");

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "restaurant_tables"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_pizzas" ADD CONSTRAINT "cart_pizzas_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_pizzas" ADD CONSTRAINT "cart_pizzas_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "pizza_sizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_pizzas" ADD CONSTRAINT "cart_pizzas_border_id_fkey" FOREIGN KEY ("border_id") REFERENCES "pizza_borders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_pizza_flavors" ADD CONSTRAINT "cart_pizza_flavors_cart_pizza_id_fkey" FOREIGN KEY ("cart_pizza_id") REFERENCES "cart_pizzas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_pizza_flavors" ADD CONSTRAINT "cart_pizza_flavors_flavor_id_fkey" FOREIGN KEY ("flavor_id") REFERENCES "pizza_flavors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
