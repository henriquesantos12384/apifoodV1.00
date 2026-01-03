/*
  Warnings:

  - You are about to drop the column `category_id` on the `pizza_flavors` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "pizza_flavors" DROP CONSTRAINT "pizza_flavors_category_id_fkey";

-- AlterTable
ALTER TABLE "pizza_flavors" DROP COLUMN "category_id",
ADD COLUMN     "type" TEXT;
