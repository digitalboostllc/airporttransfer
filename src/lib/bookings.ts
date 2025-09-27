import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Generate unique booking reference
function generateBookingReference(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `VB-${timestamp}-${random}`.toUpperCase();
}

export interface BookingData {
  userId: string;
  carId: string;
  pickupDate: Date;
  returnDate: Date;
  pickupLocation: string;
  dropoffLocation?: string;
  contactDetails: {
    name: string;
    email: string;
    phone: string;
    drivingLicense: string;
    additionalRequests?: string;
  };
  selectedExtras: string[];
  paymentMethod: 'card' | 'cash';
  basePrice: number;
  extrasPrice?: number;
  insurancePrice?: number;
  taxAmount?: number;
  totalAmount: number;
  securityDeposit?: number;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export interface Booking {
  id: string;
  bookingReference: string;
  customerId: string;
  carId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupDatetime: Date;
  dropoffDatetime: Date;
  status: string;
  basePrice: number;
  extrasPrice: number;
  insurancePrice: number;
  taxAmount: number;
  totalPrice: number;
  securityDeposit: number;
  paymentMethod: string;
  paymentStatus: string;
  specialRequests?: string;
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
    // Generate unique booking reference
    const bookingReference = generateBookingReference();
    
    // Calculate pricing breakdown
    const basePrice = bookingData.basePrice;
    const extrasPrice = bookingData.extrasPrice || 0;
    const insurancePrice = bookingData.insurancePrice || 0;
    const taxAmount = bookingData.taxAmount || (basePrice + extrasPrice + insurancePrice) * 0.2; // 20% tax
    const securityDeposit = bookingData.securityDeposit || basePrice * 0.3; // 30% security deposit
    
    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        bookingReference,
        customerId: bookingData.userId,
        carId: bookingData.carId,
        customerName: bookingData.contactDetails.name,
        customerEmail: bookingData.contactDetails.email,
        customerPhone: bookingData.contactDetails.phone,
        pickupDatetime: bookingData.pickupDate,
        dropoffDatetime: bookingData.returnDate,
        basePrice,
        extrasPrice,
        insurancePrice,
        taxAmount,
        totalPrice: bookingData.totalAmount,
        securityDeposit,
        status: bookingData.status || 'pending',
        paymentMethod: bookingData.paymentMethod,
        paymentStatus: bookingData.paymentMethod === 'cash' ? 'pending' : 'completed',
        specialRequests: bookingData.contactDetails.additionalRequests,
        drivingLicenseInfo: JSON.stringify({
          licenseNumber: bookingData.contactDetails.drivingLicense
        })
      }
    });

    return {
      success: true,
      bookingId: booking.id
    };
  } catch (error) {
    console.error('Create booking error:', error);
    return { success: false, error: 'Failed to create booking' };
  }
}

// Get user bookings
export async function getUserBookings(userId: string): Promise<Booking[]> {
  try {
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
      bookingReference: booking.bookingReference,
      customerId: booking.customerId || '',
      carId: booking.carId || '',
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      pickupDatetime: booking.pickupDatetime,
      dropoffDatetime: booking.dropoffDatetime,
      status: booking.status,
      basePrice: booking.basePrice,
      extrasPrice: booking.extrasPrice,
      insurancePrice: booking.insurancePrice,
      taxAmount: booking.taxAmount,
      totalPrice: booking.totalPrice,
      securityDeposit: booking.securityDeposit,
      paymentMethod: booking.paymentMethod || '',
      paymentStatus: booking.paymentStatus,
      specialRequests: booking.specialRequests || undefined,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      car: {
        id: booking.car?.id || '',
        make: booking.car?.make || '',
        model: booking.car?.model || '',
        year: booking.car?.year || 0,
        category: booking.car?.category || '',
        images: Array.isArray(booking.car?.images) 
          ? booking.car.images 
          : booking.car?.images ? [booking.car.images] : [],
        agency: {
          name: booking.car?.agency?.name || 'Unknown Agency'
        }
      }
    }));
  } catch (error) {
    console.error('Get user bookings error:', error);
    return [];
  }
}

// Get booking by ID
export async function getBookingById(bookingId: string, userId: string): Promise<Booking | null> {
  try {
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
      bookingReference: booking.bookingReference,
      customerId: booking.customerId || '',
      carId: booking.carId || '',
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      pickupDatetime: booking.pickupDatetime,
      dropoffDatetime: booking.dropoffDatetime,
      status: booking.status,
      basePrice: booking.basePrice,
      extrasPrice: booking.extrasPrice,
      insurancePrice: booking.insurancePrice,
      taxAmount: booking.taxAmount,
      totalPrice: booking.totalPrice,
      securityDeposit: booking.securityDeposit,
      paymentMethod: booking.paymentMethod || '',
      paymentStatus: booking.paymentStatus,
      specialRequests: booking.specialRequests || undefined,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      car: {
        id: booking.car?.id || '',
        make: booking.car?.make || '',
        model: booking.car?.model || '',
        year: booking.car?.year || 0,
        category: booking.car?.category || '',
        images: Array.isArray(booking.car?.images) 
          ? booking.car.images 
          : booking.car?.images ? [booking.car.images] : [],
        agency: {
          name: booking.car?.agency?.name || 'Unknown Agency'
        }
      }
    };
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
      bookingReference: booking.bookingReference,
      customerId: booking.customerId || '',
      carId: booking.carId || '',
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      pickupDatetime: booking.pickupDatetime,
      dropoffDatetime: booking.dropoffDatetime,
      status: booking.status,
      basePrice: booking.basePrice,
      extrasPrice: booking.extrasPrice,
      insurancePrice: booking.insurancePrice,
      taxAmount: booking.taxAmount,
      totalPrice: booking.totalPrice,
      securityDeposit: booking.securityDeposit,
      paymentMethod: booking.paymentMethod || '',
      paymentStatus: booking.paymentStatus,
      specialRequests: booking.specialRequests || undefined,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      car: {
        id: booking.car?.id || '',
        make: booking.car?.make || '',
        model: booking.car?.model || '',
        year: booking.car?.year || 0,
        category: booking.car?.category || '',
        images: Array.isArray(booking.car?.images) 
          ? booking.car.images 
          : booking.car?.images ? [booking.car.images] : [],
        agency: {
          name: booking.car?.agency?.name || 'Unknown Agency'
        }
      }
    }));
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
