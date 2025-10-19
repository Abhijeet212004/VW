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
    // console.log(slot);
    
    // If not found, create it when parkingSpotId and slotNumber are provided
    if (!slot) {
      if (data.parkingSpotId && data.slotNumber !== undefined) {
        slot = await slotDetailsRepository.createSlot({ id: data.slotId, parkingSpotId: data.parkingSpotId, slotNumber: data.slotNumber, status: data.status });
      } else {
        // If not enough info to create, return nulls
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
