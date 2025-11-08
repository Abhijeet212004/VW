import { Router } from 'express';
import { requireCustomAuth } from '../../middlewares/customAuth.middleware';
import * as bookingController from './booking.controller';

const router = Router();

// Create a new booking
router.post('/create', requireCustomAuth, bookingController.createBooking);

// Get user's bookings
router.get('/user', requireCustomAuth, bookingController.getUserBookings);

// Get specific booking details
router.get('/:id', requireCustomAuth, bookingController.getBookingById);

export default router;