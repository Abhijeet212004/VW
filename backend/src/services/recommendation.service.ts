import { PrismaClient } from "@prisma/client";
import * as mlService from "../services/ml.service";
import * as geoService from "../services/geospatial.service";

const prisma = new PrismaClient();

export interface RecommendationRequest {
  userLatitude: number;
  userLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
  vehicleType: string; // 'car' | 'bike' | 'large_vehicle' | 'disabled'
  radiusKm?: number; // Default: 3 km
  arrivalTimeMinutes?: number; // Expected arrival time from now (minutes)
}

export interface ParkingRecommendation {
  spotId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distanceFromDestination: number; // km
  distanceFromUser: number; // km
  estimatedTravelTime: number; // minutes

  // Real-time data
  totalSlots: number;
  currentFreeSlots: number;
  currentOccupancyRate: number;

  // ML predictions
  predictedOccupancyProbability: number;
  predictedAvailability: number; // 1 - occupancy probability
  mlConfidence: number;

  // Recommendation score (0-100)
  recommendationScore: number;

  // Additional info
  pricePerHour: number;
  isCovered: boolean;
  hasSecurity: boolean;
  hasEVCharging: boolean;
  rating: number;

  // Breakdown of score factors
  scoreBreakdown: {
    distanceScore: number;
    availabilityScore: number;
    mlPredictionScore: number;
    priceScore: number;
    amenitiesScore: number;
  };
}

/**
 * Calculate estimated travel time (minutes) based on distance
 * Using average urban speed of 30 km/h
 */
const estimateTravelTime = (distanceKm: number): number => {
  const avgSpeedKmh = 30; // Average urban speed
  return Math.ceil((distanceKm / avgSpeedKmh) * 60);
};

/**
 * Calculate recommendation score based on multiple factors
 */
const calculateRecommendationScore = (
  distanceFromDest: number,
  currentAvailability: number,
  predictedAvailability: number,
  mlConfidence: number,
  pricePerHour: number,
  hasAmenities: boolean
): { score: number; breakdown: any } => {
  // 1. Distance Score (0-30 points) - Closer is better
  // Give full points if within 500m, decrease linearly up to 3km
  let distanceScore = 0;
  if (distanceFromDest <= 0.5) {
    distanceScore = 30;
  } else if (distanceFromDest <= 3) {
    distanceScore = 30 - ((distanceFromDest - 0.5) / 2.5) * 30;
  }

  // 2. Current Availability Score (0-25 points)
  const availabilityScore = currentAvailability * 25;

  // 3. ML Prediction Score (0-25 points)
  // Weight by confidence
  const mlPredictionScore = predictedAvailability * mlConfidence * 25;

  // 4. Price Score (0-10 points) - Lower price is better
  // Normalize price (assuming range 10-50 per hour)
  const priceScore = Math.max(0, 10 - ((pricePerHour - 10) / 40) * 10);

  // 5. Amenities Score (0-10 points)
  const amenitiesScore = hasAmenities ? 10 : 5;

  const totalScore =
    distanceScore +
    availabilityScore +
    mlPredictionScore +
    priceScore +
    amenitiesScore;

  return {
    score: Math.round(totalScore),
    breakdown: {
      distanceScore: Math.round(distanceScore),
      availabilityScore: Math.round(availabilityScore),
      mlPredictionScore: Math.round(mlPredictionScore),
      priceScore: Math.round(priceScore),
      amenitiesScore: Math.round(amenitiesScore),
    },
  };
};

/**
 * Get smart parking recommendations
 */
export const getRecommendations = async (
  request: RecommendationRequest
): Promise<{
  success: boolean;
  recommendations: ParkingRecommendation[];
  mlServiceAvailable: boolean;
  message?: string;
}> => {
  try {
    const radiusKm = request.radiusKm || 3;
    const arrivalTimeMinutes = request.arrivalTimeMinutes || 15;

    // 1. Find nearby parking spots around destination
    console.log("🔍 Finding parking spots near destination...");
    const nearbySpots = await geoService.findNearbyParkingSpots(
      {
        latitude: request.destinationLatitude,
        longitude: request.destinationLongitude,
      },
      radiusKm
    );

    if (nearbySpots.length === 0) {
      return {
        success: true,
        recommendations: [],
        mlServiceAvailable: false,
        message: `No parking spots found within ${radiusKm}km of destination`,
      };
    }

    console.log(`✅ Found ${nearbySpots.length} nearby parking spots`);

    // 2. Check ML service availability
    const mlAvailable = await mlService.checkMLServiceHealth();
    console.log(`🤖 ML Service: ${mlAvailable ? "Available" : "Unavailable"}`);

    // 3. Get real-time status and prepare ML predictions
    console.log("📊 Gathering real-time data and ML predictions...");
    const recommendations: ParkingRecommendation[] = [];

    // Prepare batch ML prediction request
    const now = new Date();
    const arrivalTime = new Date(now.getTime() + arrivalTimeMinutes * 60000);
    const mlInputs = nearbySpots.map((spot) => {
      const areaMetadata = geoService.getAreaMetadata(spot);
      return {
        spot_id: spot.id,
        slot_type: request.vehicleType,
        hour: arrivalTime.getHours(),
        weekday: arrivalTime.getDay(),
        weather: geoService.getCurrentWeather(),
        event_type: geoService.getCurrentEventType(),
        ...areaMetadata,
      };
    });

    // Get ML predictions (batch)
    let mlPredictions: any[] = [];
    if (mlAvailable) {
      const batchResult = await mlService.predictBatch({
        spots: mlInputs,
        hour: arrivalTime.getHours(),
        weekday: arrivalTime.getDay(),
      });
      mlPredictions = batchResult.predictions;
    } else {
      // Use neutral predictions if ML service unavailable
      mlPredictions = mlInputs.map((input) => ({
        spot_id: input.spot_id,
        prob_free: 0.5,
        prob_occupied: 0.5,
        prediction: "UNKNOWN",
        confidence: 0.0,
      }));
    }

    // 4. Build recommendations
    for (let i = 0; i < nearbySpots.length; i++) {
      const spot = nearbySpots[i];
      const mlPred =
        mlPredictions.find((p) => p.spot_id === spot.id) || mlPredictions[i];

      // Get real-time slot status
      const slotStatus = await geoService.getRealTimeSlotStatus(spot.id);

      // Calculate distances
      const distanceFromUser = geoService.calculateDistance(
        request.userLatitude,
        request.userLongitude,
        spot.latitude,
        spot.longitude
      );

      const distanceFromDest = spot.distance; // Already calculated in findNearbyParkingSpots

      // Current availability (0-1)
      const currentAvailability =
        slotStatus.totalSlots > 0
          ? slotStatus.freeSlots / slotStatus.totalSlots
          : 0;

      // Predicted availability (0-1)
      const predictedAvailability = mlPred.prob_free || 0.5;

      // Calculate recommendation score
      const hasAmenities =
        spot.isCovered || spot.hasSecurity || spot.hasEVCharging;
      const { score, breakdown } = calculateRecommendationScore(
        distanceFromDest,
        currentAvailability,
        predictedAvailability,
        mlPred.confidence || 0.5,
        spot.pricePerHour,
        hasAmenities
      );

      recommendations.push({
        spotId: spot.id,
        name: spot.name,
        address: spot.address,
        latitude: spot.latitude,
        longitude: spot.longitude,
        distanceFromDestination: Math.round(distanceFromDest * 100) / 100,
        distanceFromUser: Math.round(distanceFromUser * 100) / 100,
        estimatedTravelTime: estimateTravelTime(distanceFromUser),

        totalSlots: slotStatus.totalSlots,
        currentFreeSlots: slotStatus.freeSlots,
        currentOccupancyRate: Math.round(slotStatus.occupancyRate * 100) / 100,

        predictedOccupancyProbability:
          Math.round(mlPred.prob_occupied * 100) / 100,
        predictedAvailability: Math.round(predictedAvailability * 100) / 100,
        mlConfidence: Math.round(mlPred.confidence * 100) / 100,

        recommendationScore: score,

        pricePerHour: spot.pricePerHour,
        isCovered: spot.isCovered,
        hasSecurity: spot.hasSecurity,
        hasEVCharging: spot.hasEVCharging,
        rating: spot.rating,

        scoreBreakdown: breakdown,
      });
    }

    // 5. Sort by recommendation score and return top 3
    recommendations.sort(
      (a, b) => b.recommendationScore - a.recommendationScore
    );
    const topRecommendations = recommendations.slice(0, 3);

    console.log(
      `✅ Generated ${recommendations.length} recommendations, returning top 3`
    );

    return {
      success: true,
      recommendations: topRecommendations,
      mlServiceAvailable: mlAvailable,
      message: `Found ${topRecommendations.length} recommended parking spots`,
    };
  } catch (error: any) {
    console.error("❌ Error generating recommendations:", error);
    throw new Error(`Failed to generate recommendations: ${error.message}`);
  }
};
