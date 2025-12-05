/*
  Warnings:

  - You are about to drop the column `score` on the `SpeakingSlot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "duration" INTEGER;

-- AlterTable
ALTER TABLE "SpeakingSlot" DROP COLUMN "score";
