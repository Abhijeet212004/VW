import { Router } from 'express';
import * as dashboardController from './dashboard.controller';

const router = Router();

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', dashboardController.getDashboardStats);

// GET /api/dashboard/vehicles - Get vehicles data
router.get('/vehicles', dashboardController.getVehiclesData);

// GET /api/dashboard/slots - Get parking slots data
router.get('/slots', dashboardController.getParkingSlots);

export default router;