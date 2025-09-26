// ============================================================================
// Prisma Database Client for Car Rental Marketplace
// ============================================================================
// Local development database utilities using Prisma ORM
// ============================================================================

import { PrismaClient } from '@prisma/client';
import type {
  CarSearchParams,
  BookingCreateParams,
  PriceCalculation,
  CarSearchResponse
} from '@/types/database.types';

// ============================================================================
// Prisma Client Setup
// ============================================================================

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// ============================================================================
// Car Search Functions
// ============================================================================

export async function searchCars(params: CarSearchParams): Promise<CarSearchResponse> {
  // Build the where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {
    status: 'available',
    agency: {
      isActive: true,
    },
  };

  // Apply filters
  if (params.category) {
    where.category = params.category;
  }

  if (params.min_price || params.max_price) {
    where.basePricePerDay = {};
    if (params.min_price) where.basePricePerDay.gte = params.min_price;
    if (params.max_price) where.basePricePerDay.lte = params.max_price;
  }

  if (params.transmission) {
    where.transmission = params.transmission;
  }

  if (params.fuel_type) {
    where.fuelType = params.fuel_type;
  }

  if (params.min_seats) {
    where.seats = { gte: params.min_seats };
  }

  if (params.agency_id) {
    where.agencyId = params.agency_id;
  }

  if (params.city) {
    where.agency = { ...where.agency, city: params.city };
  }

  // Handle availability check
  if (params.pickup_datetime && params.dropoff_datetime) {
    where.NOT = {
      bookings: {
        some: {
          status: { in: ['confirmed', 'active'] },
          pickupDatetime: { lte: new Date(params.dropoff_datetime) },
          dropoffDatetime: { gte: new Date(params.pickup_datetime) },
        },
      },
    };
  }

  // Build orderBy
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: Record<string, any> = { basePricePerDay: 'asc' };
  switch (params.sort_by) {
    case 'price_asc':
      orderBy = { basePricePerDay: 'asc' };
      break;
    case 'price_desc':
      orderBy = { basePricePerDay: 'desc' };
      break;
    case 'rating':
      orderBy = { agency: { averageRating: 'desc' } };
      break;
    case 'popular':
      orderBy = { agency: { totalReviews: 'desc' } };
      break;
  }

  // Execute query
  const cars = await prisma.car.findMany({
    where,
    include: {
      agency: {
        select: {
          id: true,
          name: true,
          slug: true,
          averageRating: true,
          totalReviews: true,
          phone: true,
          email: true,
        },
      },
    },
    orderBy,
    take: params.limit || 20,
    skip: params.offset || 0,
  });

  // Get total count
  const total = await prisma.car.count({ where });

  // Get filters for the response
  const allCars = await prisma.car.findMany({
    where: {
      status: 'available',
      agency: { isActive: true },
    },
    include: {
      agency: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const filters = processFilters(allCars);

  // Transform to match the expected interface
  const transformedCars = cars.map((car) => ({
    ...car,
    features: JSON.parse(car.features),
    images: JSON.parse(car.images),
    agency_name: car.agency?.name || '',
    agency_slug: car.agency?.slug || '',
    agency_rating: car.agency?.averageRating || 0,
    agency_reviews: car.agency?.totalReviews || 0,
    agency_phone: car.agency?.phone || '',
    agency_email: car.agency?.email || '',
  }));

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cars: transformedCars as any[],
    filters,
    total,
  };
}

function processFilters(cars: Array<{
  category: string;
  basePricePerDay: number;
  agency?: { id: string; name: string };
  features: string;
}>): CarSearchResponse['filters'] {
  const categories = new Map();
  const agencies = new Map();
  const featuresMap = new Map();
  let minPrice = Infinity;
  let maxPrice = 0;

  cars.forEach((car) => {
    // Categories
    categories.set(car.category, (categories.get(car.category) || 0) + 1);

    // Price range
    minPrice = Math.min(minPrice, car.basePricePerDay);
    maxPrice = Math.max(maxPrice, car.basePricePerDay);

    // Agencies
    if (car.agency) {
      agencies.set(car.agency.id, {
        id: car.agency.id,
        name: car.agency.name,
        count: (agencies.get(car.agency.id)?.count || 0) + 1,
      });
    }

    // Features
    try {
      const features = JSON.parse(car.features);
      if (Array.isArray(features)) {
        features.forEach((feature: string) => {
          featuresMap.set(feature, (featuresMap.get(feature) || 0) + 1);
        });
      }
    } catch {
      // Ignore JSON parse errors
    }
  });

  return {
    categories: Array.from(categories.entries()).map(([value, count]) => ({ value, count })),
    price_range: { min: minPrice === Infinity ? 0 : minPrice, max: maxPrice },
    agencies: Array.from(agencies.values()),
    features: Array.from(featuresMap.entries()).map(([value, count]) => ({ value, count })),
  };
}

// ============================================================================
// Car Management Functions
// ============================================================================

export async function getCarById(id: string) {
  return await prisma.car.findUnique({
    where: { id },
    include: {
      agency: true,
      reviews: {
        include: {
          customer: {
            select: {
              fullName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      },
    },
  });
}

export async function getCarsByAgency(agencyId: string, status?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = { agencyId };
  if (status) where.status = status;

  return await prisma.car.findMany({
    where,
    include: {
      agency: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

// ============================================================================
// Booking Functions
// ============================================================================

export async function createBooking(params: BookingCreateParams) {
  // Calculate pricing first
  const pricing = await calculateBookingPrice(params);

  // Generate booking reference
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  const bookingReference = `AR${dateStr}${randomStr}`;

  // Create the booking
  const booking = await prisma.booking.create({
    data: {
      bookingReference,
      carId: params.car_id,
      customerName: params.customer_name,
      customerEmail: params.customer_email,
      customerPhone: params.customer_phone,
      pickupLocationId: params.pickup_location_id,
      dropoffLocationId: params.dropoff_location_id,
      pickupDatetime: new Date(params.pickup_datetime),
      dropoffDatetime: new Date(params.dropoff_datetime),
      specialRequests: params.special_requests,
      drivingLicenseInfo: params.driving_license_info ? JSON.stringify(params.driving_license_info) : null,
      basePrice: pricing.base_price,
      extrasPrice: pricing.extras_price,
      insurancePrice: pricing.insurance_price,
      taxAmount: pricing.tax_amount,
      totalPrice: pricing.total_price,
      securityDeposit: pricing.security_deposit,
      currency: pricing.currency,
      status: 'pending',
    },
    include: {
      car: true,
      agency: true,
      pickupLocation: true,
      dropoffLocation: true,
    },
  });

  // Add extras if provided
  if (params.extras && params.extras.length > 0) {
    for (const extraParam of params.extras) {
      const extra = await prisma.optionalExtra.findUnique({
        where: { id: extraParam.extra_id },
      });

      if (extra) {
        const unitPrice = extra.pricePerDay || extra.pricePerBooking || 0;
        const rentalDays = Math.ceil(
          (new Date(params.dropoff_datetime).getTime() - new Date(params.pickup_datetime).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        const totalPrice = extra.pricePerDay
          ? unitPrice * rentalDays * extraParam.quantity
          : unitPrice * extraParam.quantity;

        await prisma.bookingExtra.create({
          data: {
            bookingId: booking.id,
            extraId: extraParam.extra_id,
            quantity: extraParam.quantity,
            unitPrice,
            totalPrice,
          },
        });
      }
    }
  }

  return booking;
}

export async function getBookingByReference(reference: string) {
  return await prisma.booking.findUnique({
    where: { bookingReference: reference },
    include: {
      car: true,
      agency: true,
      customer: true,
      pickupLocation: true,
      dropoffLocation: true,
      extras: {
        include: {
          extra: true,
        },
      },
    },
  });
}

export async function updateBookingStatus(bookingId: string, status: string) {
  return await prisma.booking.update({
    where: { id: bookingId },
    data: { 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: status as any,
      updatedAt: new Date(),
    },
  });
}

// ============================================================================
// Pricing Functions
// ============================================================================

export async function calculateBookingPrice(params: BookingCreateParams): Promise<PriceCalculation> {
  // Get car details
  const car = await prisma.car.findUnique({
    where: { id: params.car_id },
    include: { agency: true },
  });

  if (!car) {
    throw new Error('Car not found');
  }

  // Calculate rental days
  const pickupDate = new Date(params.pickup_datetime);
  const dropoffDate = new Date(params.dropoff_datetime);
  const rentalDays = Math.ceil((dropoffDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24));

  if (rentalDays < 1) {
    throw new Error('Invalid rental duration');
  }

  // Base price calculation
  let basePrice = car.basePricePerDay * rentalDays;

  // Apply pricing rules
  const pricingRules = await prisma.pricingRule.findMany({
    where: {
      agencyId: car.agencyId,
      isActive: true,
    },
    orderBy: {
      priority: 'desc',
    },
  });

  for (const rule of pricingRules) {
    // Simple rule application - can be extended
    if (rule.ruleType === 'weekly' && rentalDays >= 7) {
      if (rule.adjustmentType === 'percentage') {
        basePrice *= (1 + rule.adjustmentValue / 100);
      }
    }
  }

  // Calculate extras
  let extrasPrice = 0;
  const extrasBreakdown = [];

  if (params.extras) {
    for (const extraParam of params.extras) {
      const extra = await prisma.optionalExtra.findUnique({
        where: { id: extraParam.extra_id },
      });

      if (extra) {
        const extraCost = extra.pricePerDay
          ? extra.pricePerDay * rentalDays * extraParam.quantity
          : (extra.pricePerBooking || 0) * extraParam.quantity;

        extrasPrice += extraCost;
        extrasBreakdown.push({
          name: extra.name,
          quantity: extraParam.quantity,
          unit_price: extra.pricePerDay || extra.pricePerBooking || 0,
          total_price: extraCost,
        });
      }
    }
  }

  // Calculate insurance
  const insurancePrice = car.insuranceDailyCost * rentalDays;

  // Calculate tax (20% VAT in Morocco)
  const taxRate = 0.20;
  const taxAmount = (basePrice + extrasPrice + insurancePrice) * taxRate;

  // Total calculation
  const totalPrice = basePrice + extrasPrice + insurancePrice + taxAmount;

  return {
    base_price: basePrice,
    extras_price: extrasPrice,
    insurance_price: insurancePrice,
    tax_amount: taxAmount,
    total_price: totalPrice,
    security_deposit: car.securityDeposit,
    currency: 'MAD',
    rental_days: rentalDays,
    breakdown: {
      daily_rate: car.basePricePerDay,
      total_days: rentalDays,
      extras: extrasBreakdown,
      taxes: [
        {
          name: 'VAT',
          rate: taxRate,
          amount: taxAmount,
        },
      ],
    },
  };
}

// ============================================================================
// Agency Functions
// ============================================================================

export async function getAgencyBySlug(slug: string) {
  return await prisma.agency.findUnique({
    where: { 
      slug,
      isActive: true,
    },
    include: {
      primaryLocation: true,
      cars: {
        where: { status: 'available' },
      },
      reviews: {
        include: {
          customer: {
            select: {
              fullName: true,
              avatarUrl: true,
            },
          },
          car: {
            select: {
              make: true,
              model: true,
              year: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
    },
  });
}

export async function getAgencies(city?: string, verified_only?: boolean) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = { isActive: true };

  if (city) where.city = city;
  if (verified_only) where.isVerified = true;

  return await prisma.agency.findMany({
    where,
    include: {
      _count: {
        select: {
          cars: true,
        },
      },
    },
    orderBy: {
      averageRating: 'desc',
    },
  });
}

// ============================================================================
// Location Functions
// ============================================================================

export async function getLocations(airport_only?: boolean, city?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {};

  if (airport_only) where.isAirport = true;
  if (city) where.city = city;

  return await prisma.location.findMany({
    where,
    orderBy: {
      name: 'asc',
    },
  });
}

// ============================================================================
// Review Functions
// ============================================================================

export async function getCarReviews(carId: string, limit?: number) {
  return await prisma.review.findMany({
    where: { carId },
    include: {
      customer: {
        select: {
          fullName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
}

export async function getAgencyReviews(agencyId: string, limit?: number) {
  return await prisma.review.findMany({
    where: { agencyId },
    include: {
      customer: {
        select: {
          fullName: true,
          avatarUrl: true,
        },
      },
      car: {
        select: {
          make: true,
          model: true,
          year: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

export function formatPrice(amount: number, currency: string = 'MAD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function calculateDaysBetween(start: string | Date, end: string | Date): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
