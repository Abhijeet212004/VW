import express from 'express';
import * as cvController from './cv.controller';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CVEvent:
 *       type: object
 *       required:
 *         - vehicleNumber
 *         - eventType
 *         - confidence
 *         - cameraId
 *       properties:
 *         vehicleNumber:
 *           type: string
 *           description: The vehicle registration number
 *         eventType:
 *           type: string
 *           enum: [ENTRY, EXIT, OVERSTAY_ALERT]
 *           description: Type of CV event
 *         confidence:
 *           type: number
 *           minimum: 0
 *           maximum: 1
 *           description: Detection confidence score
 *         cameraId:
 *           type: string
 *           description: Camera identifier
 *         parkingSpotId:
 *           type: string
 *           description: Parking spot UUID (optional)
 *         imageUrl:
 *           type: string
 *           description: URL to the captured image
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Event timestamp
 *     ALPREvent:
 *       type: object
 *       required:
 *         - vehicleNumber
 *         - eventType
 *         - confidence
 *         - cameraId
 *         - parkingSpotId
 *       properties:
 *         vehicleNumber:
 *           type: string
 *           description: The vehicle registration number
 *         eventType:
 *           type: string
 *           enum: [ENTRY, EXIT]
 *           description: Type of ALPR event
 *         confidence:
 *           type: number
 *           minimum: 0
 *           maximum: 1
 *           description: Detection confidence score
 *         cameraId:
 *           type: string
 *           description: Camera identifier
 *         parkingSpotId:
 *           type: string
 *           description: Parking spot UUID
 *         imageUrl:
 *           type: string
 *           description: URL to the captured image
 */

/**
 * @swagger
 * /api/cv/event:
 *   post:
 *     summary: Process a computer vision event
 *     tags: [CV]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CVEvent'
 *     responses:
 *       200:
 *         description: CV event processed successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.post('/event', cvController.handleCVEvent);

/**
 * @swagger
 * /api/cv/alpr:
 *   post:
 *     summary: Process an ALPR (Automatic License Plate Recognition) event
 *     tags: [CV]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ALPREvent'
 *     responses:
 *       200:
 *         description: ALPR event processed successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.post('/alpr', cvController.handleALPREvent);

/**
 * @swagger
 * /api/cv/logs:
 *   get:
 *     summary: Get CV logs with optional filters
 *     tags: [CV]
 *     parameters:
 *       - in: query
 *         name: vehicleNumber
 *         schema:
 *           type: string
 *         description: Filter by vehicle number
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *           enum: [ENTRY, EXIT, OVERSTAY_ALERT]
 *         description: Filter by event type
 *       - in: query
 *         name: processed
 *         schema:
 *           type: boolean
 *         description: Filter by processing status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter events from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter events until this date
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of logs to return
 *     responses:
 *       200:
 *         description: CV logs retrieved successfully
 */
router.get('/logs', cvController.getCVLogs);

/**
 * @swagger
 * /api/cv/activity:
 *   get:
 *     summary: Get recent CV activity for dashboard
 *     tags: [CV]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum number of recent activities to return
 *     responses:
 *       200:
 *         description: Recent activity retrieved successfully
 */
router.get('/activity', cvController.getRecentActivity);

export default router;