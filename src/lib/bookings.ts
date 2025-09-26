import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface BookingData {
  userId: string;
  carId: string;
  pickupDate: Date;
  returnDate: Date;
  pickupLocation: string;
  contactDetails: {
    name: string;
    email: string;
    phone: string;
    drivingLicense: string;
    additionalRequests?: string;
  };
  selectedExtras: string[];
  paymentMethod: 'card' | 'cash';
  totalAmount: number;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export interface Booking {
  id: string;
  userId: string;
  carId: string;
  pickupDate: Date;
  returnDate: Date;
  pickupLocation: string;
  status: string;
  totalAmount: number;
  contactDetails: Record<string, string>;
  selectedExtras: string[];
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
  car: {
    id: string;
    make: string;
    model: string;
    year: number;
    category: string;
    images: string[];
    agency: {
      name: string;
    };
  };
}

// Create a new booking
export async function createBooking(bookingData: BookingData): Promise<{ success: boolean; bookingId?: string; error?: string }> {
  try {
    // TODO: Fix booking schema - missing required fields: bookingReference, customerName, customerEmail, customerPhone
    console.log('Booking creation temporarily disabled due to schema mismatch', bookingData);
    return { success: false, error: 'Booking creation temporarily disabled - schema needs to be fixed' };

    /* COMMENTED OUT UNTIL SCHEMA IS FIXED
    const booking = await prisma.booking.create({
      data: {
        customerId: bookingData.userId, // Field is customerId in schema
        carId: bookingData.carId,
        pickupDatetime: bookingData.pickupDate,
        dropoffDatetime: bookingData.returnDate,
        // pickupLocation: bookingData.pickupLocation, // TODO: Fix relation structure
        status: bookingData.status || 'pending',
        totalPrice: bookingData.totalAmount,
        // contactDetails: JSON.stringify(bookingData.contactDetails), // TODO: Add to schema
        // selectedExtras: JSON.stringify(bookingData.selectedExtras), // TODO: Add to schema
        paymentMethod: bookingData.paymentMethod,
        paymentStatus: bookingData.paymentMethod === 'cash' ? 'pending' : 'completed'
      }
    });

    return { success: true, bookingId: booking.id };
    */
  } catch (error) {
    console.error('Create booking error:', error);
    return { success: false, error: 'Failed to create booking' };
  }
}

// Get user bookings
export async function getUserBookings(userId: string): Promise<Booking[]> {
  try {
    // TODO: Fix booking interface and schema mismatches
    console.log('getUserBookings temporarily disabled due to schema mismatch', userId);
    return [];

    /* COMMENTED OUT UNTIL SCHEMA IS FIXED
    const bookings = await prisma.booking.findMany({
      where: { customerId: userId },
      include: {
        car: {
          include: {
            agency: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return bookings.map(booking => ({
      id: booking.id,
      userId: booking.userId,
      carId: booking.carId,
      pickupDate: booking.pickupDate,
      returnDate: booking.returnDate,
      pickupLocation: booking.pickupLocation,
      status: booking.status,
      totalAmount: booking.totalAmount,
      contactDetails: JSON.parse(booking.contactDetails || '{}'),
      selectedExtras: JSON.parse(booking.selectedExtras || '[]'),
      paymentMethod: booking.paymentMethod,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      car: {
        id: booking.car.id,
        make: booking.car.make,
        model: booking.car.model,
        year: booking.car.year,
        category: booking.car.category,
        images: Array.isArray(booking.car.images) 
          ? booking.car.images 
          : booking.car.images ? [booking.car.images] : [],
        agency: {
          name: booking.car.agency?.name || 'Unknown Agency'
        }
      }
    }));
    */
  } catch (error) {
    console.error('Get user bookings error:', error);
    return [];
  }
}

// Get booking by ID
export async function getBookingById(bookingId: string, userId: string): Promise<Booking | null> {
  try {
    // TODO: Fix booking interface and schema mismatches
    console.log('getBookingById temporarily disabled due to schema mismatch', bookingId, userId);
    return null;

    /* COMMENTED OUT UNTIL SCHEMA IS FIXED
    const booking = await prisma.booking.findFirst({
      where: { 
        id: bookingId, 
        customerId: userId // Ensure user owns this booking
      },
      include: {
        car: {
          include: {
            agency: {
              select: { name: true }
            }
          }
        }
      }
    });

    if (!booking) return null;

    return {
      id: booking.id,
      userId: booking.userId,
      carId: booking.carId,
      pickupDate: booking.pickupDate,
      returnDate: booking.returnDate,
      pickupLocation: booking.pickupLocation,
      status: booking.status,
      totalAmount: booking.totalAmount,
      contactDetails: JSON.parse(booking.contactDetails || '{}'),
      selectedExtras: JSON.parse(booking.selectedExtras || '[]'),
      paymentMethod: booking.paymentMethod,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      car: {
        id: booking.car.id,
        make: booking.car.make,
        model: booking.car.model,
        year: booking.car.year,
        category: booking.car.category,
        images: Array.isArray(booking.car.images) 
          ? booking.car.images 
          : booking.car.images ? [booking.car.images] : [],
        agency: {
          name: booking.car.agency?.name || 'Unknown Agency'
        }
      }
    };
    */
  } catch (error) {
    console.error('Get booking by ID error:', error);
    return null;
  }
}

// Update booking status
export async function updateBookingStatus(
  bookingId: string, 
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed',
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const whereClause = userId 
      ? { id: bookingId, userId } // Users can only update their own bookings
      : { id: bookingId }; // Agencies/admins can update any booking

    const booking = await prisma.booking.update({
      where: whereClause,
      data: { 
        status,
        updatedAt: new Date()
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Update booking status error:', error);
    return { success: false, error: 'Failed to update booking status' };
  }
}

// Cancel booking
export async function cancelBooking(bookingId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  return updateBookingStatus(bookingId, 'cancelled', userId);
}

// Get agency bookings
export async function getAgencyBookings(agencyId: string): Promise<Booking[]> {
  try {
    // TODO: Fix booking interface and schema mismatches
    console.log('getAgencyBookings temporarily disabled due to schema mismatch', agencyId);
    return [];

    /* COMMENTED OUT UNTIL SCHEMA IS FIXED
    const bookings = await prisma.booking.findMany({
      where: {
        car: {
          agencyId: agencyId
        }
      },
      include: {
        car: {
          include: {
            agency: {
              select: { name: true }
            }
          }
        },
        customer: {
          select: { 
            fullName: true, 
            email: true, 
            phone: true 
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return bookings.map(booking => ({
      id: booking.id,
      userId: booking.userId,
      carId: booking.carId,
      pickupDate: booking.pickupDate,
      returnDate: booking.returnDate,
      pickupLocation: booking.pickupLocation,
      status: booking.status,
      totalAmount: booking.totalAmount,
      contactDetails: JSON.parse(booking.contactDetails || '{}'),
      selectedExtras: JSON.parse(booking.selectedExtras || '[]'),
      paymentMethod: booking.paymentMethod,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      car: {
        id: booking.car.id,
        make: booking.car.make,
        model: booking.car.model,
        year: booking.car.year,
        category: booking.car.category,
        images: Array.isArray(booking.car.images) 
          ? booking.car.images 
          : booking.car.images ? [booking.car.images] : [],
        agency: {
          name: booking.car.agency?.name || 'Unknown Agency'
        }
      }
    }));
    */
  } catch (error) {
    console.error('Get agency bookings error:', error);
    return [];
  }
}

// Get booking statistics for agency dashboard
export async function getAgencyBookingStats(agencyId: string) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [totalBookings, activeBookings, monthlyRevenue, yearlyRevenue] = await Promise.all([
      prisma.booking.count({
        where: {
          car: { agencyId }
        }
      }),
      prisma.booking.count({
        where: {
          car: { agencyId },
          status: { in: ['confirmed', 'pending'] },
          pickupDatetime: { gte: now }
        }
      }),
      prisma.booking.aggregate({
        where: {
          car: { agencyId },
          createdAt: { gte: startOfMonth },
          status: { in: ['confirmed', 'completed'] }
        },
        _sum: { totalPrice: true }
      }),
      prisma.booking.aggregate({
        where: {
          car: { agencyId },
          createdAt: { gte: startOfYear },
          status: { in: ['confirmed', 'completed'] }
        },
        _sum: { totalPrice: true }
      })
    ]);

    return {
      totalBookings,
      activeBookings,
      monthlyRevenue: monthlyRevenue._sum.totalPrice || 0,
      yearlyRevenue: yearlyRevenue._sum.totalPrice || 0
    };
  } catch (error) {
    console.error('Get agency booking stats error:', error);
    return {
      totalBookings: 0,
      activeBookings: 0,
      monthlyRevenue: 0,
      yearlyRevenue: 0
    };
  }
}

const bookingService = {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getAgencyBookings,
  getAgencyBookingStats
};

export default bookingService;
