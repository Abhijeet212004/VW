-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "parkingSlotId" TEXT;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_parkingSlotId_fkey" FOREIGN KEY ("parkingSlotId") REFERENCES "ParkingSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
