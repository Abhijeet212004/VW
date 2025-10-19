import { z } from 'zod';

export const verifyQRSchema = z.object({
  body: z.object({
    qrData: z.string().min(1, 'QR data is required'),
    vehiclePhoto: z.string().optional(),
  }),
});

export const verifyNameSchema = z.object({
  body: z.object({
    vehicleId: z.string().uuid('Invalid vehicle ID'),
    enteredName: z.string().min(2, 'Name must be at least 2 characters'),
  }),
});

export const getVehicleSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid vehicle ID'),
  }),
});

export const updateVehicleSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid vehicle ID'),
  }),
  body: z.object({
    color: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});
