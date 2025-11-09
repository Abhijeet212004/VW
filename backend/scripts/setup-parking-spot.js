const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupParkingSpot() {
  try {
    console.log('🅿️ Setting up parking spot with 55 slots...');

    // Create or update the main parking spot
    const parkingSpot = await prisma.parkingSpot.upsert({
      where: { 
        id: 'd38431ce-1925-4d7b-abb7-82478e1b9684' // Fixed ID for CV integration
      },
      update: {
        name: 'PICT Pune Smart Parking',
        address: 'Pune Institute of Computer Technology, Dhankawadi, Pune',
        latitude: 18.5204,
        longitude: 73.8567,
        totalSpots: 55,
        availableSpots: 55,
        pricePerHour: 20.0,
        isCovered: false,
        hasSecurity: true,
        hasEVCharging: false,
        rating: 4.5,
        imageUrl: 'https://example.com/parking-image.jpg',
        entryCameraId: 'CAM_001',
        exitCameraId: 'CAM_002',
        hasALPR: true,
        overtimePriceMultiplier: 1.5,
        isActive: true,
        updatedAt: new Date()
      },
      create: {
        id: 'd38431ce-1925-4d7b-abb7-82478e1b9684',
        name: 'PICT Pune Smart Parking',
        address: 'Pune Institute of Computer Technology, Dhankawadi, Pune',
        latitude: 18.5204,
        longitude: 73.8567,
        totalSpots: 55,
        availableSpots: 55,
        pricePerHour: 20.0,
        isCovered: false,
        hasSecurity: true,
        hasEVCharging: false,
        rating: 4.5,
        imageUrl: 'https://example.com/parking-image.jpg',
        entryCameraId: 'CAM_001',
        exitCameraId: 'CAM_002',
        hasALPR: true,
        overtimePriceMultiplier: 1.5,
        isActive: true
      }
    });

    console.log('✅ Parking spot created/updated:', parkingSpot.name);

    // Delete existing slots to recreate them
    await prisma.parkingSlot.deleteMany({
      where: { parkingSpotId: parkingSpot.id }
    });

    console.log('🗑️ Cleared existing slots');

    // Create 55 parking slots
    const slots = [];
    for (let i = 1; i <= 55; i++) {
      slots.push({
        parkingSpotId: parkingSpot.id,
        slotNumber: i,
        cameraId: 'CAM_001', // All slots monitored by same camera
        permanentSlotId: `A-${i.toString().padStart(2, '0')}`, // A-01, A-02, etc.
        status: 'FREE',
        lastUpdated: new Date(),
        isActive: true
      });
    }

    // Batch create all slots
    const createdSlots = await prisma.parkingSlot.createMany({
      data: slots
    });

    console.log(`✅ Created ${createdSlots.count} parking slots`);

    // Verify the setup
    const totalSlots = await prisma.parkingSlot.count({
      where: { parkingSpotId: parkingSpot.id }
    });

    const freeSlots = await prisma.parkingSlot.count({
      where: { 
        parkingSpotId: parkingSpot.id,
        status: 'FREE'
      }
    });

    console.log('\n📊 Setup Summary:');
    console.log(`- Parking Spot: ${parkingSpot.name}`);
    console.log(`- Location: ${parkingSpot.address}`);
    console.log(`- Total Slots: ${totalSlots}`);
    console.log(`- Free Slots: ${freeSlots}`);
    console.log(`- Price: ₹${parkingSpot.pricePerHour}/hour`);
    console.log(`- CV Integration: ${parkingSpot.hasALPR ? 'Enabled' : 'Disabled'}`);

    console.log('\n🔗 CV Dashboard Connection:');
    console.log(`- Parking Spot ID: ${parkingSpot.id}`);
    console.log(`- API Endpoint: http://localhost:3000/api/slot-details`);
    console.log(`- Slot Range: A-01 to A-55`);

  } catch (error) {
    console.error('❌ Error setting up parking spot:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupParkingSpot();