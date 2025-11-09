import { Router } from 'express';
import { ParkingPredictionService } from '../services/parkingPredictionService';
import { requireCustomAuth as authenticateToken } from '../middlewares/customAuth.middleware';

const router = Router();

/**
 * @route POST /api/parking/predict-availability
 * @desc Predict parking availability for specific spot when user arrives
 * @access Private
 * @body {
 *   user_location: { lat: number, lng: number },
 *   parking_area: string,
 *   vehicle_type?: string,
 *   planned_arrival_time?: string
 * }
 */
router.post('/predict-availability', authenticateToken, ParkingPredictionService.predictAvailability);

/**
 * @route POST /api/parking/recommend
 * @desc Get top 3 parking recommendations for destination and time
 * @access Private
 * @body {
 *   destination_location: { lat: number, lng: number },
 *   planned_arrival_time: string,
 *   vehicle_type?: string,
 *   max_walking_distance?: number
 * }
 */
router.post('/recommend', authenticateToken, ParkingPredictionService.recommendParking);

/**
 * @route GET /api/parking/current-status
 * @desc Get real-time parking status for all areas
 * @access Private
 */
router.get('/current-status', authenticateToken, ParkingPredictionService.getCurrentParkingStatus);

/**
 * @route GET /api/parking/health
 * @desc Health check for parking prediction services
 * @access Public
 */
router.get('/health', ParkingPredictionService.healthCheck);

/**
 * @route GET /api/parking/areas
 * @desc Get list of all available parking areas with basic info
 * @access Private
 */
router.get('/areas', authenticateToken, (req, res) => {
  try {
    const { PICT_PARKING_AREAS } = require('../services/parkingPredictionService');
    
    const areas = Object.entries(PICT_PARKING_AREAS).map(([areaId, areaInfo]: [string, any]) => ({
      area_id: areaId,
      name: areaInfo.name,
      total_slots: areaInfo.total_slots,
      coordinates: { lat: areaInfo.lat, lng: areaInfo.lng }
    }));

    res.json({
      success: true,
      parking_areas: areas,
      total_areas: areas.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Unable to fetch parking areas',
      message: error.message
    });
  }
});

export default router;