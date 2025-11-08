import { Router } from 'express';
import * as vehicleController from './vehicle.controller';
import { validateRequest } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireCustomAuth } from '../../middlewares/customAuth.middleware';
import {
  verifyQRSchema,
  verifyNameSchema,
  getVehicleSchema,
  updateVehicleSchema,
} from './vehicle.validation';

const router = Router();

/**
 * @swagger
 * /api/vehicle/verify-qr:
 *   post:
 *     summary: Verify vehicle using QR code (Step 1)
 *     tags: [Vehicle]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qrData
 *             properties:
 *               qrData:
 *                 type: string
 *                 example: "MH12AB1234"
 *               vehiclePhoto:
 *                 type: string
 *                 description: Base64 encoded photo or URL
 *     responses:
 *       200:
 *         description: Vehicle QR scanned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     vehicleId:
 *                       type: string
 *                     registrationNumber:
 *                       type: string
 *                     make:
 *                       type: string
 *                     model:
 *                       type: string
 *                     requiresNameVerification:
 *                       type: boolean
 *       400:
 *         description: Vehicle already registered
 */
router.post(
  '/verify-qr',
  requireAuth,
  validateRequest(verifyQRSchema),
  vehicleController.verifyQR
);

/**
 * @swagger
 * /api/vehicle/verify-name:
 *   post:
 *     summary: Verify vehicle owner name (Step 2)
 *     tags: [Vehicle]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicleId
 *               - enteredName
 *             properties:
 *               vehicleId:
 *                 type: string
 *                 format: uuid
 *               enteredName:
 *                 type: string
 *                 example: "Abhijeet Singh"
 *     responses:
 *       200:
 *         description: Name verification completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     matchScore:
 *                       type: number
 *                       example: 87.5
 *                     verificationStatus:
 *                       type: string
 *                       enum: [AUTO_VERIFIED, MANUAL_REVIEW, REJECTED]
 */
router.post(
  '/verify-name',
  requireAuth,
  validateRequest(verifyNameSchema),
  vehicleController.verifyName
);

/**
 * @swagger
 * /api/vehicle/my-vehicles:
 *   get:
 *     summary: Get all user vehicles
 *     tags: [Vehicle]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of user vehicles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     vehicles:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.get('/my-vehicles', requireCustomAuth, vehicleController.getMyVehicles);

/**
 * @swagger
 * /api/vehicle/{id}:
 *   get:
 *     summary: Get vehicle by ID
 *     tags: [Vehicle]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Vehicle details
 *       404:
 *         description: Vehicle not found
 */
router.get(
  '/:id',
  requireAuth,
  validateRequest(getVehicleSchema),
  vehicleController.getVehicleById
);

/**
 * @swagger
 * /api/vehicle/{id}:
 *   patch:
 *     summary: Update vehicle
 *     tags: [Vehicle]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               color:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Vehicle updated
 */
router.patch(
  '/:id',
  requireAuth,
  validateRequest(updateVehicleSchema),
  vehicleController.updateVehicle
);

/**
 * @swagger
 * /api/vehicle/{id}:
 *   delete:
 *     summary: Delete vehicle
 *     tags: [Vehicle]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vehicle deleted
 */
router.delete(
  '/:id',
  requireAuth,
  validateRequest(getVehicleSchema),
  vehicleController.deleteVehicle
);

/**
 * @swagger
 * /api/vehicle/quick-register:
 *   post:
 *     summary: Quick register vehicle with license plate
 *     tags: [Vehicle]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - licensePlate
 *             properties:
 *               licensePlate:
 *                 type: string
 *                 example: "MH12AB1234"
 *     responses:
 *       200:
 *         description: Vehicle registered successfully
 */
router.post(
  '/quick-register',
  requireCustomAuth,
  vehicleController.quickRegister
);

export default router;
