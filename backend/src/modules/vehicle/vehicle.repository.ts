import { prisma } from '../../config/database';
import { Vehicle, VerificationStatus, VerificationMethod } from '@prisma/client';

export const createVehicle = async (data: {
  userId: string;
  registrationNumber: string;
  ownerName: string;
  enteredName: string;
  make?: string;
  model?: string;
  color?: string;
  fuelType?: string;
  registrationDate?: Date;
  qrCode?: string;
  numberPlatePhoto?: string;
  verificationStatus: VerificationStatus;
  verificationScore?: number;
  verificationMethod: VerificationMethod;
}): Promise<Vehicle> => {
  return await prisma.vehicle.create({
    data,
  });
};

export const findVehicleById = async (id: string): Promise<Vehicle | null> => {
  return await prisma.vehicle.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

export const findVehicleByRegistrationNumber = async (
  registrationNumber: string
): Promise<Vehicle | null> => {
  return await prisma.vehicle.findUnique({
    where: { registrationNumber },
  });
};

export const findVehiclesByUserId = async (userId: string): Promise<Vehicle[]> => {
  return await prisma.vehicle.findMany({
    where: { userId, isActive: true },
    orderBy: { createdAt: 'desc' },
  });
};

export const updateVehicle = async (
  id: string,
  data: Partial<Vehicle>
): Promise<Vehicle> => {
  return await prisma.vehicle.update({
    where: { id },
    data,
  });
};

export const deleteVehicle = async (id: string): Promise<Vehicle> => {
  return await prisma.vehicle.update({
    where: { id },
    data: { isActive: false },
  });
};

export const createVerificationLog = async (data: {
  vehicleId: string;
  rtoResponse: any;
  enteredName: string;
  rtoOwnerName: string;
  matchScore: number;
  method: VerificationMethod;
  status: VerificationStatus;
}): Promise<any> => {
  return await prisma.verificationLog.create({
    data,
  });
};
