-- CreateEnum
CREATE TYPE "PrinterType" AS ENUM ('KITCHEN', 'CASHIER', 'REPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "PrinterFormat" AS ENUM ('THERMAL_80mm', 'THERMAL_58mm', 'A4');

-- CreateTable
CREATE TABLE "printers" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "system_name" TEXT NOT NULL,
    "type" "PrinterType" NOT NULL DEFAULT 'KITCHEN',
    "format" "PrinterFormat" NOT NULL DEFAULT 'THERMAL_80mm',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "printers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "printers_company_id_idx" ON "printers"("company_id");

-- AddForeignKey
ALTER TABLE "printers" ADD CONSTRAINT "printers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
