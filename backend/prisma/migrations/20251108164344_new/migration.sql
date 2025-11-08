-- CreateEnum
CREATE TYPE "PredictionType" AS ENUM ('SPOT_AVAILABILITY', 'AREA_RECOMMENDATION');

-- AlterTable
ALTER TABLE "ParkingSpot" ADD COLUMN     "parkingAreaId" TEXT;

-- CreateTable
CREATE TABLE "ParkingArea" (
    "id" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalSlots" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParkingArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PredictionLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parkingAreaId" TEXT NOT NULL,
    "predictionType" "PredictionType" NOT NULL,
    "inputData" JSONB NOT NULL,
    "predictedPercentage" DOUBLE PRECISION NOT NULL,
    "actualPercentage" DOUBLE PRECISION,
    "confidence" TEXT NOT NULL,
    "userLocation" JSONB NOT NULL,
    "plannedArrivalTime" TIMESTAMP(3),
    "actualArrivalTime" TIMESTAMP(3),
    "modelVersion" TEXT DEFAULT '1.0',
    "isAccurate" BOOLEAN,
    "accuracyScore" DOUBLE PRECISION,
    "weatherCondition" TEXT,
    "trafficDensity" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PredictionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OccupancySnapshot" (
    "id" TEXT NOT NULL,
    "parkingAreaId" TEXT NOT NULL,
    "totalSlots" INTEGER NOT NULL,
    "occupiedSlots" INTEGER NOT NULL,
    "freeSlots" INTEGER NOT NULL,
    "occupancyRate" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataSource" TEXT NOT NULL DEFAULT 'CV_SYSTEM',
    "weatherCondition" TEXT,
    "temperature" DOUBLE PRECISION,
    "trafficDensity" DOUBLE PRECISION,
    "isWeekend" BOOLEAN NOT NULL DEFAULT false,
    "isHoliday" BOOLEAN NOT NULL DEFAULT false,
    "eventNearby" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OccupancySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParkingArea_areaId_key" ON "ParkingArea"("areaId");

-- AddForeignKey
ALTER TABLE "ParkingSpot" ADD CONSTRAINT "ParkingSpot_parkingAreaId_fkey" FOREIGN KEY ("parkingAreaId") REFERENCES "ParkingArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PredictionLog" ADD CONSTRAINT "PredictionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PredictionLog" ADD CONSTRAINT "PredictionLog_parkingAreaId_fkey" FOREIGN KEY ("parkingAreaId") REFERENCES "ParkingArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OccupancySnapshot" ADD CONSTRAINT "OccupancySnapshot_parkingAreaId_fkey" FOREIGN KEY ("parkingAreaId") REFERENCES "ParkingArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
