import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const parkingSpotRepository = {
  createParkingSpot: async (data: any) => {
    return await prisma.parkingSpot.create({
      data,
    });
  },
};
