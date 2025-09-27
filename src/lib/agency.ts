'use server';

import { prisma } from '@/lib/prisma';

// Types for agency dashboard
export interface AgencyStats {
  totalCars: number;
  activeBookings: number;
  totalRevenue: number;
  averageRating: number;
  completedBookings: number;
  pendingBookings: number;
}

export interface AgencyBooking {
  id: string;
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  carMake: string;
  carModel: string;
  carYear: number;
  pickupDatetime: Date;
  dropoffDatetime: Date;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  specialRequests?: string;
  createdAt: Date;
}

export interface AgencyCar {
  id: string;
  make: string;
  model: string;
  year: number;
  category: string;
  pricePerDay: number;
  status: string;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  images: string[];
  location: string;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Get agency dashboard stats
export async function getAgencyStats(agencyId: string): Promise<AgencyStats> {
  try {
    // Get total cars
    const totalCars = await prisma.car.count({
      where: { agencyId }
    });

    // Get bookings counts
    const activeBookings = await prisma.booking.count({
      where: { 
        car: { agencyId },
        status: { in: ['confirmed', 'in_progress'] }
      }
    });

    const completedBookings = await prisma.booking.count({
      where: { 
        car: { agencyId },
        status: 'completed'
      }
    });

    const pendingBookings = await prisma.booking.count({
      where: { 
        car: { agencyId },
        status: 'pending'
      }
    });

    // Get total revenue from completed bookings
    const revenueResult = await prisma.booking.aggregate({
      where: { 
        car: { agencyId },
        status: { in: ['confirmed', 'completed'] }
      },
      _sum: { totalPrice: true }
    });
    const totalRevenue = revenueResult._sum.totalPrice || 0;

    // Get average rating from reviews
    const ratingResult = await prisma.review.aggregate({
      where: { 
        car: { agencyId }
      },
      _avg: { rating: true }
    });
    const averageRating = ratingResult._avg.rating || 0;

    return {
      totalCars,
      activeBookings,
      totalRevenue,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      completedBookings,
      pendingBookings
    };
  } catch (error) {
    console.error('Get agency stats error:', error);
    return {
      totalCars: 0,
      activeBookings: 0,
      totalRevenue: 0,
      averageRating: 0,
      completedBookings: 0,
      pendingBookings: 0
    };
  }
}

// Get agency bookings with details
export async function getAgencyBookings(agencyId: string, limit?: number): Promise<AgencyBooking[]> {
  try {
    const bookings = await prisma.booking.findMany({
      where: { 
        car: { agencyId }
      },
      include: {
        customer: {
          select: {
            fullName: true,
            email: true,
            phone: true
          }
        },
        car: {
          select: {
            make: true,
            model: true,
            year: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return bookings.map(booking => ({
      id: booking.id,
      bookingReference: booking.bookingReference,
      customerName: booking.customer?.fullName || booking.customerName || 'Unknown Customer',
      customerEmail: booking.customer?.email || booking.customerEmail || '',
      customerPhone: booking.customer?.phone || booking.customerPhone || '',
      carMake: booking.car?.make || '',
      carModel: booking.car?.model || '',
      carYear: booking.car?.year || 0,
      pickupDatetime: booking.pickupDatetime,
      dropoffDatetime: booking.dropoffDatetime,
      totalPrice: booking.totalPrice,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      specialRequests: booking.specialRequests || undefined,
      createdAt: booking.createdAt
    }));
  } catch (error) {
    console.error('Get agency bookings error:', error);
    return [];
  }
}

// Get agency cars with stats
export async function getAgencyCars(agencyId: string): Promise<AgencyCar[]> {
  try {
    const cars = await prisma.car.findMany({
      where: { agencyId },
      include: {
        _count: {
          select: { bookings: true }
        },
        bookings: {
          where: { status: { in: ['confirmed', 'completed'] } },
          select: { totalPrice: true }
        },
        reviews: {
          select: { rating: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return cars.map(car => {
      const totalRevenue = car.bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
      const averageRating = car.reviews.length > 0 
        ? car.reviews.reduce((sum, review) => sum + review.rating, 0) / car.reviews.length
        : 0;

      return {
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        category: car.category,
        pricePerDay: car.pricePerDay,
        status: car.status,
        totalBookings: car._count.bookings,
        totalRevenue,
        averageRating: Math.round(averageRating * 10) / 10,
        images: car.images || [],
        location: car.location || '',
        features: car.features || [],
        isActive: car.isActive,
        createdAt: car.createdAt,
        updatedAt: car.updatedAt
      };
    });
  } catch (error) {
    console.error('Get agency cars error:', error);
    return [];
  }
}

// Get agency by user ID (for dashboard access)
export async function getAgencyByUserId(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { agency: true }
    });

    return user?.agency || null;
  } catch (error) {
    console.error('Get agency by user ID error:', error);
    return null;
  }
}

// Update booking status (agency action)
export async function updateBookingStatus(
  bookingId: string, 
  agencyId: string, 
  status: 'confirmed' | 'cancelled' | 'completed' | 'in_progress'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify booking belongs to this agency
    const booking = await prisma.booking.findFirst({
      where: { 
        id: bookingId,
        car: { agencyId }
      }
    });

    if (!booking) {
      return { success: false, error: 'Booking not found or access denied' };
    }

    // Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
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
