import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Helper function to calculate distance between two coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const parkingSpotRepository = {
  createParkingSpot: async (data: any) => {
    return await prisma.parkingSpot.create({
      data,
    });
  },

  getAllParkingSpotsWithSlots: async () => {
    const spots = await prisma.parkingSpot.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            slots: {
              where: {
                isActive: true,
                status: 'FREE'
              }
            }
          }
        },
        slots: {
          where: { isActive: true },
          select: {
            id: true,
            slotNumber: true,
            status: true,
            isActive: true,
            lastUpdated: true
          }
        }
      }
    });

    // Calculate real available spots from slot details and update totalSpots
    return spots.map(spot => ({
      ...spot,
      availableSpots: spot._count.slots, // FREE slots count
      totalSpots: Math.min(55, Math.max(spot.totalSpots, spot.slots.length)), // Limit to 55 slots
      realTimeSlots: spot.slots.slice(0, 55) // Only show first 55 slots
    }));
  },

  getParkingSpotsNearLocation: async (latitude: number, longitude: number, radius: number) => {
    const spots = await prisma.parkingSpot.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            slots: {
              where: {
                isActive: true,
                status: 'FREE'
              }
            }
          }
        },
        slots: {
          where: { isActive: true },
          select: {
            id: true,
            slotNumber: true,
            status: true,
            isActive: true,
            lastUpdated: true
          }
        }
      }
    });

    // Filter by distance and add distance field
    const nearbySpots = spots
      .map(spot => ({
        ...spot,
        distance: calculateDistance(latitude, longitude, spot.latitude, spot.longitude),
        availableSpots: spot._count.slots, // FREE slots count
        totalSpots: Math.min(55, Math.max(spot.totalSpots, spot.slots.length)), // Limit to 55 slots
        realTimeSlots: spot.slots.slice(0, 55) // Only show first 55 slots
      }))
      .filter(spot => spot.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    return nearbySpots;
  },

  getParkingSpotWithSlots: async (id: string) => {
    const spot = await prisma.parkingSpot.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            slots: {
              where: {
                isActive: true,
                status: 'FREE'
              }
            }
          }
        },
        slots: {
          where: { isActive: true },
          select: {
            id: true,
            slotNumber: true,
            status: true,
            isActive: true,
            lastUpdated: true
          }
        }
      }
    });

    if (!spot) return null;

    return {
      ...spot,
      availableSpots: spot._count.slots, // FREE slots count
      totalSpots: Math.min(55, Math.max(spot.totalSpots, spot.slots.length)), // Limit to 55 slots
      realTimeSlots: spot.slots.slice(0, 55) // Only show first 55 slots
    };
  },
};
