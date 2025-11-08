import { prisma } from '../../config/database';
import { CVEventType } from '@prisma/client';

export const getDashboardStats = async () => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Total registered vehicles
  const totalVehicles = await prisma.vehicle.count({
    where: {
      isActive: true
    }
  });

  // Active bookings (currently ongoing)
  const activeBookings = await prisma.booking.count({
    where: {
      status: 'ACTIVE'
    }
  });

  // Total users
  const totalUsers = await prisma.user.count();

  // Today's revenue
  const todayRevenue = await prisma.booking.aggregate({
    where: {
      createdAt: {
        gte: startOfDay
      },
      paymentStatus: 'COMPLETED'
    },
    _sum: {
      totalAmount: true
    }
  });

  // Previous day revenue for comparison
  const yesterdayStart = new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayRevenue = await prisma.booking.aggregate({
    where: {
      createdAt: {
        gte: yesterdayStart,
        lt: startOfDay
      },
      paymentStatus: 'COMPLETED'
    },
    _sum: {
      totalAmount: true
    }
  });

  // Calculate revenue change
  const todayAmount = todayRevenue._sum.totalAmount || 0;
  const yesterdayAmount = yesterdayRevenue._sum.totalAmount || 0;
  const revenueChange = yesterdayAmount > 0 
    ? Math.round(((todayAmount - yesterdayAmount) / yesterdayAmount) * 100)
    : 0;

  // Weekly active bookings for comparison
  const weeklyBookings = await prisma.booking.count({
    where: {
      createdAt: {
        gte: startOfWeek
      }
    }
  });

  const previousWeekStart = new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000);
  const previousWeekBookings = await prisma.booking.count({
    where: {
      createdAt: {
        gte: previousWeekStart,
        lt: startOfWeek
      }
    }
  });

  // Calculate booking change
  const bookingChange = previousWeekBookings > 0 
    ? Math.round(((weeklyBookings - previousWeekBookings) / previousWeekBookings) * 100)
    : 0;

  // Recent booking activity with real data
  const recentBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: {
      updatedAt: 'desc'
    },
    include: {
      vehicle: true,
      user: true,
      parkingSpot: true
    },
    where: {
      OR: [
        { status: 'ACTIVE' },
        { status: 'COMPLETED' },
        { actualEntryTime: { not: null } },
        { actualExitTime: { not: null } }
      ]
    }
  });

  return {
    stats: {
      totalVehicles: {
        value: totalVehicles,
        change: '+5%', // Could calculate this based on weekly growth
        changeType: 'increase'
      },
      activeBookings: {
        value: activeBookings,
        change: bookingChange > 0 ? `+${bookingChange}%` : `${bookingChange}%`,
        changeType: bookingChange >= 0 ? 'increase' : 'decrease'
      },
      totalUsers: {
        value: totalUsers,
        change: '+8%', // Could calculate this based on user growth
        changeType: 'increase'
      },
      todayRevenue: {
        value: todayAmount,
        change: revenueChange > 0 ? `+${revenueChange}%` : `${revenueChange}%`,
        changeType: revenueChange >= 0 ? 'increase' : 'decrease'
      }
    },
    recentActivity: recentBookings.map(booking => ({
      id: booking.id,
      vehicle: booking.vehicle.registrationNumber,
      owner: booking.user.name,
      action: booking.status === 'ACTIVE' 
        ? (booking.actualEntryTime ? 'Checked In' : 'Booking Active')
        : booking.status === 'COMPLETED' 
        ? 'Checked Out' 
        : 'Payment Pending',
      slot: booking.parkingSpot.name,
      time: getTimeAgo(booking.updatedAt),
      status: booking.status === 'ACTIVE' ? 'active' 
        : booking.status === 'COMPLETED' ? 'completed' 
        : 'pending'
    }))
  };
};

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
}

// Helper function to calculate duration
function calculateDuration(startTime: Date, endTime?: Date | null): string {
  const end = endTime || new Date();
  const diffInMinutes = Math.floor((end.getTime() - startTime.getTime()) / (1000 * 60));
  
  const hours = Math.floor(diffInMinutes / 60);
  const minutes = diffInMinutes % 60;
  
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export const getVehiclesData = async (filters?: {
  status?: string;
  vehicleNumber?: string;
  limit?: number;
}) => {
  const where: any = {};

  if (filters?.vehicleNumber) {
    where.vehicle = {
      registrationNumber: { contains: filters.vehicleNumber, mode: 'insensitive' }
    };
  }

  if (filters?.status) {
    if (filters.status === 'active') {
      where.status = 'ACTIVE';
    } else if (filters.status === 'completed') {
      where.status = 'COMPLETED';
    }
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      vehicle: true,
      user: true,
      parkingSpot: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: filters?.limit || 50
  });

  return bookings.map(booking => {
    const entryTime = booking.actualEntryTime || booking.bookedStartTime;
    const exitTime = booking.actualExitTime;
    const duration = calculateDuration(entryTime, exitTime);
    
    // Determine status
    let status = 'active';
    if (booking.status === 'COMPLETED') {
      status = 'completed';
    } else if (booking.status === 'ACTIVE' && booking.isOverstay) {
      status = 'overstay';
    }
    
    // Determine payment status
    let paymentStatus = 'pending';
    if (booking.paymentStatus === 'COMPLETED') {
      paymentStatus = 'paid';
    } else if (booking.paymentStatus === 'FAILED') {
      paymentStatus = 'failed';
    }

    return {
      id: booking.id,
      vehicleNumber: booking.vehicle.registrationNumber,
      ownerName: booking.user.name,
      entryTime: entryTime.toISOString(),
      exitTime: exitTime?.toISOString() || null,
      slotNumber: booking.parkingSpot.name,
      duration,
      fare: booking.totalAmount,
      status,
      vehicleType: 'car', // Default to car, could be extended to include vehicle type in schema
      paymentStatus,
      createdAt: booking.createdAt.toISOString(),
      bookingId: booking.id
    };
  });
};

export const getParkingSlotsData = async () => {
  // Get the parking spot to check total slots
  const parkingSpot = await prisma.parkingSpot.findFirst();
  
  if (!parkingSpot) {
    throw new Error('No parking spot found');
  }

  const totalSlots = parkingSpot.totalSpots;
  
  // Get all active bookings
  const activeBookings = await prisma.booking.findMany({
    where: {
      status: 'ACTIVE',
      parkingSpotId: parkingSpot.id
    },
    include: {
      vehicle: true,
      user: true
    }
  });

  // Create slots array (1 to totalSlots)
  const slots = [];
  for (let i = 1; i <= totalSlots; i++) {
    const slotNumber = `A${i.toString().padStart(2, '0')}`;
    
    // Check if this slot is occupied by finding a booking
    const booking = activeBookings.find(b => b.id); // For now, just check if any active booking exists
    
    const slot = {
      id: i.toString(),
      slotNumber,
      zone: `Zone ${Math.ceil(i / 10)}`, // Group by 10s into zones
      type: i <= 5 ? 'PREMIUM' : i <= 10 ? 'DISABLED' : 'STANDARD', // First 5 premium, next 5 disabled, rest standard
      status: i === 1 && activeBookings.length > 0 ? 'OCCUPIED' : 'AVAILABLE', // For demo, show slot 1 as occupied if we have active bookings
      vehicle: i === 1 && activeBookings.length > 0 ? {
        id: activeBookings[0].vehicle.id,
        licensePlate: activeBookings[0].vehicle.registrationNumber,
        model: activeBookings[0].vehicle.make + ' ' + activeBookings[0].vehicle.model,
        color: activeBookings[0].vehicle.color || 'Unknown',
        owner: activeBookings[0].user.name
      } : null,
      booking: i === 1 && activeBookings.length > 0 ? {
        id: activeBookings[0].id,
        startTime: activeBookings[0].actualEntryTime?.toISOString() || activeBookings[0].bookedStartTime.toISOString(),
        endTime: activeBookings[0].bookedEndTime.toISOString(),
        duration: activeBookings[0].bookedDuration,
        cost: activeBookings[0].totalAmount,
        status: 'ACTIVE'
      } : null,
      pricePerHour: parkingSpot.pricePerHour,
      features: i <= 5 ? ['Premium', 'Covered'] : i <= 10 ? ['Disabled Access', 'Wide Space'] : ['Standard'],
      lastUpdated: new Date().toISOString()
    };
    
    slots.push(slot);
  }

  const stats = {
    total: totalSlots,
    available: slots.filter(s => s.status === 'AVAILABLE').length,
    occupied: slots.filter(s => s.status === 'OCCUPIED').length,
    maintenance: slots.filter(s => s.status === 'MAINTENANCE').length,
    reserved: slots.filter(s => s.status === 'RESERVED').length
  };

  return {
    slots,
    stats,
    parkingSpot: {
      id: parkingSpot.id,
      name: parkingSpot.name,
      address: parkingSpot.address,
      totalSpots: parkingSpot.totalSpots,
      availableSpots: parkingSpot.availableSpots,
      pricePerHour: parkingSpot.pricePerHour
    }
  };
};