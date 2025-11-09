import { Request, Response } from 'express';
import axios from 'axios';

// PICT Parking Areas Configuration
export const PICT_PARKING_AREAS = {
  main_gate: { lat: 18.5204, lng: 73.8567, total_slots: 150, name: "Main Gate Parking" },
  sports_complex: { lat: 18.5198, lng: 73.8575, total_slots: 100, name: "Sports Complex Parking" },
  auditorium: { lat: 18.5210, lng: 73.8560, total_slots: 80, name: "Auditorium Parking" },
  hostel_area: { lat: 18.5215, lng: 73.8580, total_slots: 120, name: "Hostel Area Parking" },
  library: { lat: 18.5200, lng: 73.8570, total_slots: 60, name: "Library Parking" }
} as const;

// Type definitions
interface UserLocation {
  lat: number;
  lng: number;
}

interface ParkingPredictionRequest {
  user_location: UserLocation;
  parking_area: keyof typeof PICT_PARKING_AREAS;
  vehicle_type?: string;
  planned_arrival_time?: string;
}

interface ParkingRecommendationRequest {
  destination_location: UserLocation;
  planned_arrival_time: string;
  vehicle_type?: string;
  max_walking_distance?: number;
}

// Configuration
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export class ParkingPredictionService {
  
  /**
   * Predict availability for a specific parking spot
   */
  static async predictAvailability(req: Request, res: Response) {
    try {
      const {
        user_location,
        parking_area,
        vehicle_type = 'car',
        planned_arrival_time
      } = req.body as ParkingPredictionRequest;

      // Validate input
      if (!user_location || !user_location.lat || !user_location.lng) {
        return res.status(400).json({
          success: false,
          error: 'User location is required'
        });
      }

      if (!parking_area || !(parking_area in PICT_PARKING_AREAS)) {
        return res.status(400).json({
          success: false,
          error: 'Valid parking area is required',
          available_areas: Object.keys(PICT_PARKING_AREAS)
        });
      }

      // Prepare prediction data
      const predictionData = {
        user_location,
        parking_area,
        vehicle_type,
        planned_arrival_time
      };

      // Call ML service
      const mlResponse = await axios.post(
        `${ML_SERVICE_URL}/predict-availability`,
        predictionData,
        {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      // Add additional context
      const parkingInfo = PICT_PARKING_AREAS[parking_area];
      const response = {
        ...mlResponse.data,
        parking_info: {
          total_slots: parkingInfo.total_slots,
          coordinates: { lat: parkingInfo.lat, lng: parkingInfo.lng },
          name: parkingInfo.name
        },
        request_timestamp: new Date().toISOString()
      };

      res.json(response);

    } catch (error: any) {
      console.error('Parking prediction error:', error);

      if (error.code === 'ECONNREFUSED') {
        // ML service is down - provide fallback
        const fallbackPrediction = ParkingPredictionService.getFallbackPrediction(req.body);
        return res.json(fallbackPrediction);
      }

      res.status(500).json({
        success: false,
        error: 'Prediction service temporarily unavailable',
        message: error.message
      });
    }
  }

  /**
   * Get top 3 parking recommendations
   */
  static async recommendParking(req: Request, res: Response) {
    try {
      const {
        destination_location,
        planned_arrival_time,
        vehicle_type = 'car',
        max_walking_distance = 500
      } = req.body as ParkingRecommendationRequest;

      // Validate input
      if (!destination_location || !destination_location.lat || !destination_location.lng) {
        return res.status(400).json({
          success: false,
          error: 'Destination location is required'
        });
      }

      if (!planned_arrival_time) {
        return res.status(400).json({
          success: false,
          error: 'Planned arrival time is required'
        });
      }

      // Prepare recommendation data
      const recommendationData = {
        destination_location,
        planned_arrival_time,
        vehicle_type,
        max_walking_distance
      };

      // Call ML service
      const mlResponse = await axios.post(
        `${ML_SERVICE_URL}/recommend-parking`,
        recommendationData,
        {
          timeout: 15000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      res.json({
        ...mlResponse.data,
        request_timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('Parking recommendation error:', error);

      if (error.code === 'ECONNREFUSED') {
        // ML service is down - provide fallback
        const fallbackRecommendations = ParkingPredictionService.getFallbackRecommendations(req.body);
        return res.json(fallbackRecommendations);
      }

      res.status(500).json({
        success: false,
        error: 'Recommendation service temporarily unavailable',
        message: error.message
      });
    }
  }

  /**
   * Get current parking status (real-time occupancy from CV system)
   */
  static async getCurrentParkingStatus(req: Request, res: Response) {
    try {
      // In real implementation, this would connect to your CV system
      // For now, we'll simulate real-time data
      
      const parkingStatuses = Object.entries(PICT_PARKING_AREAS).map(([areaId, areaInfo]) => {
        const currentHour = new Date().getHours();
        let occupancyRate = 0.5; // Base occupancy
        
        // Time-based occupancy simulation
        if (currentHour >= 8 && currentHour <= 10) {
          occupancyRate = 0.8; // Morning rush
        } else if (currentHour >= 10 && currentHour <= 16) {
          occupancyRate = 0.7; // Peak hours
        } else if (currentHour >= 17 && currentHour <= 19) {
          occupancyRate = 0.6; // Evening
        } else {
          occupancyRate = 0.3; // Off hours
        }

        // Area-specific adjustments
        const areaMultipliers = {
          main_gate: 1.2,
          sports_complex: 0.8,
          auditorium: 0.9,
          hostel_area: 1.1,
          library: 0.7
        };

        occupancyRate *= areaMultipliers[areaId as keyof typeof areaMultipliers] || 1.0;
        occupancyRate = Math.min(0.95, Math.max(0.05, occupancyRate));

        const occupiedSlots = Math.floor(areaInfo.total_slots * occupancyRate);
        const freeSlots = areaInfo.total_slots - occupiedSlots;

        return {
          area_id: areaId,
          area_name: areaInfo.name,
          total_slots: areaInfo.total_slots,
          occupied_slots: occupiedSlots,
          free_slots: freeSlots,
          occupancy_rate: Math.round(occupancyRate * 100),
          coordinates: { lat: areaInfo.lat, lng: areaInfo.lng },
          last_updated: new Date().toISOString(),
          status: freeSlots > 10 ? 'available' : freeSlots > 0 ? 'limited' : 'full'
        };
      });

      res.json({
        success: true,
        timestamp: new Date().toISOString(),
        parking_areas: parkingStatuses,
        total_areas: parkingStatuses.length,
        total_slots: Object.values(PICT_PARKING_AREAS).reduce((sum, area) => sum + area.total_slots, 0),
        total_free_slots: parkingStatuses.reduce((sum, area) => sum + area.free_slots, 0)
      });

    } catch (error: any) {
      console.error('Current status error:', error);
      res.status(500).json({
        success: false,
        error: 'Unable to fetch current parking status',
        message: error.message
      });
    }
  }

  /**
   * Fallback prediction when ML service is unavailable
   */
  private static getFallbackPrediction(requestData: any) {
    const currentHour = new Date().getHours();
    const isWeekend = new Date().getDay() >= 5;
    
    let baseAvailability = 70;
    
    // Time-based adjustments
    if (currentHour >= 8 && currentHour <= 10 || currentHour >= 17 && currentHour <= 19) {
      baseAvailability -= 25; // Peak hours
    } else if (currentHour >= 10 && currentHour <= 16) {
      baseAvailability -= 15; // Normal hours
    }
    
    // Weekend adjustment
    if (isWeekend) {
      baseAvailability += 20;
    }
    
    // Area-specific adjustments
    const areaAdjustments = {
      main_gate: -10, // More popular
      sports_complex: +5,
      auditorium: 0,
      hostel_area: -5,
      library: +10 // Less popular
    };
    
    baseAvailability += areaAdjustments[requestData.parking_area as keyof typeof areaAdjustments] || 0;
    baseAvailability = Math.max(10, Math.min(90, baseAvailability));
    
    return {
      success: true,
      parking_area: PICT_PARKING_AREAS[requestData.parking_area as keyof typeof PICT_PARKING_AREAS].name,
      availability_percentage: baseAvailability,
      estimated_arrival_time: requestData.planned_arrival_time || new Date(Date.now() + 15 * 60000).toISOString(),
      confidence: "Medium",
      fallback_mode: true,
      message: "Using simplified prediction model"
    };
  }

  /**
   * Fallback recommendations when ML service is unavailable
   */
  private static getFallbackRecommendations(requestData: any) {
    const recommendations = Object.entries(PICT_PARKING_AREAS).map(([areaId, areaInfo]) => {
      // Simple distance calculation (not accurate, but for fallback)
      const distance = Math.sqrt(
        Math.pow(requestData.destination_location.lat - areaInfo.lat, 2) +
        Math.pow(requestData.destination_location.lng - areaInfo.lng, 2)
      ) * 111000; // Rough conversion to meters
      
      return {
        parking_area: areaInfo.name,
        parking_id: areaId,
        availability_percentage: Math.random() * 40 + 40, // Random 40-80%
        walking_distance_meters: Math.round(distance),
        walking_time_minutes: Math.round(distance / 80),
        total_slots: areaInfo.total_slots,
        coordinates: { lat: areaInfo.lat, lng: areaInfo.lng }
      };
    }).sort((a, b) => b.availability_percentage - a.availability_percentage);

    return {
      success: true,
      destination: requestData.destination_location,
      arrival_time: requestData.planned_arrival_time,
      top_recommendations: recommendations.slice(0, 3),
      total_options: recommendations.length,
      fallback_mode: true,
      message: "Using simplified recommendation model"
    };
  }

  /**
   * Health check for prediction services
   */
  static async healthCheck(req: Request, res: Response) {
    try {
      // Check ML service health
      let mlServiceHealth = false;
      try {
        const healthResponse = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 5000 });
        mlServiceHealth = healthResponse.status === 200;
      } catch (error) {
        mlServiceHealth = false;
      }

      res.json({
        success: true,
        timestamp: new Date().toISOString(),
        services: {
          backend_api: true,
          ml_prediction_service: mlServiceHealth,
          parking_areas_configured: Object.keys(PICT_PARKING_AREAS).length,
          fallback_available: true
        },
        ml_service_url: ML_SERVICE_URL
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Health check failed',
        message: error.message
      });
    }
  }
}