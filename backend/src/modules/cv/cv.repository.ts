import { prisma } from '../../config/database';
import { CVEventType, BookingStatus } from '@prisma/client';

export const createCVLog = async (data: {
  vehicleNumber: string;
  eventType: CVEventType;
  confidence: Float;
  imageUrl?: string;
  cameraId?: string;
  bookingId?: string;
}) => {
  return await prisma.cVLog.create({
    data: {
      ...data,
      processed: false,
    }
  });
};

export const findActiveBookingByPlate = async (vehicleNumber: string) => {
  return await prisma.booking.findFirst({
    where: {
      vehicle: {
        registrationNumber: vehicleNumber
      },
      status: {
        in: [BookingStatus.CONFIRMED, BookingStatus.ACTIVE]
      }
    },
    include: {
      vehicle: true,
      user: true,
      parkingSpot: true,
      parkingSlot: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

export const updateBookingEntryTime = async (bookingId: string, entryTime: Date, imageUrl?: string) => {
  return await prisma.booking.update({
    where: { id: bookingId },
    data: {
      actualEntryTime: entryTime,
      status: BookingStatus.ACTIVE,
      entryImageUrl: imageUrl,
    }
  });
};

export const updateBookingExitTime = async (bookingId: string, exitTime: Date, imageUrl?: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  });
  
  if (!booking) {
    throw new Error('Booking not found');
  }

  const actualDuration = booking.actualEntryTime 
    ? Math.floor((exitTime.getTime() - booking.actualEntryTime.getTime()) / (1000 * 60))
    : null;

  return await prisma.booking.update({
    where: { id: bookingId },
    data: {
      actualExitTime: exitTime,
      actualDuration,
      status: BookingStatus.COMPLETED,
      exitImageUrl: imageUrl,
    }
  });
};

export const findParkingSpotByCamera = async (cameraId: string) => {
  return await prisma.parkingSpot.findFirst({
    where: {
      OR: [
        { entryCameraId: cameraId },
        { exitCameraId: cameraId }
      ]
    }
  });
};

export const updateCVLogAsProcessed = async (cvLogId: string, bookingId?: string, error?: string) => {
  return await prisma.cVLog.update({
    where: { id: cvLogId },
    data: {
      processed: true,
      bookingId,
      processingError: error,
    }
  });
};