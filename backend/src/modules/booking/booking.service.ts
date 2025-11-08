import { PaymentMode, BookingStatus } from '@prisma/client';
import * as bookingRepository from './booking.repository';
import * as walletService from '../wallet/wallet.service';

interface CreateBookingRequest {
  userId: string;
  vehicleId: string;
  parkingSpotId: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  pricePerHour: number;
  paymentMode: PaymentMode;
}

export const createBooking = async (data: CreateBookingRequest) => {
  const startTime = new Date(data.startTime);
  const endTime = new Date(data.endTime);
  
  // Calculate duration in minutes
  const durationMs = endTime.getTime() - startTime.getTime();
  const bookedDuration = Math.ceil(durationMs / (1000 * 60)); // minutes
  
  // Calculate amount (pricePerHour is per hour, convert duration to hours)
  const durationHours = bookedDuration / 60;
  const baseAmount = Math.ceil(durationHours * data.pricePerHour);
  
  // For prepaid bookings, check wallet balance and deduct money
  if (data.paymentMode === PaymentMode.PREPAID) {
    const walletBalance = await walletService.getWalletBalance(data.userId);
    
    if (walletBalance.availableBalance < baseAmount) {
      throw new Error('Insufficient wallet balance. Please add money to your wallet.');
    }
  }
  
  // Create booking
  const booking = await bookingRepository.createBooking({
    userId: data.userId,
    vehicleId: data.vehicleId,
    parkingSpotId: data.parkingSpotId,
    bookedStartTime: startTime,
    bookedEndTime: endTime,
    bookedDuration,
    baseAmount,
    totalAmount: baseAmount,
    paymentMode: data.paymentMode,
  });
  
  // If prepaid, deduct money from wallet
  if (data.paymentMode === PaymentMode.PREPAID) {
    await walletService.deductMoney(
      data.userId,
      baseAmount,
      `Parking booking payment - ${booking.id}`,
      booking.id
    );
    
    // Update booking status to confirmed since payment is done
    await bookingRepository.updateBookingStatus(booking.id, BookingStatus.CONFIRMED);
  }
  
  return {
    booking,
    message: data.paymentMode === PaymentMode.PREPAID 
      ? 'Booking confirmed and payment deducted from wallet'
      : 'Booking created successfully',
  };
};

export const getUserBookings = async (userId: string) => {
  const bookings = await bookingRepository.findBookingsByUserId(userId);
  
  return {
    bookings: bookings.map(booking => ({
      id: booking.id,
      vehicle: {
        registrationNumber: booking.vehicle.registrationNumber,
        make: booking.vehicle.make,
        model: booking.vehicle.model,
      },
      parkingSpot: {
        name: booking.parkingSpot.name,
        address: booking.parkingSpot.address,
      },
      bookedStartTime: booking.bookedStartTime,
      bookedEndTime: booking.bookedEndTime,
      actualEntryTime: booking.actualEntryTime,
      actualExitTime: booking.actualExitTime,
      baseAmount: booking.baseAmount,
      extraTimeAmount: booking.extraTimeAmount,
      totalAmount: booking.totalAmount,
      paymentMode: booking.paymentMode,
      paymentStatus: booking.paymentStatus,
      status: booking.status,
      createdAt: booking.createdAt,
    })),
    total: bookings.length,
  };
};

export const getBookingById = async (id: string, userId: string) => {
  const booking = await bookingRepository.findBookingById(id);
  
  if (!booking) {
    throw new Error('Booking not found');
  }
  
  if (booking.userId !== userId) {
    throw new Error('Unauthorized to view this booking');
  }
  
  return booking;
};