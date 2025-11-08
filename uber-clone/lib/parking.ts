import { ParkingSpot, ParkingMarkerData } from "@/types/type";

// Backend API URL - Update this to your backend URL
const API_BASE_URL = 'http://localhost:3000/api';

// Extended type for recommendation response
interface ParkingRecommendation {
  spotId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distanceFromDestination: number;
  distanceFromUser: number;
  estimatedTravelTime: number;
  totalSlots: number;
  currentFreeSlots: number;
  currentOccupancyRate: number;
  predictedOccupancyProbability: number;
  predictedAvailability: number;
  mlConfidence: number;
  recommendationScore: number;
  pricePerHour: number;
  isCovered: boolean;
  hasSecurity: boolean;
  hasEVCharging: boolean;
  rating: number;
  scoreBreakdown: {
    distanceScore: number;
    availabilityScore: number;
    mlPredictionScore: number;
    priceScore: number;
    amenitiesScore: number;
  };
}

// Mock parking data as fallback
const mockParkingSpots: ParkingSpot[] = [
  {
    id: 1,
    name: "PICT Main Campus Parking",
    address: "Pune Institute of Computer Technology, Dhankawadi, Pune",
    latitude: 18.5204,
    longitude: 73.8567,
    price_per_hour: 20,
    available_spots: 45,
    total_spots: 60,
    is_covered: true,
    has_security: true,
    rating: 4.5,
    image_url: "https://example.com/pict-main.jpg"
  },
  {
    id: 2,
    name: "Sinhagad Road Mall Parking",
    address: "Sinhagad Road, Near PICT, Pune",
    latitude: 18.5224,
    longitude: 73.8587,
    price_per_hour: 25,
    available_spots: 120,
    total_spots: 150,
    is_covered: true,
    has_security: true,
    rating: 4.6,
    image_url: "https://example.com/mall-parking.jpg"
  }
];

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

/**
 * Get smart parking recommendations from backend API
 * Uses ML-powered recommendation system
 */
export const getParkingRecommendations = async (
  userLatitude: number,
  userLongitude: number,
  destinationLatitude: number,
  destinationLongitude: number,
  vehicleType: string = 'car',
  radiusKm: number = 3
): Promise<ParkingSpot[]> => {
  try {
    console.log('🎯 Calling recommendation API...');
    console.log(`User: ${userLatitude}, ${userLongitude}`);
    console.log(`Destination: ${destinationLatitude}, ${destinationLongitude}`);
    
    const response = await fetch(`${API_BASE_URL}/recommend-parking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude,
        vehicleType,
        radiusKm,
        arrivalTimeMinutes: 15 // Default 15 minutes arrival time
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.recommendations) {
      throw new Error('Invalid API response');
    }

    console.log(`✅ Got ${data.recommendations.length} recommendations`);
    console.log(`ML Service: ${data.mlServiceAvailable ? 'Available' : 'Unavailable'}`);
    
    // Convert recommendations to ParkingSpot format
    const parkingSpots: ParkingSpot[] = data.recommendations.map((rec: ParkingRecommendation, index: number) => ({
      id: index + 1, // Generate numeric ID for compatibility
      spotId: rec.spotId, // Keep original UUID
      name: rec.name,
      address: rec.address,
      latitude: rec.latitude,
      longitude: rec.longitude,
      price_per_hour: rec.pricePerHour,
      available_spots: rec.currentFreeSlots,
      total_spots: rec.totalSlots,
      is_covered: rec.isCovered,
      has_security: rec.hasSecurity,
      has_ev_charging: rec.hasEVCharging,
      rating: rec.rating,
      distance: rec.distanceFromDestination,
      
      // Additional ML-powered fields
      recommendationScore: rec.recommendationScore,
      predictedAvailability: rec.predictedAvailability,
      mlConfidence: rec.mlConfidence,
      estimatedTravelTime: rec.estimatedTravelTime,
      scoreBreakdown: rec.scoreBreakdown
    }));

    return parkingSpots;
    
  } catch (error) {
    console.error('❌ Error fetching recommendations:', error);
    console.log('📦 Falling back to mock data');
    
    // Fallback to mock data with distance calculation
    return mockParkingSpots.map(spot => ({
      ...spot,
      distance: calculateDistance(
        destinationLatitude,
        destinationLongitude,
        spot.latitude,
        spot.longitude
      )
    })).sort((a, b) => a.distance! - b.distance!);
  }
};

/**
 * Legacy function - kept for backward compatibility
 * Searches for parking spots near a location using simple distance calculation
 */
export const getParkingSpotsNearLocation = async (
  latitude: number,
  longitude: number,
  radius: number = 10
): Promise<ParkingSpot[]> => {
  // For find-parking screen, use the smart recommendation API
  // Use the search location as destination
  return getParkingRecommendations(
    latitude, // User at search location
    longitude,
    latitude, // Destination is same as user location for search
    longitude,
    'car',
    radius
  );
};

export const convertToMarkerData = (spots: ParkingSpot[]): ParkingMarkerData[] => {
  return spots.map(spot => ({
    latitude: spot.latitude,
    longitude: spot.longitude,
    id: spot.id,
    title: spot.name,
    address: spot.address,
    price_per_hour: spot.price_per_hour,
    available_spots: spot.available_spots,
    total_spots: spot.total_spots,
    is_covered: spot.is_covered,
    has_security: spot.has_security,
    rating: spot.rating,
    distance: spot.distance,
    image_url: spot.image_url
  }));
};

export const getAllParkingSpots = async (): Promise<ParkingSpot[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockParkingSpots;
};