import { parkingSpotRepository } from "./parkingSpot.repository";

export const parkingSpotService = {
  addParkingSpot: async (data: any) => {
    // Validate required fields
    if (!data.name || !data.address || data.latitude === undefined || data.longitude === undefined || data.totalSpots === undefined) {
      throw new Error('Missing required fields: name, address, latitude, longitude, totalSpots');
    }

    // Default availableSpots = totalSpots if not given
    const availableSpots = data.availableSpots ?? data.totalSpots;

    // Ensure pricePerHour exists (Prisma schema requires it)
    const pricePerHour = data.pricePerHour ?? 0;

    // Build a sanitized payload so we don't pass unknown fields (e.g. metadata) to Prisma
    const payload: any = {
      name: String(data.name),
      address: String(data.address),
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      totalSpots: Number(data.totalSpots),
      availableSpots: Number(availableSpots),
      pricePerHour: Number(pricePerHour),
    };

    // Optional fields (only add if present)
    if (data.isCovered !== undefined) payload.isCovered = Boolean(data.isCovered);
    if (data.hasSecurity !== undefined) payload.hasSecurity = Boolean(data.hasSecurity);
    if (data.hasEVCharging !== undefined) payload.hasEVCharging = Boolean(data.hasEVCharging);
    if (data.rating !== undefined) payload.rating = Number(data.rating);
    if (data.entryCameraId !== undefined) payload.entryCameraId = String(data.entryCameraId);
    if (data.exitCameraId !== undefined) payload.exitCameraId = String(data.exitCameraId);
    if (data.hasALPR !== undefined) payload.hasALPR = Boolean(data.hasALPR);
    if (data.overtimePriceMultiplier !== undefined) payload.overtimePriceMultiplier = Number(data.overtimePriceMultiplier);
    if (data.isActive !== undefined) payload.isActive = Boolean(data.isActive);

    return await parkingSpotRepository.createParkingSpot(payload);
  },
};
