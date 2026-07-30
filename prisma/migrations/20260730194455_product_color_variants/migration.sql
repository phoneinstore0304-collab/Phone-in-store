-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "color" TEXT,
ADD COLUMN     "variantGroupId" TEXT;

-- CreateIndex
CREATE INDEX "Product_variantGroupId_idx" ON "Product"("variantGroupId");
