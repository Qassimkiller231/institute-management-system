-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "areasForImprovement" JSONB,
ADD COLUMN     "overallPerformance" TEXT,
ADD COLUMN     "strengths" JSONB,
ADD COLUMN     "teacherComments" TEXT;

-- CreateTable
CREATE TABLE "ProgressCriteria" (
    "id" TEXT NOT NULL,
    "levelId" TEXT,
    "groupId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "orderNumber" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgressCriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentCriteriaCompletion" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "criteriaId" TEXT NOT NULL,
    "enrollmentId" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentCriteriaCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProgressCriteria_levelId_idx" ON "ProgressCriteria"("levelId");

-- CreateIndex
CREATE INDEX "ProgressCriteria_groupId_idx" ON "ProgressCriteria"("groupId");

-- CreateIndex
CREATE INDEX "ProgressCriteria_isActive_idx" ON "ProgressCriteria"("isActive");

-- CreateIndex
CREATE INDEX "StudentCriteriaCompletion_studentId_idx" ON "StudentCriteriaCompletion"("studentId");

-- CreateIndex
CREATE INDEX "StudentCriteriaCompletion_criteriaId_idx" ON "StudentCriteriaCompletion"("criteriaId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentCriteriaCompletion_studentId_criteriaId_enrollmentId_key" ON "StudentCriteriaCompletion"("studentId", "criteriaId", "enrollmentId");

-- AddForeignKey
ALTER TABLE "ProgressCriteria" ADD CONSTRAINT "ProgressCriteria_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressCriteria" ADD CONSTRAINT "ProgressCriteria_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentCriteriaCompletion" ADD CONSTRAINT "StudentCriteriaCompletion_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentCriteriaCompletion" ADD CONSTRAINT "StudentCriteriaCompletion_criteriaId_fkey" FOREIGN KEY ("criteriaId") REFERENCES "ProgressCriteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentCriteriaCompletion" ADD CONSTRAINT "StudentCriteriaCompletion_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
