/*
  Warnings:

  - You are about to drop the column `cosmeticDetailsDetail` on the `TradeInRequest` table. All the data in the column will be lost.
  - You are about to drop the column `hasCosmeticDetails` on the `TradeInRequest` table. All the data in the column will be lost.
  - Added the required column `hasBackDetail` to the `TradeInRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasBreakage` to the `TradeInRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasCameraSmudge` to the `TradeInRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasFrameDetail` to the `TradeInRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasScreenScratch` to the `TradeInRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TradeInRequest" DROP COLUMN "cosmeticDetailsDetail",
DROP COLUMN "hasCosmeticDetails",
ADD COLUMN     "breakageDetail" TEXT,
ADD COLUMN     "cosmeticNotes" TEXT,
ADD COLUMN     "hasBackDetail" BOOLEAN NOT NULL,
ADD COLUMN     "hasBreakage" BOOLEAN NOT NULL,
ADD COLUMN     "hasCameraSmudge" BOOLEAN NOT NULL,
ADD COLUMN     "hasFrameDetail" BOOLEAN NOT NULL,
ADD COLUMN     "hasScreenScratch" BOOLEAN NOT NULL,
ADD COLUMN     "needsInPersonReview" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quotedPriceUsd" INTEGER;

-- CreateTable
CREATE TABLE "TradeInModelPrice" (
    "id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "storageGb" INTEGER NOT NULL,
    "basePriceUsd" INTEGER NOT NULL,

    CONSTRAINT "TradeInModelPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TradeInModelPrice_model_storageGb_key" ON "TradeInModelPrice"("model", "storageGb");
