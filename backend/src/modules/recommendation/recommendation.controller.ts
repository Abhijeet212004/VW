import { Request, Response } from "express";
import * as recommendationService from "../../services/recommendation.service";

/**
 * Get smart parking recommendations
 * POST /api/recommend-parking
 */
export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const {
      userLatitude,
      userLongitude,
      destinationLatitude,
      destinationLongitude,
      vehicleType,
      radiusKm,
      arrivalTimeMinutes,
    } = req.body;

    // Validation
    if (
      !userLatitude ||
      !userLongitude ||
      !destinationLatitude ||
      !destinationLongitude
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required location coordinates",
      });
    }

    if (!vehicleType) {
      return res.status(400).json({
        success: false,
        message: "Vehicle type is required (car/bike/large_vehicle/disabled)",
      });
    }

    // Get recommendations
    const result = await recommendationService.getRecommendations({
      userLatitude: Number(userLatitude),
      userLongitude: Number(userLongitude),
      destinationLatitude: Number(destinationLatitude),
      destinationLongitude: Number(destinationLongitude),
      vehicleType: String(vehicleType).toLowerCase(),
      radiusKm: radiusKm ? Number(radiusKm) : 3,
      arrivalTimeMinutes: arrivalTimeMinutes ? Number(arrivalTimeMinutes) : 15,
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error in getRecommendations:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get parking recommendations",
    });
  }
};
