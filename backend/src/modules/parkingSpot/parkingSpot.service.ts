import { parkingSpotRepository } from "./parkingSpot.repository";
import axios from "axios";

// ML Service Configuration
const ML_SERVICE_URL = "http://localhost:8000";

export const parkingSpotService = {
  addParkingSpot: async (data: any) => {
    // Validate required fields
    if (!data.name || !data.address || data.latitude === undefined || data.longitude === undefined || data.totalSpots === undefined) {
      throw new Error('Missing required fields: name, address, latitude, longitude, totalSpots');
    }

    // Default availableSpots = totalSpots if not given
    const availableSpots = data.availableSpots ?? data.totalSpots;

    // Ensure pricePerHour exists (Prisma schema requires it)
    const pricePerHour = data.pricePerHour ?? 0;

    // Build a sanitized payload so we don't pass unknown fields (e.g. metadata) to Prisma
    const payload: any = {
      name: String(data.name),
      address: String(data.address),
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      totalSpots: Number(data.totalSpots),
      availableSpots: Number(availableSpots),
      pricePerHour: Number(pricePerHour),
    };

    // Optional fields (only add if present)
    if (data.isCovered !== undefined) payload.isCovered = Boolean(data.isCovered);
    if (data.hasSecurity !== undefined) payload.hasSecurity = Boolean(data.hasSecurity);
    if (data.hasEVCharging !== undefined) payload.hasEVCharging = Boolean(data.hasEVCharging);
    if (data.rating !== undefined) payload.rating = Number(data.rating);
    if (data.entryCameraId !== undefined) payload.entryCameraId = String(data.entryCameraId);
    if (data.exitCameraId !== undefined) payload.exitCameraId = String(data.exitCameraId);
    if (data.hasALPR !== undefined) payload.hasALPR = Boolean(data.hasALPR);
    if (data.overtimePriceMultiplier !== undefined) payload.overtimePriceMultiplier = Number(data.overtimePriceMultiplier);
    if (data.isActive !== undefined) payload.isActive = Boolean(data.isActive);

    return await parkingSpotRepository.createParkingSpot(payload);
  },

  getAllParkingSpots: async () => {
    return await parkingSpotRepository.getAllParkingSpotsWithSlots();
  },

  getParkingSpotsNearLocation: async (latitude: number, longitude: number, radius: number = 10) => {
    return await parkingSpotRepository.getParkingSpotsNearLocation(latitude, longitude, radius);
  },

  getParkingSpotById: async (id: string) => {
    return await parkingSpotRepository.getParkingSpotWithSlots(id);
  },

  // New prediction function
  predictParkingAvailability: async (data: {
    parkingSpotId: number;
    location: { latitude: number; longitude: number };
    date: string;
    time: string;
  }) => {
    const { parkingSpotId, location, date, time } = data;
    
    // Get the parking spot details
    const parkingSpot = await parkingSpotRepository.getParkingSpotWithSlots(parkingSpotId.toString());
    
    if (!parkingSpot) {
      throw new Error('Parking spot not found');
    }

    // Parse the prediction date and time
    const predictionDateTime = new Date(`${date.split('T')[0]}T${time.split('T')[1]}`);
    const now = new Date();
    
    // Calculate time-based factors
    const hourOfDay = predictionDateTime.getHours();
    const dayOfWeek = predictionDateTime.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isBusinessHours = hourOfDay >= 9 && hourOfDay <= 18;
    
    // Simple prediction algorithm based on various factors
    let occupancyPrediction = 0.5; // Base 50% occupancy
    
    // Time-based adjustments
    if (isBusinessHours && !isWeekend) {
      occupancyPrediction += 0.3; // Higher demand during business hours on weekdays
    }
    if (isWeekend) {
      occupancyPrediction += 0.2; // Moderate increase on weekends
    }
    if (hourOfDay >= 12 && hourOfDay <= 14) {
      occupancyPrediction += 0.15; // Lunch rush
    }
    if (hourOfDay >= 18 && hourOfDay <= 20) {
      occupancyPrediction += 0.1; // Evening rush
    }
    
    // Location-based adjustments (if near commercial areas)
    if (parkingSpot.name.toLowerCase().includes('mall') || 
        parkingSpot.name.toLowerCase().includes('office') ||
        parkingSpot.name.toLowerCase().includes('commercial')) {
      occupancyPrediction += 0.1;
    }
    
    // Random factor to simulate real-world unpredictability
    occupancyPrediction += (Math.random() - 0.5) * 0.2;
    
    // Ensure prediction is between 0 and 1
    occupancyPrediction = Math.max(0, Math.min(1, occupancyPrediction));
    
    // Calculate predicted available spots
    const predictedOccupiedSpots = Math.round(parkingSpot.totalSpots * occupancyPrediction);
    const predictedAvailableSpots = parkingSpot.totalSpots - predictedOccupiedSpots;
    
    // Determine availability status
    let availabilityStatus = 'HIGH';
    if (occupancyPrediction > 0.8) {
      availabilityStatus = 'LOW';
    } else if (occupancyPrediction > 0.6) {
      availabilityStatus = 'MEDIUM';
    }
    
    // Generate confidence score based on how far in the future the prediction is
    const hoursUntilPrediction = (predictionDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    let confidenceScore = 0.9;
    if (hoursUntilPrediction > 24) {
      confidenceScore = 0.7; // Lower confidence for predictions > 24 hours
    } else if (hoursUntilPrediction > 12) {
      confidenceScore = 0.8; // Medium confidence for 12-24 hours
    }
    
    return {
      parkingSpot: {
        id: parkingSpot.id,
        name: parkingSpot.name,
        address: parkingSpot.address,
        totalSpots: parkingSpot.totalSpots,
        pricePerHour: parkingSpot.pricePerHour,
      },
      prediction: {
        dateTime: predictionDateTime.toISOString(),
        predictedOccupancy: Math.round(occupancyPrediction * 100), // Percentage
        predictedAvailableSpots,
        predictedOccupiedSpots,
        availabilityStatus,
        confidenceScore: Math.round(confidenceScore * 100), // Percentage
      },
      factors: {
        timeOfDay: hourOfDay,
        dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
        isWeekend,
        isBusinessHours,
        hoursFromNow: Math.round(hoursUntilPrediction * 10) / 10,
      },
      recommendations: [
        availabilityStatus === 'LOW' ? 'Consider booking in advance or arriving earlier' : null,
        availabilityStatus === 'HIGH' ? 'Good availability expected at this time' : null,
        hoursUntilPrediction > 24 ? 'Prediction accuracy may vary for long-term forecasts' : null,
      ].filter(Boolean),
    };
  },

  // ML Service Integration Methods
  predictParkingAvailability: async (data: {
    userLocation: { lat: number; lng: number };
    parkingArea: string;
    vehicleType?: string;
    plannedArrivalTime?: string;
  }) => {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/predict-availability`, {
        user_location: data.userLocation,
        parking_area: data.parkingArea,
        vehicle_type: data.vehicleType || "car",
        planned_arrival_time: data.plannedArrivalTime,
      });
      
      return response.data;
    } catch (error: any) {
      console.error("ML Service Error:", error.message);
      throw new Error("Failed to get parking prediction from ML service");
    }
  },

  recommendParkingSpots: async (data: {
    destinationLocation: { lat: number; lng: number };
    plannedArrivalTime: string;
    vehicleType?: string;
    maxWalkingDistance?: number;
  }) => {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/recommend-parking`, {
        destination_location: data.destinationLocation,
        planned_arrival_time: data.plannedArrivalTime,
        vehicle_type: data.vehicleType || "car",
        max_walking_distance: data.maxWalkingDistance || 1000,
      });
      
      return response.data;
    } catch (error: any) {
      console.error("ML Service Error:", error.message);
      throw new Error("Failed to get parking recommendations from ML service");
    }
  },

  // Check if ML service is available
  checkMLServiceHealth: async () => {
    try {
      const response = await axios.get(`${ML_SERVICE_URL}/health`);
      return response.data;
    } catch (error) {
      throw new Error("ML service is not available");
    }
  },
};
