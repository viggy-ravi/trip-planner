-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "time",
ADD COLUMN     "endTime" TIME,
ADD COLUMN     "startTime" TIME,
ALTER COLUMN "date" DROP NOT NULL;
