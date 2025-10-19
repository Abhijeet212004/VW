/*
  Warnings:

  - You are about to drop the column `boundingBox` on the `CVLog` table. All the data in the column will be lost.
  - You are about to drop the column `plateCoordinates` on the `CVLog` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SlotStatus" AS ENUM ('FREE', 'OCCUPIED', 'UNKNOWN');

-- AlterEnum
ALTER TYPE "CVEventType" ADD VALUE 'SLOT_UPDATE';

-- DropForeignKey
ALTER TABLE "CVLog" DROP CONSTRAINT "CVLog_bookingId_fkey";

-- AlterTable
ALTER TABLE "CVLog" DROP COLUMN "boundingBox",
DROP COLUMN "plateCoordinates",
ALTER COLUMN "bookingId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ParkingSlot" (
    "id" TEXT NOT NULL,
    "parkingSpotId" TEXT NOT NULL,
    "slotNumber" INTEGER NOT NULL,
    "cameraId" TEXT,
    "permanentSlotId" TEXT,
    "status" "SlotStatus" NOT NULL DEFAULT 'FREE',
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ParkingSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlotCVLog" (
    "id" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "eventType" "CVEventType" NOT NULL,
    "detectedPlate" TEXT,
    "confidence" DOUBLE PRECISION,
    "imageUrl" TEXT,
    "status" "SlotStatus" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SlotCVLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParkingSlot_permanentSlotId_key" ON "ParkingSlot"("permanentSlotId");

-- AddForeignKey
ALTER TABLE "ParkingSlot" ADD CONSTRAINT "ParkingSlot_parkingSpotId_fkey" FOREIGN KEY ("parkingSpotId") REFERENCES "ParkingSpot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlotCVLog" ADD CONSTRAINT "SlotCVLog_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "ParkingSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CVLog" ADD CONSTRAINT "CVLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
