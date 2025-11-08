import { ParkingSpot, ParkingMarkerData } from "@/types/type";

const API_BASE_URL = "http://localhost:3000/api";

// Transform backend data to frontend format
const transformParkingSpot = (backendSpot: any): ParkingSpot => ({
  id: backendSpot.id,
  name: backendSpot.name,
  address: backendSpot.address,
  latitude: backendSpot.latitude,
  longitude: backendSpot.longitude,
  price_per_hour: backendSpot.pricePerHour,
  available_spots: backendSpot.availableSpots,
  total_spots: backendSpot.totalSpots,
  is_covered: backendSpot.isCovered,
  has_security: backendSpot.hasSecurity,
  rating: backendSpot.rating,
  image_url: backendSpot.imageUrl || "https://example.com/parking.jpg",
  distance: backendSpot.distance
});

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

export const getParkingSpotsNearLocation = async (
  latitude: number,
  longitude: number,
  radius: number = 10 // radius in kilometers
): Promise<ParkingSpot[]> => {
  try {
    console.log(`Finding parking spots near: ${latitude}, ${longitude} within ${radius}km`);
    
    const response = await fetch(
      `${API_BASE_URL}/parking-spot/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch parking spots');
    }
    
    const spots = result.data.map(transformParkingSpot);
    
    console.log(`Found ${spots.length} parking spots within ${radius}km`);
    spots.forEach(spot => {
      console.log(`- ${spot.name}: ${spot.distance?.toFixed(2)}km away, ${spot.available_spots}/${spot.total_spots} available`);
    });
    
    return spots;
  } catch (error) {
    console.error('Error fetching parking spots:', error);
    return [];
  }
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
  try {
    const response = await fetch(`${API_BASE_URL}/parking-spot/all`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch parking spots');
    }
    
    return result.data.map(transformParkingSpot);
  } catch (error) {
    console.error('Error fetching all parking spots:', error);
    return [];
  }
};