-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'AUTO_VERIFIED', 'MANUAL_REVIEW', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "VerificationMethod" AS ENUM ('QR_SCAN', 'MANUAL_ENTRY', 'PHOTO_OCR');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('PREPAID', 'PAY_LATER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'ACTIVE', 'OVERSTAY', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CVEventType" AS ENUM ('ENTRY', 'EXIT', 'OVERSTAY_ALERT');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('CREDIT', 'DEBIT', 'REFUND');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "profilePhoto" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "enteredName" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "color" TEXT,
    "fuelType" TEXT,
    "registrationDate" TIMESTAMP(3),
    "qrCode" TEXT,
    "numberPlatePhoto" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL,
    "verificationScore" DOUBLE PRECISION,
    "verificationMethod" "VerificationMethod" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationLog" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "rtoResponse" JSONB NOT NULL,
    "enteredName" TEXT NOT NULL,
    "rtoOwnerName" TEXT NOT NULL,
    "matchScore" DOUBLE PRECISION NOT NULL,
    "method" "VerificationMethod" NOT NULL,
    "status" "VerificationStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParkingSpot" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "totalSpots" INTEGER NOT NULL,
    "availableSpots" INTEGER NOT NULL,
    "pricePerHour" DOUBLE PRECISION NOT NULL,
    "isCovered" BOOLEAN NOT NULL DEFAULT false,
    "hasSecurity" BOOLEAN NOT NULL DEFAULT false,
    "hasEVCharging" BOOLEAN NOT NULL DEFAULT false,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "entryCameraId" TEXT,
    "exitCameraId" TEXT,
    "hasALPR" BOOLEAN NOT NULL DEFAULT false,
    "overtimePriceMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParkingSpot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "parkingSpotId" TEXT NOT NULL,
    "bookedStartTime" TIMESTAMP(3) NOT NULL,
    "bookedEndTime" TIMESTAMP(3) NOT NULL,
    "bookedDuration" INTEGER NOT NULL,
    "actualEntryTime" TIMESTAMP(3),
    "actualExitTime" TIMESTAMP(3),
    "actualDuration" INTEGER,
    "baseAmount" DOUBLE PRECISION NOT NULL,
    "extraTimeAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paymentMode" "PaymentMode" NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL,
    "paymentSource" TEXT NOT NULL DEFAULT 'WALLET',
    "status" "BookingStatus" NOT NULL,
    "entryQrCode" TEXT,
    "entryImageUrl" TEXT,
    "exitImageUrl" TEXT,
    "isOverstay" BOOLEAN NOT NULL DEFAULT false,
    "overstayMinutes" INTEGER NOT NULL DEFAULT 0,
    "overstayCharged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CVLog" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "eventType" "CVEventType" NOT NULL,
    "vehicleNumber" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cameraId" TEXT,
    "boundingBox" JSONB,
    "plateCoordinates" JSONB,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processingError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CVLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lockedBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minBalance" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "maxBalance" DOUBLE PRECISION NOT NULL DEFAULT 10000,
    "stripeCustomerId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "balanceBefore" DOUBLE PRECISION NOT NULL,
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "bookingId" TEXT,
    "stripePaymentId" TEXT,
    "description" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_registrationNumber_key" ON "Vehicle"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationLog" ADD CONSTRAINT "VerificationLog_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_parkingSpotId_fkey" FOREIGN KEY ("parkingSpotId") REFERENCES "ParkingSpot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CVLog" ADD CONSTRAINT "CVLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
