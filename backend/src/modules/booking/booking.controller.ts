import { Request, Response, NextFunction } from 'express';
import * as bookingService from './booking.service';

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth?.userId!;
    const { vehicleId, parkingSpotId, startTime, endTime, pricePerHour, paymentMode } = req.body;
    
    // Validate required fields
    if (!vehicleId || !parkingSpotId || !startTime || !endTime || !pricePerHour || !paymentMode) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: vehicleId, parkingSpotId, startTime, endTime, pricePerHour, paymentMode',
      });
    }
    
    const result = await bookingService.createBooking({
      userId,
      vehicleId,
      parkingSpotId,
      startTime,
      endTime,
      pricePerHour,
      paymentMode,
    });
    
    res.status(201).json({
      success: true,
      message: result.message,
      data: result.booking,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create booking',
    });
  }
};

export const getUserBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth?.userId!;
    
    const result = await bookingService.getUserBookings(userId);
    
    res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: result,
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get bookings',
    });
  }
};

export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth?.userId!;
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required',
      });
    }
    
    const booking = await bookingService.getBookingById(id, userId);
    
    res.status(200).json({
      success: true,
      message: 'Booking retrieved successfully',
      data: booking,
    });
  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(404).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get booking',
    });
  }
};