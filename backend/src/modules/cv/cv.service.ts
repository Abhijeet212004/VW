import { CVEventType } from '@prisma/client';
import { prisma } from '../../config/database';
import * as cvRepository from './cv.repository';

export const processCVEvent = async (data: {
  vehicleNumber: string;
  eventType: CVEventType;
  confidence: number;
  cameraId: string;
  imageUrl?: string;
  parkingSpotId?: string;
}) => {
  const { vehicleNumber, eventType, confidence, cameraId, imageUrl, parkingSpotId } = data;

  // Create initial CV log
  const cvLog = await cvRepository.createCVLog({
    vehicleNumber,
    eventType,
    confidence,
    cameraId,
    imageUrl,
  });

  try {
    // Find parking spot by camera ID if not provided
    let finalParkingSpotId = parkingSpotId;
    if (!finalParkingSpotId) {
      const parkingSpot = await cvRepository.findParkingSpotByCamera(cameraId);
      if (!parkingSpot) {
        throw new Error(`No parking spot found for camera ${cameraId}`);
      }
      finalParkingSpotId = parkingSpot.id;
    }

    // Find active booking for this vehicle
    const activeBooking = await cvRepository.findActiveBookingByPlate(vehicleNumber);
    
    if (!activeBooking) {
      throw new Error(`No active booking found for vehicle ${vehicleNumber}`);
    }

    // Verify the booking is for the correct parking spot
    if (activeBooking.parkingSpotId !== finalParkingSpotId) {
      throw new Error(`Vehicle ${vehicleNumber} booking is for different parking spot`);
    }

    const currentTime = new Date();
    let updatedBooking;

    if (eventType === 'ENTRY') {
      // Update booking with entry time
      updatedBooking = await cvRepository.updateBookingEntryTime(
        activeBooking.id,
        currentTime,
        imageUrl
      );
    } else if (eventType === 'EXIT') {
      // Update booking with exit time
      updatedBooking = await cvRepository.updateBookingExitTime(
        activeBooking.id,
        currentTime,
        imageUrl
      );
    }

    // Mark CV log as processed with booking ID
    await cvRepository.updateCVLogAsProcessed(cvLog.id, activeBooking.id);

    return {
      success: true,
      cvLogId: cvLog.id,
      bookingId: activeBooking.id,
      eventType,
      vehicleNumber,
      booking: updatedBooking,
      message: `${eventType} processed successfully for vehicle ${vehicleNumber}`,
    };

  } catch (error) {
    // Mark CV log as processed with error
    await cvRepository.updateCVLogAsProcessed(
      cvLog.id, 
      undefined, 
      error instanceof Error ? error.message : 'Unknown error'
    );

    throw error;
  }
};

export const processALPREvent = async (data: {
  vehicleNumber: string;
  eventType: 'ENTRY' | 'EXIT';
  confidence: number;
  cameraId: string;
  parkingSpotId: string;
  imageUrl?: string;
}) => {
  return await processCVEvent({
    ...data,
    eventType: data.eventType as CVEventType,
  });
};

export const getCVLogs = async (filters?: {
  vehicleNumber?: string;
  eventType?: CVEventType;
  processed?: boolean;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) => {
  const where: any = {};

  if (filters?.vehicleNumber) {
    where.vehicleNumber = { contains: filters.vehicleNumber, mode: 'insensitive' };
  }

  if (filters?.eventType) {
    where.eventType = filters.eventType;
  }

  if (filters?.processed !== undefined) {
    where.processed = filters.processed;
  }

  if (filters?.startDate || filters?.endDate) {
    where.timestamp = {};
    if (filters.startDate) {
      where.timestamp.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.timestamp.lte = filters.endDate;
    }
  }

  return await prisma.cVLog.findMany({
    where,
    include: {
      booking: {
        include: {
          vehicle: true,
          user: true,
          parkingSpot: true,
        }
      }
    },
    orderBy: {
      timestamp: 'desc'
    },
    take: filters?.limit || 100,
  });
};