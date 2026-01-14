-- AlterTable
ALTER TABLE "customer_addresses" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "delivery_latitude" DOUBLE PRECISION,
ADD COLUMN     "delivery_longitude" DOUBLE PRECISION;
