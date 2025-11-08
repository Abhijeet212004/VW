import { PrismaClient, Booking, BookingStatus, PaymentStatus, PaymentMode } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateBookingData {
  userId: string;
  vehicleId: string;
  parkingSpotId: string;
  bookedStartTime: Date;
  bookedEndTime: Date;
  bookedDuration: number;
  baseAmount: number;
  totalAmount: number;
  paymentMode: PaymentMode;
}

export const createBooking = async (data: CreateBookingData): Promise<Booking> => {
  return await prisma.booking.create({
    data: {
      ...data,
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
    },
    include: {
      user: true,
      vehicle: true,
      parkingSpot: true,
    },
  });
};

export const findBookingsByUserId = async (userId: string) => {
  return await prisma.booking.findMany({
    where: { userId },
    include: {
      vehicle: {
        select: {
          registrationNumber: true,
          make: true,
          model: true,
        },
      },
      parkingSpot: {
        select: {
          name: true,
          address: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const findBookingById = async (id: string): Promise<Booking | null> => {
  return await prisma.booking.findUnique({
    where: { id },
    include: {
      user: true,
      vehicle: true,
      parkingSpot: true,
    },
  });
};

export const updateBookingStatus = async (
  id: string,
  status: BookingStatus,
  paymentStatus?: PaymentStatus
): Promise<Booking> => {
  return await prisma.booking.update({
    where: { id },
    data: {
      status,
      ...(paymentStatus && { paymentStatus }),
    },
  });
};

export const updateBookingEntry = async (
  id: string,
  actualEntryTime: Date,
  entryImageUrl?: string
): Promise<Booking> => {
  return await prisma.booking.update({
    where: { id },
    data: {
      actualEntryTime,
      status: BookingStatus.ACTIVE,
      ...(entryImageUrl && { entryImageUrl }),
    },
  });
};

export const updateBookingExit = async (
  id: string,
  actualExitTime: Date,
  actualDuration: number,
  exitImageUrl?: string,
  extraTimeAmount = 0
): Promise<Booking> => {
  return await prisma.booking.update({
    where: { id },
    data: {
      actualExitTime,
      actualDuration,
      status: BookingStatus.COMPLETED,
      extraTimeAmount,
      totalAmount: {
        increment: extraTimeAmount,
      },
      ...(exitImageUrl && { exitImageUrl }),
    },
  });
};