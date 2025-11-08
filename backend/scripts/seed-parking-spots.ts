import { PrismaClient, SlotStatus } from "@prisma/client";

const prisma = new PrismaClient();

// Pune parking spot data
const puneParkingSpots = [
  {
    name: "PICT Main Campus Parking",
    address: "Pune Institute of Computer Technology, Dhankawadi, Pune",
    latitude: 18.5204,
    longitude: 73.8567,
    totalSpots: 60,
    availableSpots: 45,
    pricePerHour: 20,
    isCovered: true,
    hasSecurity: true,
    hasEVCharging: false,
    rating: 4.5,
    hasALPR: true,
    entryCameraId: "PICT-ENTRY-01",
    exitCameraId: "PICT-EXIT-01",
  },
  {
    name: "Sinhagad Road Mall Parking",
    address: "Sinhagad Road, Near PICT, Pune",
    latitude: 18.5224,
    longitude: 73.8587,
    totalSpots: 150,
    availableSpots: 120,
    pricePerHour: 25,
    isCovered: true,
    hasSecurity: true,
    hasEVCharging: true,
    rating: 4.6,
    hasALPR: true,
    entryCameraId: "MALL-ENTRY-01",
    exitCameraId: "MALL-EXIT-01",
  },
  {
    name: "Hinjewadi IT Park Parking",
    address: "Rajiv Gandhi Infotech Park, Phase 1, Hinjewadi, Pune",
    latitude: 18.5913,
    longitude: 73.7389,
    totalSpots: 200,
    availableSpots: 50,
    pricePerHour: 30,
    isCovered: false,
    hasSecurity: true,
    hasEVCharging: true,
    rating: 4.2,
    hasALPR: true,
    entryCameraId: "HINJ-ENTRY-01",
    exitCameraId: "HINJ-EXIT-01",
  },
  {
    name: "Kothrud Market Parking",
    address: "Kothrud Market, Pune",
    latitude: 18.5074,
    longitude: 73.8077,
    totalSpots: 80,
    availableSpots: 60,
    pricePerHour: 15,
    isCovered: false,
    hasSecurity: false,
    hasEVCharging: false,
    rating: 3.8,
    hasALPR: false,
    entryCameraId: null,
    exitCameraId: null,
  },
  {
    name: "FC Road Shopping Complex",
    address: "Fergusson College Road, Shivajinagar, Pune",
    latitude: 18.5196,
    longitude: 73.841,
    totalSpots: 100,
    availableSpots: 75,
    pricePerHour: 20,
    isCovered: true,
    hasSecurity: true,
    hasEVCharging: false,
    rating: 4.3,
    hasALPR: true,
    entryCameraId: "FC-ENTRY-01",
    exitCameraId: "FC-EXIT-01",
  },
  {
    name: "Pune Railway Station Parking",
    address: "Pune Junction Railway Station, Pune",
    latitude: 18.5288,
    longitude: 73.874,
    totalSpots: 120,
    availableSpots: 30,
    pricePerHour: 10,
    isCovered: false,
    hasSecurity: true,
    hasEVCharging: false,
    rating: 3.5,
    hasALPR: true,
    entryCameraId: "STATION-ENTRY-01",
    exitCameraId: "STATION-EXIT-01",
  },
];

async function seedParkingData() {
  console.log("🌱 Starting parking data seed...");

  try {
    // Clear existing data (optional)
    console.log("🗑️  Clearing existing parking slots...");
    await prisma.parkingSlot.deleteMany({});

    console.log("🗑️  Clearing existing parking spots...");
    await prisma.parkingSpot.deleteMany({});

    // Create parking spots
    console.log("\n📍 Creating parking spots...");
    for (const spotData of puneParkingSpots) {
      const spot = await prisma.parkingSpot.create({
        data: spotData,
      });

      console.log(`✅ Created: ${spot.name} (${spot.totalSpots} slots)`);

      // Create parking slots for each spot
      console.log(`   🅿️  Creating ${spot.totalSpots} slots...`);

      const slotsToCreate = [];
      for (let i = 1; i <= spot.totalSpots; i++) {
        // Simulate some occupied slots based on availableSpots
        const isOccupied = i > spot.availableSpots;

        slotsToCreate.push({
          parkingSpotId: spot.id,
          slotNumber: i,
          cameraId: spot.hasALPR
            ? `${spot.entryCameraId?.split("-")[0]}-CAM-${String(i).padStart(
                3,
                "0"
              )}`
            : null,
          permanentSlotId: `${spot.name
            .substring(0, 4)
            .toUpperCase()}-SLOT-${String(i).padStart(3, "0")}`,
          status: isOccupied ? SlotStatus.OCCUPIED : SlotStatus.FREE,
          lastUpdated: new Date(),
          isActive: true,
        });
      }

      // Batch create slots
      await prisma.parkingSlot.createMany({
        data: slotsToCreate,
      });

      console.log(
        `   ✅ Created ${spot.totalSlots} slots (${spot.availableSpots} free, ${
          spot.totalSpots - spot.availableSpots
        } occupied)`
      );
    }

    console.log("\n🎉 Seed completed successfully!");
    console.log(`\n📊 Summary:`);

    const totalSpots = await prisma.parkingSpot.count();
    const totalSlots = await prisma.parkingSlot.count();
    const freeSlots = await prisma.parkingSlot.count({
      where: { status: SlotStatus.FREE },
    });
    const occupiedSlots = await prisma.parkingSlot.count({
      where: { status: SlotStatus.OCCUPIED },
    });

    console.log(`   • Parking Spots: ${totalSpots}`);
    console.log(`   • Total Slots: ${totalSlots}`);
    console.log(`   • Free Slots: ${freeSlots}`);
    console.log(`   • Occupied Slots: ${occupiedSlots}`);
    console.log(
      `   • Occupancy Rate: ${((occupiedSlots / totalSlots) * 100).toFixed(1)}%`
    );
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedParkingData().catch((error) => {
  console.error(error);
  process.exit(1);
});
