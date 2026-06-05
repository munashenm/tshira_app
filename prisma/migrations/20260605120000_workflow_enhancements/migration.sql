-- CreateTable
CREATE TABLE "UserProvinceAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "province" "Province" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserProvinceAssignment_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN "province" "Province",
ADD COLUMN "coordinatorId" TEXT,
ADD COLUMN "dcoId" TEXT,
ADD COLUMN "paymentMethod" TEXT;

-- AlterTable
ALTER TABLE "Requisition" ADD COLUMN "meetingTime" TEXT,
ADD COLUMN "meetingReference" TEXT,
ADD COLUMN "dcoId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "UserProvinceAssignment_userId_province_key" ON "UserProvinceAssignment"("userId", "province");

-- AddForeignKey
ALTER TABLE "UserProvinceAssignment" ADD CONSTRAINT "UserProvinceAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_dcoId_fkey" FOREIGN KEY ("dcoId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requisition" ADD CONSTRAINT "Requisition_dcoId_fkey" FOREIGN KEY ("dcoId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
