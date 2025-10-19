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

export default router;
