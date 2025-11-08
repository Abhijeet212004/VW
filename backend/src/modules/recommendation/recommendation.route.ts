import { Router } from "express";
import * as recommendationController from "./recommendation.controller";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Recommendations
 *     description: Smart parking spot recommendations
 */

/**
 * @openapi
 * /api/recommend-parking:
 *   post:
 *     tags:
 *       - Recommendations
 *     summary: Get smart parking recommendations
 *     description: |
 *       Returns top 3 recommended parking spots based on:
 *       - Distance from destination
 *       - Real-time slot availability
 *       - ML-predicted availability at arrival time
 *       - Price and amenities
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userLatitude
 *               - userLongitude
 *               - destinationLatitude
 *               - destinationLongitude
 *               - vehicleType
 *             properties:
 *               userLatitude:
 *                 type: number
 *                 example: 18.5204
 *                 description: User's current latitude
 *               userLongitude:
 *                 type: number
 *                 example: 73.8567
 *                 description: User's current longitude
 *               destinationLatitude:
 *                 type: number
 *                 example: 18.5324
 *                 description: Destination latitude
 *               destinationLongitude:
 *                 type: number
 *                 example: 73.8467
 *                 description: Destination longitude
 *               vehicleType:
 *                 type: string
 *                 enum: [car, bike, large_vehicle, disabled]
 *                 example: car
 *                 description: Type of vehicle
 *               radiusKm:
 *                 type: number
 *                 example: 3
 *                 default: 3
 *                 description: Search radius in kilometers
 *               arrivalTimeMinutes:
 *                 type: number
 *                 example: 15
 *                 default: 15
 *                 description: Expected arrival time from now (minutes)
 *     responses:
 *       '200':
 *         description: Successfully retrieved recommendations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 recommendations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       spotId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       address:
 *                         type: string
 *                       latitude:
 *                         type: number
 *                       longitude:
 *                         type: number
 *                       distanceFromDestination:
 *                         type: number
 *                         description: Distance in km
 *                       distanceFromUser:
 *                         type: number
 *                         description: Distance in km
 *                       estimatedTravelTime:
 *                         type: number
 *                         description: Travel time in minutes
 *                       totalSlots:
 *                         type: integer
 *                       currentFreeSlots:
 *                         type: integer
 *                       currentOccupancyRate:
 *                         type: number
 *                       predictedOccupancyProbability:
 *                         type: number
 *                       predictedAvailability:
 *                         type: number
 *                       mlConfidence:
 *                         type: number
 *                       recommendationScore:
 *                         type: integer
 *                         description: Score out of 100
 *                       pricePerHour:
 *                         type: number
 *                       isCovered:
 *                         type: boolean
 *                       hasSecurity:
 *                         type: boolean
 *                       hasEVCharging:
 *                         type: boolean
 *                       rating:
 *                         type: number
 *                       scoreBreakdown:
 *                         type: object
 *                         properties:
 *                           distanceScore:
 *                             type: number
 *                           availabilityScore:
 *                             type: number
 *                           mlPredictionScore:
 *                             type: number
 *                           priceScore:
 *                             type: number
 *                           amenitiesScore:
 *                             type: number
 *                 mlServiceAvailable:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       '400':
 *         description: Invalid request parameters
 *       '500':
 *         description: Server error
 */
router.post("/", recommendationController.getRecommendations);

export default router;
