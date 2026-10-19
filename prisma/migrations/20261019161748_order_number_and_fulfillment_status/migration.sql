-- AlterTable
-- SERIAL arranca la secuencia sola y numera las filas existentes en orden
-- (1, 2, 3...), así no hace falta un backfill manual aparte.
ALTER TABLE "Order" ADD COLUMN "orderNumber" SERIAL;
ALTER TABLE "Order" ADD CONSTRAINT "Order_orderNumber_key" UNIQUE ("orderNumber");

ALTER TABLE "Order" ADD COLUMN "fulfillmentStatus" TEXT NOT NULL DEFAULT 'pending';
