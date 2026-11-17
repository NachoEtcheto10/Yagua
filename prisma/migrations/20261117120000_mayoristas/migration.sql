-- CreateEnum
CREATE TYPE "OrderChannel" AS ENUM ('RETAIL', 'WHOLESALE');

-- CreateEnum
CREATE TYPE "WholesaleStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "channel" "OrderChannel" NOT NULL DEFAULT 'RETAIL';

-- CreateTable
CREATE TABLE "WholesaleAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "cuit" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "monthlyVolume" TEXT NOT NULL,
    "website" TEXT,
    "instagram" TEXT,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "message" TEXT,
    "status" "WholesaleStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "WholesaleAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSetting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "WholesaleAccount_userId_key" ON "WholesaleAccount"("userId");

-- CreateIndex
CREATE INDEX "WholesaleAccount_status_createdAt_idx" ON "WholesaleAccount"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "WholesaleAccount" ADD CONSTRAINT "WholesaleAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
