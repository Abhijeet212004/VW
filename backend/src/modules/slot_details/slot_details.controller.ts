import { Request, Response } from 'express';
import { slotDetailsService } from './slot_details.service';

export const slotDetailsController = {
  receiveEvent: async (req: Request, res: Response) => {
    try {
      const payload = req.body;
     console.log(payload);
      
      if (!payload.eventType) {
        return res.status(400).json({ success: false, message: 'eventType is required' });
      }

      // Require either slotId or (parkingSpotId + slotNumber) so we can locate or create the slot
      if (!payload.slotId && !(payload.parkingSpotId && payload.slotNumber !== undefined)) {
        return res.status(400).json({ success: false, message: 'Provide slotId or parkingSpotId + slotNumber' });
      }

      const result = await slotDetailsService.handleCvEvent(payload);
    //   console.log(result);
      
      return res.status(201).json({ success: true, data: result });
    } catch (err: any) {
        console.log(err.message);
        
      return res.status(500).json({ success: false, message: err.message || String(err) });
    }
  },

  health: async (_req: Request, res: Response) => {
    res.json({ success: true, message: 'slot-details service OK' });
  },
};
