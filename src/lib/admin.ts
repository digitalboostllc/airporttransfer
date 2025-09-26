import { PrismaClient } from '@prisma/client';
import { User } from './auth';
import { sendAgencyApprovalEmail, sendAgencyRejectionEmail } from './agency-registration';

const prisma = new PrismaClient();

export interface PlatformStats {
  totalUsers: number;
  totalAgencies: number;
  totalCars: number;
  totalBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeUsers: number;
  pendingAgencies: number;
}

export interface AdminUser extends User {
  isActive: boolean;
  lastLogin?: Date;
  bookingsCount: number;
}

export interface AdminAgency {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  carsCount: number;
  bookingsCount: number;
  totalRevenue: number;
  createdAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
}

export interface AdminBooking {
  id: string;
  customerName: string;
  customerEmail: string;
  agencyName: string;
  carName: string;
  status: string;
  totalPrice: number;
  pickupDate: Date;
  returnDate: Date;
  createdAt: Date;
  paymentMethod: string;
  contactDetails: Record<string, string>;
}

// Get platform statistics
export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalAgencies,
      totalCars,
      totalBookings,
      totalRevenue,
      monthlyRevenue,
      activeUsers,
      pendingAgencies
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'agency_owner' } }),
      prisma.car.count(),
      prisma.booking.count(),
      prisma.booking.aggregate({
        where: { status: { in: ['confirmed', 'completed'] } },
        _sum: { totalPrice: true }
      }),
      prisma.booking.aggregate({
        where: { 
          status: { in: ['confirmed', 'completed'] },
          createdAt: { gte: startOfMonth }
        },
        _sum: { totalPrice: true }
      }),
      prisma.user.count({
        where: { 
          lastLoginAt: { gte: thirtyDaysAgo }
        }
      }),
      prisma.agency.count({
        where: { status: 'pending' }
      })
    ]);

    return {
      totalUsers,
      totalAgencies,
      totalCars,
      totalBookings,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      monthlyRevenue: monthlyRevenue._sum.totalPrice || 0,
      activeUsers,
      pendingAgencies
    };
  } catch (error) {
    console.error('Get platform stats error:', error);
    return {
      totalUsers: 0,
      totalAgencies: 0,
      totalCars: 0,
      totalBookings: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      activeUsers: 0,
      pendingAgencies: 0
    };
  }
}

// Get all users for admin management
export async function getAllUsers(): Promise<AdminUser[]> {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { bookings: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.fullName,
      phone: user.phone || undefined,
      role: user.role as 'customer' | 'agency_owner' | 'agency_staff' | 'admin',
      agencyId: user.agencyId || undefined,
      createdAt: user.createdAt,
      isActive: user.isActive,
      lastLogin: user.lastLoginAt || undefined,
      bookingsCount: user._count.bookings
    }));
  } catch (error) {
    console.error('Get all users error:', error);
    return [];
  }
}

// Get all agencies for admin management
export async function getAllAgencies(): Promise<AdminAgency[]> {
  try {
    const agencies = await prisma.agency.findMany({
      include: {
        user: true,
        _count: {
          select: { 
            cars: true,
            bookings: true
          }
        },
        bookings: {
          where: { status: { in: ['confirmed', 'completed'] } },
          select: { totalPrice: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return agencies.map(agency => ({
      id: agency.id,
      name: agency.name,
      email: agency.user?.email || '',
      phone: agency.user?.phone || '',
      status: agency.status as 'pending' | 'approved' | 'rejected' | 'suspended',
      carsCount: agency._count.cars,
      bookingsCount: agency._count.bookings,
      totalRevenue: agency.bookings.reduce((sum, booking) => sum + booking.totalPrice, 0),
      createdAt: agency.createdAt,
      approvedAt: agency.approvedAt || undefined,
      rejectedAt: agency.rejectedAt || undefined
    }));
  } catch (error) {
    console.error('Get all agencies error:', error);
    return [];
  }
}

// Get all bookings for admin oversight
export async function getAllBookings(): Promise<AdminBooking[]> {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        customer: true,
        car: {
          include: {
            agency: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to recent 100 bookings for performance
    });

    return bookings.map(booking => ({
      id: booking.id,
      customerName: booking.customer?.fullName || 'Unknown Customer',
      customerEmail: booking.customer?.email || 'Unknown Email',
      agencyName: booking.car?.agency?.name || 'Unknown Agency',
      carName: booking.car ? `${booking.car.make} ${booking.car.model} ${booking.car.year}` : 'Unknown Car',
      status: booking.status,
      totalPrice: booking.totalPrice,
      pickupDate: booking.pickupDatetime,
      returnDate: booking.dropoffDatetime,
      createdAt: booking.createdAt,
      paymentMethod: booking.paymentMethod || 'Unknown',
      contactDetails: {} // TODO: Add contactDetails field to booking model if needed
    }));
  } catch (error) {
    console.error('Get all bookings error:', error);
    return [];
  }
}

// Update user status (activate/deactivate)
export async function updateUserStatus(userId: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive }
    });

    return { success: true };
  } catch (error) {
    console.error('Update user status error:', error);
    return { success: false, error: 'Failed to update user status' };
  }
}

// Approve agency
export async function approveAgency(agencyId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get agency details before updating
    const agency = await prisma.agency.findUnique({
      where: { id: agencyId },
      include: { user: true }
    });

    if (!agency) {
      return { success: false, error: 'Agency not found' };
    }

    // Update agency status
    await prisma.agency.update({
      where: { id: agencyId },
      data: { 
        status: 'approved',
        approvedAt: new Date(),
        rejectedAt: null
      }
    });

    // Send approval email
    if (agency.user) {
      sendAgencyApprovalEmail({
        agencyName: agency.name,
        contactEmail: agency.user.email,
        contactName: agency.user.fullName
      }).catch(error => console.error('Approval email failed:', error));
    }

    return { success: true };
  } catch (error) {
    console.error('Approve agency error:', error);
    return { success: false, error: 'Failed to approve agency' };
  }
}

// Reject agency
export async function rejectAgency(agencyId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get agency details before updating
    const agency = await prisma.agency.findUnique({
      where: { id: agencyId },
      include: { user: true }
    });

    if (!agency) {
      return { success: false, error: 'Agency not found' };
    }

    // Update agency status
    await prisma.agency.update({
      where: { id: agencyId },
      data: { 
        status: 'rejected',
        rejectedAt: new Date(),
        approvedAt: null,
        rejectionReason: reason
      }
    });

    // Send rejection email
    if (agency.user) {
      sendAgencyRejectionEmail({
        agencyName: agency.name,
        contactEmail: agency.user.email,
        contactName: agency.user.fullName,
        reason: reason
      }).catch(error => console.error('Rejection email failed:', error));
    }

    return { success: true };
  } catch (error) {
    console.error('Reject agency error:', error);
    return { success: false, error: 'Failed to reject agency' };
  }
}

// Suspend agency
export async function suspendAgency(agencyId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.agency.update({
      where: { id: agencyId },
      data: { 
        status: 'suspended',
        suspensionReason: reason
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Suspend agency error:', error);
    return { success: false, error: 'Failed to suspend agency' };
  }
}

// Update booking status (admin override)
export async function adminUpdateBookingStatus(
  bookingId: string, 
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        status,
        updatedAt: new Date()
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Admin update booking status error:', error);
    return { success: false, error: 'Failed to update booking status' };
  }
}

const adminService = {
  getPlatformStats,
  getAllUsers,
  getAllAgencies,
  getAllBookings,
  updateUserStatus,
  approveAgency,
  rejectAgency,
  suspendAgency,
  adminUpdateBookingStatus
};

export default adminService;
