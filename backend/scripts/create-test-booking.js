const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestBooking() {
  try {
    console.log('Creating test user...');
    const user = await prisma.user.upsert({
      where: { clerkId: 'test-clerk-id-ocr-001' },
      update: {},
      create: {
        name: 'Test User',
        email: 'test_user_alpr@example.com',
        phone: '9999999999',
        clerkId: 'test-clerk-id-ocr-001'
      },
    });

    console.log('Creating test vehicle...');
    const vehicle = await prisma.vehicle.upsert({
      where: { registrationNumber: 'MH12QB2053' },
      update: {},
      create: {
        userId: user.id,
        registrationNumber: 'MH12QB2053',
        ownerName: user.name,
        enteredName: user.name,
        make: 'TestMake',
        model: 'TestModel',
        color: 'White',
        registrationDate: new Date(),
        verificationStatus: 'VERIFIED',
        verificationMethod: 'MANUAL_ENTRY',
        isActive: true,
      },
    });

    console.log('Creating confirmed booking...');
    const start = new Date();
    const end = new Date(Date.now() + 60 * 60 * 1000); // +1 hour
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        vehicleId: vehicle.id,
        parkingSpotId: 'd38431ce-1925-4d7b-abb7-82478e1b9684',
        bookedStartTime: start,
        bookedEndTime: end,
        bookedDuration: 60,
        baseAmount: 20.0,
        extraTimeAmount: 0,
        totalAmount: 20.0,
        paymentMode: 'PREPAID',
        paymentStatus: 'COMPLETED',
        status: 'CONFIRMED',
      },
    });

    console.log('✅ Test booking created:');
    console.log({ userId: user.id, vehicleId: vehicle.id, bookingId: booking.id });
  } catch (err) {
    console.error('Failed to create test booking:', err);
  } finally {
    await prisma.$disconnect();
  }
}

createTestBooking();
