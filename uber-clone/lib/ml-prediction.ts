/**
 * ML Prediction Service
 * Connects to FastAPI ML service for parking availability predictions
 */

// ML Service Configuration
const ML_API_BASE_URL = 'http://localhost:8000'; // FastAPI ML service

export interface PredictionInput {
  user_location: {
    lat: number;
    lng: number;
  };
  parking_area: string;
  vehicle_type?: string;
  planned_arrival_time?: string; // ISO format or null for "now"
  current_slot_data?: {
    available_spots: number;
    total_spots: number;
  };
}

export interface PredictionResult {
  success: boolean;
  parking_area: string;
  availability_percentage: number;
  estimated_arrival_time: string;
  travel_info: {
    distance_km: number;
    travel_time_minutes: number;
    traffic_factor: number;
  };
  conditions: {
    weather: string;
    temperature: number;
    traffic_density: number;
  };
  confidence?: string;
}

export interface RecommendationInput {
  destination_location: {
    lat: number;
    lng: number;
  };
  planned_arrival_time: string;
  vehicle_type?: string;
  max_walking_distance?: number; // meters
}

export interface RecommendationResult {
  success: boolean;
  destination: {
    lat: number;
    lng: number;
  };
  arrival_time: string;
  top_recommendations: Array<{
    parking_area: string;
    parking_id: string;
    availability_percentage: number;
    walking_distance_meters: number;
    walking_time_minutes: number;
    total_slots: number;
    coordinates: {
      lat: number;
      lng: number;
    };
    travel_info: {
      distance_km: number;
      travel_time_minutes: number;
      traffic_factor: number;
    };
    conditions: {
      weather: string;
      temperature: number;
      traffic_density: number;
    };
  }>;
  total_options: number;
}

/**
 * Get ML prediction for specific parking spot availability
 */
export const getParkingPrediction = async (input: PredictionInput): Promise<PredictionResult> => {
  try {
    console.log('🤖 Calling ML prediction API:', input);
    
    const requestBody = {
      user_location: input.user_location,
      parking_area: input.parking_area,
      vehicle_type: input.vehicle_type || 'car',
      planned_arrival_time: input.planned_arrival_time || null,
      ...(input.current_slot_data && { current_slot_data: input.current_slot_data }),
    };
    
    const response = await fetch(`${ML_API_BASE_URL}/predict-availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`ML API error: ${response.status} ${response.statusText}`);
    }

    const data: PredictionResult = await response.json();
    console.log('✅ ML prediction result:', data);
    return data;

  } catch (error) {
    console.error('❌ ML prediction failed:', error);
    
    // Fallback prediction when ML service is unavailable
    return {
      success: false,
      parking_area: 'Unknown',
      availability_percentage: 65, // Default fallback
      estimated_arrival_time: new Date().toISOString(),
      travel_info: {
        distance_km: 2.0,
        travel_time_minutes: 5,
        traffic_factor: 1.0,
      },
      conditions: {
        weather: 'Clear',
        temperature: 25,
        traffic_density: 0.5,
      },
      confidence: 'Low (Offline)',
    };
  }
};

/**
 * Get parking recommendations for a destination
 */
export const getParkingRecommendations = async (input: RecommendationInput): Promise<RecommendationResult> => {
  try {
    console.log('🤖 Calling ML recommendations API:', input);
    
    const response = await fetch(`${ML_API_BASE_URL}/recommend-parking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination_location: input.destination_location,
        planned_arrival_time: input.planned_arrival_time,
        vehicle_type: input.vehicle_type || 'car',
        max_walking_distance: input.max_walking_distance || 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`ML API error: ${response.status} ${response.statusText}`);
    }

    const data: RecommendationResult = await response.json();
    console.log('✅ ML recommendations result:', data);
    return data;

  } catch (error) {
    console.error('❌ ML recommendations failed:', error);
    
    // Fallback recommendations when ML service is unavailable
    return {
      success: false,
      destination: input.destination_location,
      arrival_time: input.planned_arrival_time,
      top_recommendations: [],
      total_options: 0,
    };
  }
};

/**
 * Convert parking spot names to ML service area IDs
 */
export const convertToMLParkingArea = (parkingSpotName: string): string => {
  const nameMapping: { [key: string]: string } = {
    'PICT Main Campus Parking': 'pict_campus',
    'PICT Campus Parking': 'pict_campus',
    'Amanora Mall Parking': 'amanora_mall',
    'Seasons Mall Parking': 'seasons_mall', 
    'Kharadi IT Park Parking': 'kharadi_it_park',
    'EON IT Park Parking': 'eon_it_park',
  };

  return nameMapping[parkingSpotName] || 'pict_campus'; // Default to PICT
};

/**
 * Health check for ML service
 */
export const checkMLServiceHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${ML_API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
};