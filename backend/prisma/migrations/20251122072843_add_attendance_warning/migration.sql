-- CreateTable
CREATE TABLE "AttendanceWarning" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "attendancePercentage" DOUBLE PRECISION NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "sentVia" TEXT NOT NULL,

    CONSTRAINT "AttendanceWarning_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AttendanceWarning_studentId_idx" ON "AttendanceWarning"("studentId");

-- CreateIndex
CREATE INDEX "AttendanceWarning_sentAt_idx" ON "AttendanceWarning"("sentAt");

-- AddForeignKey
ALTER TABLE "AttendanceWarning" ADD CONSTRAINT "AttendanceWarning_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
