import axios from "axios";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5001";

export interface MLPredictionInput {
  spot_id?: string;
  slot_type: string;
  hour?: number;
  weekday?: number;
  weather: string;
  event_type: string;
  poi_office_count: number;
  poi_restaurant_count: number;
  poi_store_count: number;
}

export interface MLPredictionResult {
  spot_id?: string;
  prob_free: number;
  prob_occupied: number;
  prediction: "FREE" | "OCCUPIED" | "UNKNOWN";
  confidence: number;
  error?: string;
}

export interface MLBatchRequest {
  spots: MLPredictionInput[];
  hour?: number;
  weekday?: number;
}

export interface MLBatchResponse {
  success: boolean;
  predictions: MLPredictionResult[];
  context: {
    hour: number;
    weekday: number;
    timestamp: string;
  };
  error?: string;
}

/**
 * Check if ML service is available
 */
export const checkMLServiceHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`, {
      timeout: 3000,
    });
    return response.data.status === "healthy";
  } catch (error) {
    console.error("❌ ML Service health check failed:", error);
    return false;
  }
};

/**
 * Get single parking spot occupancy prediction
 */
export const predictOccupancy = async (
  input: MLPredictionInput
): Promise<MLPredictionResult> => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict`, input, {
      timeout: 5000,
      headers: { "Content-Type": "application/json" },
    });

    if (response.data.success) {
      return response.data.prediction;
    } else {
      throw new Error(response.data.error || "Prediction failed");
    }
  } catch (error: any) {
    console.error("❌ ML prediction failed:", error.message);
    // Return neutral prediction on error
    return {
      spot_id: input.spot_id,
      prob_free: 0.5,
      prob_occupied: 0.5,
      prediction: "UNKNOWN",
      confidence: 0.0,
      error: error.message,
    };
  }
};

/**
 * Get batch predictions for multiple parking spots
 */
export const predictBatch = async (
  request: MLBatchRequest
): Promise<MLBatchResponse> => {
  try {
    const response = await axios.post(
      `${ML_SERVICE_URL}/predict/batch`,
      request,
      {
        timeout: 10000,
        headers: { "Content-Type": "application/json" },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("❌ ML batch prediction failed:", error.message);

    // Return neutral predictions for all spots on error
    return {
      success: false,
      predictions: request.spots.map((spot) => ({
        spot_id: spot.spot_id,
        prob_free: 0.5,
        prob_occupied: 0.5,
        prediction: "UNKNOWN" as const,
        confidence: 0.0,
        error: error.message,
      })),
      context: {
        hour: request.hour || new Date().getHours(),
        weekday: request.weekday || new Date().getDay(),
        timestamp: new Date().toISOString(),
      },
      error: error.message,
    };
  }
};

/**
 * Get current time context from ML service
 */
export const getMLContext = async () => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/context`, {
      timeout: 3000,
    });
    return response.data.context;
  } catch (error) {
    console.error("❌ Failed to get ML context:", error);
    return null;
  }
};
