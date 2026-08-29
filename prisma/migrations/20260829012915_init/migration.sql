-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_tripId_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_tripId_fkey";

-- DropForeignKey
ALTER TABLE "TripMember" DROP CONSTRAINT "TripMember_tripId_fkey";

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripMember" ADD CONSTRAINT "TripMember_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
