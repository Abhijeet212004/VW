import { Request, Response, NextFunction } from 'express';
import * as cvService from './cv.service';
import { cvEventSchema, alprEventSchema } from './cv.validation';

export const handleCVEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { body } = cvEventSchema.parse({ body: req.body });
    
    const result = await cvService.processCVEvent(body);
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        cvLogId: result.cvLogId,
        bookingId: result.bookingId,
        eventType: result.eventType,
        vehicleNumber: result.vehicleNumber,
      }
    });
  } catch (error: any) {
    next(error);
  }
};

export const handleALPREvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { body } = alprEventSchema.parse({ body: req.body });
    
    const result = await cvService.processALPREvent(body);
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        cvLogId: result.cvLogId,
        bookingId: result.bookingId,
        eventType: result.eventType,
        vehicleNumber: result.vehicleNumber,
        booking: result.booking,
      }
    });
  } catch (error: any) {
    next(error);
  }
};

export const getCVLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      vehicleNumber,
      eventType,
      processed,
      startDate,
      endDate,
      limit,
    } = req.query;

    const filters: any = {};

    if (vehicleNumber) filters.vehicleNumber = vehicleNumber as string;
    if (eventType) filters.eventType = eventType as string;
    if (processed !== undefined) filters.processed = processed === 'true';
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (limit) filters.limit = parseInt(limit as string);

    const logs = await cvService.getCVLogs(filters);

    res.status(200).json({
      success: true,
      message: 'CV logs retrieved successfully',
      data: logs,
      count: logs.length,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getRecentActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 20, onlyBooked = 'true', deduplicateMinutes = 5 } = req.query;

    const logs = await cvService.getCVLogs({
      limit: parseInt(limit as string) * 3, // Get more records to allow for deduplication
    });

    // Filter logs to only include those with successful booking matches if onlyBooked is true
    const filteredLogs = onlyBooked === 'true' 
      ? logs.filter(log => log.bookingId !== null && log.booking !== null)
      : logs;

    // Deduplicate entries: Keep only the latest entry per vehicle within the specified time window
    const deduplicationWindow = parseInt(deduplicateMinutes as string) * 60 * 1000; // Convert minutes to milliseconds
    const vehicleEntryMap = new Map<string, typeof filteredLogs[0]>();
    
    // Sort by timestamp descending (newest first)
    const sortedLogs = filteredLogs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    for (const log of sortedLogs) {
      const vehicleKey = `${log.vehicleNumber}_${log.eventType}`;
      const existingEntry = vehicleEntryMap.get(vehicleKey);
      
      if (!existingEntry) {
        // First entry for this vehicle and event type
        vehicleEntryMap.set(vehicleKey, log);
      } else {
        // Check if this entry is within the deduplication window
        const timeDiff = new Date(existingEntry.timestamp).getTime() - new Date(log.timestamp).getTime();
        if (timeDiff > deduplicationWindow) {
          // Outside deduplication window, treat as separate entry
          vehicleEntryMap.set(vehicleKey, log);
        }
        // If within window, keep the existing (newer) entry
      }
    }

    // Convert back to array and limit results
    const deduplicatedLogs = Array.from(vehicleEntryMap.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, parseInt(limit as string));

    // Group by event type for dashboard stats (use deduplicated logs for stats)
    const stats = deduplicatedLogs.reduce((acc, log) => {
      const type = log.eventType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    res.status(200).json({
      success: true,
      message: 'Recent activity retrieved successfully',
      data: {
        logs: deduplicatedLogs,
        stats,
        totalEvents: deduplicatedLogs.length,
      }
    });
  } catch (error: any) {
    next(error);
  }
};