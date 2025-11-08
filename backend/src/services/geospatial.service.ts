import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

/**
 * Find parking spots within a given radius
 * Includes distance calculation for each spot
 */
export const findNearbyParkingSpots = async (
  location: GeoLocation,
  radiusKm: number = 3
) => {
  // Get all active parking spots
  const allSpots = await prisma.parkingSpot.findMany({
    where: {
      isActive: true,
    },
    include: {
      slots: {
        where: {
          isActive: true,
        },
      },
    },
  });

  // Calculate distances and filter by radius
  const nearbySpots = allSpots
    .map((spot) => {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        spot.latitude,
        spot.longitude
      );

      return {
        ...spot,
        distance,
      };
    })
    .filter((spot) => spot.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);

  return nearbySpots;
};

/**
 * Get current weather (mock - in production, use weather API)
 */
export const getCurrentWeather = (): string => {
  // In production, integrate with weather API (OpenWeatherMap, etc.)
  const hour = new Date().getHours();
  const month = new Date().getMonth();

  // Simple heuristic
  if (month >= 6 && month <= 8 && hour >= 10 && hour <= 16) {
    return "rainy"; // Monsoon season in India
  } else if (month >= 3 && month <= 5 && hour >= 11 && hour <= 17) {
    return "hot";
  }

  return "sunny";
};

/**
 * Get current event type (mock - in production, use events calendar)
 */
export const getCurrentEventType = (): string => {
  // In production, check against events calendar/database
  const date = new Date();
  const dayOfWeek = date.getDay();

  // Check if it's a weekend
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return "weekend";
  }

  // Check for public holidays (simplified)
  const publicHolidays = [
    "01-26", // Republic Day
    "08-15", // Independence Day
    "10-02", // Gandhi Jayanti
    "12-25", // Christmas
  ];

  const monthDay = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

  if (publicHolidays.includes(monthDay)) {
    return "public_holiday";
  }

  return "none";
};

/**
 * Determine area type and POI counts based on location
 * In production, this should query a POI database or API
 */
export const getAreaMetadata = (spot: any) => {
  // This is a simplified version - in production, use actual POI data
  // You could integrate with Google Places API or maintain your own POI database

  const areaName = spot.name.toLowerCase();
  const address = spot.address.toLowerCase();

  // Heuristics based on name/address
  let poi_office_count = 10;
  let poi_restaurant_count = 10;
  let poi_store_count = 10;

  if (
    areaName.includes("it park") ||
    areaName.includes("tech") ||
    areaName.includes("office")
  ) {
    poi_office_count = 30;
    poi_restaurant_count = 5;
    poi_store_count = 2;
  } else if (
    areaName.includes("mall") ||
    areaName.includes("market") ||
    areaName.includes("shopping")
  ) {
    poi_office_count = 2;
    poi_restaurant_count = 20;
    poi_store_count = 40;
  } else if (
    areaName.includes("restaurant") ||
    areaName.includes("dining") ||
    areaName.includes("food")
  ) {
    poi_office_count = 5;
    poi_restaurant_count = 30;
    poi_store_count = 10;
  } else if (
    areaName.includes("residential") ||
    areaName.includes("apartment") ||
    areaName.includes("society")
  ) {
    poi_office_count = 1;
    poi_restaurant_count = 2;
    poi_store_count = 2;
  }

  return {
    poi_office_count,
    poi_restaurant_count,
    poi_store_count,
  };
};

/**
 * Get real-time slot status summary for a parking spot
 */
export const getRealTimeSlotStatus = async (parkingSpotId: string) => {
  const slots = await prisma.parkingSlot.findMany({
    where: {
      parkingSpotId,
      isActive: true,
    },
  });

  const totalSlots = slots.length;
  const freeSlots = slots.filter((slot) => slot.status === "FREE").length;
  const occupiedSlots = slots.filter(
    (slot) => slot.status === "OCCUPIED"
  ).length;
  const blockedSlots = slots.filter((slot) => slot.status === "BLOCKED").length;

  return {
    totalSlots,
    freeSlots,
    occupiedSlots,
    blockedSlots,
    occupancyRate: totalSlots > 0 ? occupiedSlots / totalSlots : 0,
  };
};
