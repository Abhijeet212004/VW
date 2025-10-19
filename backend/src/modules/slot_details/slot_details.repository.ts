import { PrismaClient, CVEventType, SlotStatus } from '@prisma/client';
const prisma = new PrismaClient();

export const slotDetailsRepository = {
  findSlot: async (criteria: { id?: string; parkingSpotId?: string; slotNumber?: number }) => {
    if (criteria.id) {
      return await prisma.parkingSlot.findUnique({ where: { id: criteria.id } });
    }
    if (criteria.parkingSpotId && criteria.slotNumber !== undefined) {
      return await prisma.parkingSlot.findFirst({ where: { parkingSpotId: criteria.parkingSpotId, slotNumber: criteria.slotNumber } });
    }
    return null;
  },

  createSlot: async (data: { id?: string; parkingSpotId: string; slotNumber: number; status?: SlotStatus }) => {
    const createData: any = {
      parkingSpotId: data.parkingSpotId,
      slotNumber: data.slotNumber,
    };
    if (data.status !== undefined) createData.status = data.status;
    if (data.id) createData.id = data.id;

    return await prisma.parkingSlot.create({ data: createData });
  },

  createSlotCVLog: async (data: {
    slotId: string;
    eventType: CVEventType;
    detectedPlate?: string | null;
    confidence?: number | null;
    status: SlotStatus;
  }) => {
    return await prisma.slotCVLog.create({ data });
  },

  updateSlotStatus: async (slotId: string, status: SlotStatus) => {
    return await prisma.parkingSlot.update({ where: { id: slotId }, data: { status } });
  },
};
