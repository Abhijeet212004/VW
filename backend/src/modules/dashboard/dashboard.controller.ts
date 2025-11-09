import { Request, Response, NextFunction } from 'express';
import * as dashboardService from './dashboard.service';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    
    res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: stats
    });
  } catch (error: any) {
    next(error);
  }
};

export const getVehiclesData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, vehicleNumber, limit } = req.query;
    
    const filters: any = {};
    if (status) filters.status = status as string;
    if (vehicleNumber) filters.vehicleNumber = vehicleNumber as string;
    if (limit) filters.limit = parseInt(limit as string);
    
    const vehicles = await dashboardService.getVehiclesData(filters);
    
    res.status(200).json({
      success: true,
      message: 'Vehicles data retrieved successfully',
      data: {
        vehicles,
        count: vehicles.length
      }
    });
  } catch (error: any) {
    next(error);
  }
};

export const getParkingSlots = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slotsData = await dashboardService.getParkingSlotsData();
    
    res.status(200).json({
      success: true,
      message: 'Parking slots data retrieved successfully',
      data: slotsData
    });
  } catch (error: any) {
    next(error);
  }
};