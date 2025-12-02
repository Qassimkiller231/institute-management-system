-- AlterTable
ALTER TABLE "SpeakingSlot" ADD COLUMN     "final_level" VARCHAR(3),
ADD COLUMN     "mcq_level" VARCHAR(3),
ADD COLUMN     "speaking_level" VARCHAR(3);

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "current_level" VARCHAR(3);
