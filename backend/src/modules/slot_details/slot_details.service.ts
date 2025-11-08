import { slotDetailsRepository } from './slot_details.repository';
import { CVEventType, SlotStatus } from '@prisma/client';

export const slotDetailsService = {
  handleCvEvent: async (data: {
    parkingSpotId?: string;
    slotId?: string;
    slotNumber?: number;
    eventType: CVEventType;
    status: SlotStatus;
    confidence?: number | null;
  }) => {
    // Find slot by id or (parkingSpotId + slotNumber)
    let slot = await slotDetailsRepository.findSlot({ id: data.slotId, parkingSpotId: data.parkingSpotId, slotNumber: data.slotNumber });
    
    // If not found, create it only if we have less than 55 slots for this parking spot
    if (!slot) {
      if (data.parkingSpotId && data.slotNumber !== undefined) {
        const existingSlotCount = await slotDetailsRepository.countSlotsForParkingSpot(data.parkingSpotId);
        if (existingSlotCount < 55) {
          slot = await slotDetailsRepository.createSlot({ id: data.slotId, parkingSpotId: data.parkingSpotId, slotNumber: data.slotNumber, status: data.status });
        } else {
          // If we already have 55 slots, don't create more
          return { createdLog: null, updatedSlot: null };
        }
      } else {
        return { createdLog: null, updatedSlot: null };
      }
    }

    // If slot is blocked (isActive === false), do not update status
    if (!slot.isActive) {
      // Still log the event
      const createdLog = await slotDetailsRepository.createSlotCVLog({
        slotId: slot.id,
        eventType: data.eventType,
        confidence: data.confidence ?? null,
        status: slot.status,
      });
      console.log("added");
      
      return { createdLog, updatedSlot: null };
    }

    // Update slot status to the one received from CV
    let updatedSlot = null;
    if (data.status && data.status !== slot.status) {
      updatedSlot = await slotDetailsRepository.updateSlotStatus(slot.id, data.status);
    }

    // Log the event with the new status
    const createdLog = await slotDetailsRepository.createSlotCVLog({
      slotId: slot.id,
      eventType: data.eventType,
      confidence: data.confidence ?? null,
      status: data.status,
    });

    return { createdLog, updatedSlot };
  },
};
