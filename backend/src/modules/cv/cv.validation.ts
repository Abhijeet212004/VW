import { z } from 'zod';

export const cvEventSchema = z.object({
  body: z.object({
    vehicleNumber: z.string().min(1, 'Vehicle number is required'),
    eventType: z.enum(['ENTRY', 'EXIT', 'OVERSTAY_ALERT'], {
      errorMap: () => ({ message: 'Event type must be ENTRY, EXIT, or OVERSTAY_ALERT' })
    }),
    confidence: z.number().min(0).max(1, 'Confidence must be between 0 and 1'),
    cameraId: z.string().min(1, 'Camera ID is required'),
    parkingSpotId: z.string().uuid('Invalid parking spot ID').optional(),
    imageUrl: z.string().url('Invalid image URL').optional(),
    timestamp: z.string().datetime().optional(),
  })
});

export const alprEventSchema = z.object({
  body: z.object({
    vehicleNumber: z.string().min(1, 'Vehicle number is required'),
    eventType: z.enum(['ENTRY', 'EXIT'], {
      errorMap: () => ({ message: 'Event type must be ENTRY or EXIT' })
    }),
    confidence: z.number().min(0).max(1, 'Confidence must be between 0 and 1'),
    cameraId: z.string().min(1, 'Camera ID is required'),
    parkingSpotId: z.string().uuid('Invalid parking spot ID'),
    imageUrl: z.string().url('Invalid image URL').optional(),
  })
});

export type CVEventRequest = z.infer<typeof cvEventSchema>;
export type ALPREventRequest = z.infer<typeof alprEventSchema>;