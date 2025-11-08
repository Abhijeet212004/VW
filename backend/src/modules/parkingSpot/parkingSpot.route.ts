import { Router } from "express";
import { parkingSpotController } from "./parkingSpot.controller";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: ParkingSpot
 *     description: Parking spot management
 */

/**
 * @openapi
 * /api/parking-spot/add:
 *   post:
 *     tags:
 *       - ParkingSpot
 *     summary: Add a new parking spot
 *     description: Creates a new parking spot record in the system.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParkingSpotCreate'
 *     responses:
 *       '201':
 *         description: Parking spot created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ParkingSpot'
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// POST /api/parking-spot/add
router.post("/add", parkingSpotController.addParkingSpot);

// GET /api/parking-spot/all
router.get("/all", parkingSpotController.getAllParkingSpots);

// GET /api/parking-spot/nearby
router.get("/nearby", parkingSpotController.getParkingSpotsNearLocation);

// GET /api/parking-spot/:id
router.get("/:id", parkingSpotController.getParkingSpotById);

// POST /api/parking-spot/predict
router.post("/predict", parkingSpotController.predictParkingAvailability);

// ML-Powered Routes
// POST /api/parking-spot/predict-ml
router.post("/predict-ml", parkingSpotController.predictWithML);

// POST /api/parking-spot/recommend-ml
router.post("/recommend-ml", parkingSpotController.recommendWithML);

// GET /api/parking-spot/ml-health
router.get("/ml-health", parkingSpotController.checkMLHealth);

export default router;
