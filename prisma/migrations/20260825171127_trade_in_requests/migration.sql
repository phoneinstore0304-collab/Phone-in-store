-- CreateTable
CREATE TABLE "TradeInRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "model" TEXT NOT NULL,
    "storageGb" INTEGER NOT NULL,
    "batteryHealth" INTEGER NOT NULL,
    "hasOriginalBox" BOOLEAN NOT NULL,
    "hasRepairs" BOOLEAN NOT NULL,
    "repairsDetail" TEXT,
    "hasWarranty" BOOLEAN NOT NULL,
    "boughtNew" BOOLEAN NOT NULL,
    "hasFunctionalIssues" BOOLEAN NOT NULL,
    "functionalIssuesDetail" TEXT,
    "hasCosmeticDetails" BOOLEAN NOT NULL,
    "cosmeticDetailsDetail" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TradeInRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TradeInRequest" ADD CONSTRAINT "TradeInRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
