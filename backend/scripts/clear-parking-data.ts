import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--yes');

  const slotCount = await prisma.parkingSlot.count();
  const logCount = await prisma.slotCVLog.count();

  console.log(`ParkingSlot rows: ${slotCount}`);
  console.log(`SlotCVLog rows: ${logCount}`);


  // Delete logs first to avoid foreign key constraints
  const deletedLogs = await prisma.slotCVLog.deleteMany({});
  const deletedSlots = await prisma.parkingSlot.deleteMany({});

  console.log(`Deleted SlotCVLog: ${deletedLogs.count}`);
  console.log(`Deleted ParkingSlot: ${deletedSlots.count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
