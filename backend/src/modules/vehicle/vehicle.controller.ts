import { Request, Response, NextFunction } from 'express';
import * as vehicleService from './vehicle.service';

export const verifyQR = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth?.userId!;
    const { qrData, vehiclePhoto } = req.body;
    
    const result = await vehicleService.verifyVehicleQR(userId, qrData, vehiclePhoto);
    
    res.status(200).json({
      success: true,
      message: 'Vehicle QR scanned successfully. Please verify owner name.',
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

export const verifyName = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vehicleId, enteredName } = req.body;
    
    const result = await vehicleService.verifyVehicleName(vehicleId, enteredName);
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getMyVehicles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth?.userId!;
    
    const vehicles = await vehicleService.getUserVehicles(userId);
    
    res.status(200).json({
      success: true,
      data: { vehicles },
    });
  } catch (error: any) {
    next(error);
  }
};

export const getVehicleById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const vehicle = await vehicleService.getVehicleById(id);
    
    res.status(200).json({
      success: true,
      data: { vehicle },
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const vehicle = await vehicleService.updateVehicle(id, data);
    
    res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully',
      data: { vehicle },
    });
  } catch (error: any) {
    next(error);
  }
};

export const deleteVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    await vehicleService.deleteVehicle(id);
    
    res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully',
    });
  } catch (error: any) {
    next(error);
  }
};
