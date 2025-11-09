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

  getAllParkingSpots: async (req: Request, res: Response) => {
    try {
      const parkingSpots = await parkingSpotService.getAllParkingSpots();
      res.status(200).json({
        success: true,
        data: parkingSpots,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch parking spots",
      });
    }
  },

  getParkingSpotsNearLocation: async (req: Request, res: Response) => {
    try {
      const { latitude, longitude, radius = 10 } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: "Latitude and longitude are required",
        });
      }

      const parkingSpots = await parkingSpotService.getParkingSpotsNearLocation(
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        parseFloat(radius as string)
      );
      
      res.status(200).json({
        success: true,
        data: parkingSpots,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch nearby parking spots",
      });
    }
  },

  getParkingSpotById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const parkingSpot = await parkingSpotService.getParkingSpotById(id);
      
      if (!parkingSpot) {
        return res.status(404).json({
          success: false,
          message: "Parking spot not found",
        });
      }

      res.status(200).json({
        success: true,
        data: parkingSpot,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch parking spot",
      });
    }
  },

  predictParkingAvailability: async (req: Request, res: Response) => {
    try {
      const { parkingSpotId, location, date, time } = req.body;
      
      // Validate required fields
      if (!parkingSpotId || !location || !date || !time) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: parkingSpotId, location, date, time",
        });
      }

      if (!location.latitude || !location.longitude) {
        return res.status(400).json({
          success: false,
          message: "Location must include latitude and longitude",
        });
      }

      const prediction = await parkingSpotService.predictParkingAvailability({
        parkingSpotId: parseInt(parkingSpotId),
        location,
        date,
        time,
      });

      res.status(200).json({
        success: true,
        message: "Parking availability prediction generated successfully",
        data: prediction,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to generate parking prediction",
      });
    }
  },

  // ML-Powered Parking Prediction
  predictWithML: async (req: Request, res: Response) => {
    try {
      const { userLocation, parkingArea, vehicleType, plannedArrivalTime } = req.body;

      if (!userLocation || !parkingArea) {
        return res.status(400).json({
          success: false,
          message: "User location and parking area are required",
        });
      }

      const prediction = await parkingSpotService.predictParkingAvailability({
        userLocation,
        parkingArea,
        vehicleType,
        plannedArrivalTime,
      });

      res.status(200).json({
        success: true,
        message: "ML parking prediction generated successfully",
        data: prediction,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to generate ML parking prediction",
      });
    }
  },

  // ML-Powered Parking Recommendations
  recommendWithML: async (req: Request, res: Response) => {
    try {
      const { destinationLocation, plannedArrivalTime, vehicleType, maxWalkingDistance } = req.body;

      if (!destinationLocation || !plannedArrivalTime) {
        return res.status(400).json({
          success: false,
          message: "Destination location and planned arrival time are required",
        });
      }

      const recommendations = await parkingSpotService.recommendParkingSpots({
        destinationLocation,
        plannedArrivalTime,
        vehicleType,
        maxWalkingDistance,
      });

      res.status(200).json({
        success: true,
        message: "ML parking recommendations generated successfully",
        data: recommendations,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to generate ML parking recommendations",
      });
    }
  },

  // Check ML Service Status
  checkMLHealth: async (req: Request, res: Response) => {
    try {
      const health = await parkingSpotService.checkMLServiceHealth();
      res.status(200).json({
        success: true,
        message: "ML service is healthy",
        data: health,
      });
    } catch (error: any) {
      res.status(503).json({
        success: false,
        message: error.message || "ML service is unavailable",
      });
    }
  },
};
