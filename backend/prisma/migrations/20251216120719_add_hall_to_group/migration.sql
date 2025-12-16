-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "hallId" TEXT;

-- CreateIndex
CREATE INDEX "Group_hallId_idx" ON "Group"("hallId");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_hallId_fkey" FOREIGN KEY ("hallId") REFERENCES "Hall"("id") ON DELETE SET NULL ON UPDATE CASCADE;
