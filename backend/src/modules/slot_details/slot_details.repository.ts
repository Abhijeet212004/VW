import { PrismaClient, CVEventType, SlotStatus } from '@prisma/client';
const prisma = new PrismaClient();

export const slotDetailsRepository = {
  findSlot: async (criteria: { id?: string; parkingSpotId?: string; slotNumber?: number }) => {
    if (criteria.id) {
      // First try to find by UUID
      let slot = await prisma.parkingSlot.findUnique({ where: { id: criteria.id } });
      if (slot) return slot;
      
      // If not found, try to find by permanentSlotId (e.g., "A-01")
      slot = await prisma.parkingSlot.findUnique({ where: { permanentSlotId: criteria.id } });
      if (slot) return slot;
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

  countSlotsForParkingSpot: async (parkingSpotId: string) => {
    return await prisma.parkingSlot.count({ where: { parkingSpotId, isActive: true } });
  },
};
