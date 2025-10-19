import { Request, Response } from "express";
import { parkingSpotService } from "./parkingSpot.service";

export const parkingSpotController = {
  addParkingSpot: async (req: Request, res: Response) => {
    try {
      const parkingSpot = await parkingSpotService.addParkingSpot(req.body);
      res.status(201).json({
        success: true,
        message: "Parking spot added successfully",
        data: parkingSpot,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to add parking spot",
      });
    }
  },
};
