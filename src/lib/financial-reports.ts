import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subMonths, subYears, format } from 'date-fns';

export interface RevenueData {
  date: string;
  revenue: number;
  bookings: number;
  commission: number;
}

export interface AgencyMetrics {
  agencyId: string;
  agencyName: string;
  totalRevenue: number;
  totalBookings: number;
  averageBookingValue: number;
  commission: number;
  rating: number;
  totalCars: number;
  activeCars: number;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalCommission: number;
  totalBookings: number;
  averageBookingValue: number;
  activeAgencies: number;
  totalCars: number;
  completionRate: number;
  cancellationRate: number;
}

export interface TimeSeriesData {
  period: string;
  revenue: number;
  bookings: number;
  commission: number;
  newCustomers: number;
  newAgencies: number;
}

export class FinancialReportService {
  // Platform commission rate (5% default)
  private static COMMISSION_RATE = 0.05;

  // Get financial summary for a date range
  static async getFinancialSummary(
    startDate: Date,
    endDate: Date
  ): Promise<FinancialSummary> {
    const [
      revenueData,
      bookingStats,
      agencyCount,
      carCount
    ] = await Promise.all([
      // Total revenue and commission
      prisma.booking.aggregate({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          },
          status: { not: 'cancelled' }
        },
        _sum: {
          totalPrice: true
        },
        _count: {
          id: true
        }
      }),
      
      // Booking statistics
      prisma.booking.groupBy({
        by: ['status'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          id: true
        }
      }),
      
      // Active agencies
      prisma.agency.count({
        where: {
          status: 'approved'
        }
      }),
      
      // Total cars
      prisma.car.count({
        where: {
          status: 'available'
        }
      })
    ]);

    const totalRevenue = revenueData._sum.totalPrice || 0;
    const totalBookings = revenueData._count || 0;
    const totalCommission = totalRevenue * this.COMMISSION_RATE;
    
    const completedBookings = bookingStats.find(s => s.status === 'completed')?._count.id || 0;
    const cancelledBookings = bookingStats.find(s => s.status === 'cancelled')?._count.id || 0;
    const totalAllBookings = bookingStats.reduce((sum, stat) => sum + stat._count.id, 0);

    return {
      totalRevenue,
      totalCommission,
      totalBookings,
      averageBookingValue: totalBookings > 0 ? totalRevenue / totalBookings : 0,
      activeAgencies: agencyCount,
      totalCars: carCount,
      completionRate: totalAllBookings > 0 ? (completedBookings / totalAllBookings) * 100 : 0,
      cancellationRate: totalAllBookings > 0 ? (cancelledBookings / totalAllBookings) * 100 : 0
    };
  }

  // Get time series data for revenue trends
  static async getTimeSeriesData(
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<TimeSeriesData[]> {
    // This is a simplified implementation - in production you'd want to use database-specific date functions
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        customer: {
          select: {
            id: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const agencies = await prisma.agency.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        id: true,
        createdAt: true
      }
    });

    // Group data by time period
    const groupedData = new Map<string, {
      revenue: number;
      bookings: number;
      commission: number;
      newCustomers: Set<string>;
      newAgencies: number;
    }>();

    // Initialize all periods
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const key = this.getDateKey(currentDate, groupBy);
      if (!groupedData.has(key)) {
        groupedData.set(key, {
          revenue: 0,
          bookings: 0,
          commission: 0,
          newCustomers: new Set(),
          newAgencies: 0
        });
      }
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000); // Add 1 day
    }

    // Process bookings
    bookings.forEach(booking => {
      const key = this.getDateKey(booking.createdAt, groupBy);
      const data = groupedData.get(key);
      if (data) {
        data.revenue += booking.totalPrice;
        data.bookings += 1;
        data.commission += booking.totalPrice * this.COMMISSION_RATE;
        if (booking.customer?.id) {
          data.newCustomers.add(booking.customer.id);
        }
      }
    });

    // Process new agencies
    agencies.forEach(agency => {
      const key = this.getDateKey(agency.createdAt, groupBy);
      const data = groupedData.get(key);
      if (data) {
        data.newAgencies += 1;
      }
    });

    // Convert to array and sort
    return Array.from(groupedData.entries())
      .map(([period, data]) => ({
        period,
        revenue: data.revenue,
        bookings: data.bookings,
        commission: data.commission,
        newCustomers: data.newCustomers.size,
        newAgencies: data.newAgencies
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  // Get agency performance metrics
  static async getAgencyMetrics(
    startDate: Date,
    endDate: Date,
    limit: number = 10
  ): Promise<AgencyMetrics[]> {
    const agencies = await prisma.agency.findMany({
      where: {
        status: 'approved'
      },
      include: {
        bookings: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate
            },
            status: { not: 'cancelled' }
          }
        },
        cars: {
          include: {
            reviews: {
              select: {
                rating: true
              }
            }
          }
        }
      }
    });

    const agencyMetrics: AgencyMetrics[] = agencies.map(agency => {
      const totalRevenue = agency.bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
      const totalBookings = agency.bookings.length;
      const commission = totalRevenue * this.COMMISSION_RATE;
      
      // Calculate average rating
      const allReviews = agency.cars.flatMap(car => car.reviews);
      const averageRating = allReviews.length > 0 
        ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length 
        : 0;

      const activeCars = agency.cars.filter(car => car.status === 'available').length;

      return {
        agencyId: agency.id,
        agencyName: agency.name,
        totalRevenue,
        totalBookings,
        averageBookingValue: totalBookings > 0 ? totalRevenue / totalBookings : 0,
        commission,
        rating: Math.round(averageRating * 10) / 10,
        totalCars: agency.cars.length,
        activeCars
      };
    });

    // Sort by revenue and limit results
    return agencyMetrics
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  }

  // Get revenue by location/city
  static async getRevenueByLocation(
    startDate: Date,
    endDate: Date
  ): Promise<{ location: string; revenue: number; bookings: number }[]> {
    const locations = await prisma.booking.groupBy({
      by: ['agencyId'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: { not: 'cancelled' }
      },
      _sum: {
        totalPrice: true
      },
      _count: {
        id: true
      }
    });

    // Get agency details to map to locations
    const agencies = await prisma.agency.findMany({
      where: {
        id: {
          in: locations.map(l => l.agencyId!).filter(Boolean)
        }
      },
      select: {
        id: true,
        city: true
      }
    });

    const agencyMap = new Map(agencies.map(a => [a.id, a.city || 'Unknown']));

    // Group by city
    const locationData = new Map<string, { revenue: number; bookings: number }>();
    
    locations.forEach(location => {
      if (location.agencyId) {
        const city = agencyMap.get(location.agencyId) || 'Unknown';
        const existing = locationData.get(city) || { revenue: 0, bookings: 0 };
        locationData.set(city, {
          revenue: existing.revenue + (location._sum.totalPrice || 0),
          bookings: existing.bookings + location._count.id
        });
      }
    });

    return Array.from(locationData.entries())
      .map(([location, data]) => ({
        location,
        revenue: data.revenue,
        bookings: data.bookings
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  // Get booking status distribution
  static async getBookingStatusDistribution(
    startDate: Date,
    endDate: Date
  ): Promise<{ status: string; count: number; percentage: number }[]> {
    const statusData = await prisma.booking.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        id: true
      }
    });

    const totalBookings = statusData.reduce((sum, item) => sum + item._count.id, 0);

    return statusData.map(item => ({
      status: item.status,
      count: item._count.id,
      percentage: totalBookings > 0 ? (item._count.id / totalBookings) * 100 : 0
    }));
  }

  // Helper method to get date key based on grouping
  private static getDateKey(date: Date, groupBy: 'day' | 'week' | 'month'): string {
    switch (groupBy) {
      case 'day':
        return format(date, 'yyyy-MM-dd');
      case 'week':
        return format(startOfWeek(date), 'yyyy-MM-dd');
      case 'month':
        return format(date, 'yyyy-MM');
      default:
        return format(date, 'yyyy-MM-dd');
    }
  }

  // Get popular car categories
  static async getPopularCarCategories(
    startDate: Date,
    endDate: Date
  ): Promise<{ category: string; bookings: number; revenue: number }[]> {
    const categoryData = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: { not: 'cancelled' },
        car: {
          isNot: null
        }
      },
      include: {
        car: {
          select: {
            category: true
          }
        }
      }
    });

    const categories = new Map<string, { bookings: number; revenue: number }>();

    categoryData.forEach(booking => {
      if (booking.car?.category) {
        const existing = categories.get(booking.car.category) || { bookings: 0, revenue: 0 };
        categories.set(booking.car.category, {
          bookings: existing.bookings + 1,
          revenue: existing.revenue + booking.totalPrice
        });
      }
    });

    return Array.from(categories.entries())
      .map(([category, data]) => ({
        category,
        bookings: data.bookings,
        revenue: data.revenue
      }))
      .sort((a, b) => b.bookings - a.bookings);
  }
}
