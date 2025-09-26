// ============================================================================
// Database Utilities for Car Rental Marketplace
// ============================================================================
// Helper functions and configurations for database operations
// ============================================================================

// import { createClient } from '@supabase/supabase-js';
import type {
  Car,
  Agency,
  Booking,
  Location,
  Review,
  CarSearchParams,
  BookingCreateParams,
  PriceCalculation,
  CarSearchResponse,
  DatabaseConfig,
  SupabaseConfig
} from '@/types/database.types';

// ============================================================================
// Database Configuration
// ============================================================================

export const databaseConfig: DatabaseConfig = {
  url: process.env.DATABASE_URL || '',
  max_connections: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
  ssl: process.env.NODE_ENV === 'production',
  schema: 'public'
};

export const supabaseConfig: SupabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  service_key: process.env.SUPABASE_SERVICE_KEY || ''
};

// ============================================================================
// Supabase Client
// ============================================================================

// Note: Uncomment and install @supabase/supabase-js to use these clients
// Client-side Supabase client (with row-level security)
// export const supabase = createClient(
//   supabaseConfig.url,
//   supabaseConfig.anon_key,
//   {
//     auth: {
//       autoRefreshToken: true,
//       persistSession: true,
//       detectSessionInUrl: false
//     }
//   }
// );

// Server-side Supabase client (bypasses row-level security)
// export const supabaseAdmin = createClient(
//   supabaseConfig.url,
//   supabaseConfig.service_key || supabaseConfig.anon_key,
//   {
//     auth: {
//       autoRefreshToken: false,
//       persistSession: false
//     }
//   }
// );

// Placeholder clients for build compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = {} as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseAdmin = {} as any;

// ============================================================================
// Car Search Functions
// ============================================================================

export async function searchCars(params: CarSearchParams): Promise<CarSearchResponse> {
  let query = supabase
    .from('available_cars_view')
    .select('*');

  // Apply filters
  if (params.category) {
    query = query.eq('category', params.category);
  }

  if (params.min_price) {
    query = query.gte('base_price_per_day', params.min_price);
  }

  if (params.max_price) {
    query = query.lte('base_price_per_day', params.max_price);
  }

  if (params.transmission) {
    query = query.eq('transmission', params.transmission);
  }

  if (params.fuel_type) {
    query = query.eq('fuel_type', params.fuel_type);
  }

  if (params.min_seats) {
    query = query.gte('seats', params.min_seats);
  }

  if (params.agency_id) {
    query = query.eq('agency_id', params.agency_id);
  }

  if (params.city) {
    query = query.eq('city', params.city);
  }

  if (params.features && params.features.length > 0) {
    query = query.overlaps('features', params.features);
  }

  // Apply sorting
  switch (params.sort_by) {
    case 'price_asc':
      query = query.order('base_price_per_day', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('base_price_per_day', { ascending: false });
      break;
    case 'rating':
      query = query.order('agency_rating', { ascending: false });
      break;
    case 'popular':
      query = query.order('agency_reviews', { ascending: false });
      break;
    default:
      query = query.order('base_price_per_day', { ascending: true });
  }

  // Apply pagination
  if (params.limit) {
    query = query.limit(params.limit);
  }

  if (params.offset) {
    query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
  }

  // Check availability if dates provided
  if (params.pickup_datetime && params.dropoff_datetime) {
    const { data: unavailableCars } = await supabase
      .from('bookings')
      .select('car_id')
      .in('status', ['confirmed', 'active'])
      .lte('pickup_datetime', params.dropoff_datetime)
      .gte('dropoff_datetime', params.pickup_datetime);

    if (unavailableCars && unavailableCars.length > 0) {
      const unavailableIds = unavailableCars.map((b: { car_id: string }) => b.car_id);
      query = query.not('id', 'in', `(${unavailableIds.join(',')})`);
    }
  }

  const { data: cars, error, count } = await query;

  if (error) {
    throw new Error(`Failed to search cars: ${error.message}`);
  }

  // Get filter aggregations (this would be optimized with database views in production)
  const { data: filterData } = await supabase
    .from('available_cars_view')
    .select('category, base_price_per_day, agency_id, agency_name, features');

  const filters = processFilters(filterData || []);

  return {
    cars: cars || [],
    filters,
    total: count || 0
  };
}

function processFilters(cars: Array<{
  category: string;
  base_price_per_day: number;
  agency_id: string;
  agency_name: string;
  features?: string[];
}>): CarSearchResponse['filters'] {
  const categories = new Map();
  const agencies = new Map();
  const featuresMap = new Map();
  let minPrice = Infinity;
  let maxPrice = 0;

  cars.forEach(car => {
    // Categories
    categories.set(car.category, (categories.get(car.category) || 0) + 1);

    // Price range
    minPrice = Math.min(minPrice, car.base_price_per_day);
    maxPrice = Math.max(maxPrice, car.base_price_per_day);

    // Agencies
    agencies.set(car.agency_id, {
      id: car.agency_id,
      name: car.agency_name,
      count: (agencies.get(car.agency_id)?.count || 0) + 1
    });

    // Features
    if (car.features) {
      car.features.forEach((feature: string) => {
        featuresMap.set(feature, (featuresMap.get(feature) || 0) + 1);
      });
    }
  });

  return {
    categories: Array.from(categories.entries()).map(([value, count]) => ({ value, count })),
    price_range: { min: minPrice === Infinity ? 0 : minPrice, max: maxPrice },
    agencies: Array.from(agencies.values()),
    features: Array.from(featuresMap.entries()).map(([value, count]) => ({ value, count }))
  };
}

// ============================================================================
// Car Management Functions
// ============================================================================

export async function getCarById(id: string): Promise<Car | null> {
  const { data, error } = await supabase
    .from('cars')
    .select(`
      *,
      agency:agencies(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`Failed to get car: ${error.message}`);
  }

  return data;
}

export async function getCarsByAgency(agencyId: string, status?: string): Promise<Car[]> {
  let query = supabase
    .from('cars')
    .select('*')
    .eq('agency_id', agencyId);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get agency cars: ${error.message}`);
  }

  return data || [];
}

// ============================================================================
// Booking Functions
// ============================================================================

export async function createBooking(params: BookingCreateParams): Promise<Booking> {
  // Calculate pricing first
  const pricing = await calculateBookingPrice(params);

  const bookingData = {
    car_id: params.car_id,
    customer_name: params.customer_name,
    customer_email: params.customer_email,
    customer_phone: params.customer_phone,
    pickup_location_id: params.pickup_location_id,
    dropoff_location_id: params.dropoff_location_id,
    pickup_datetime: params.pickup_datetime,
    dropoff_datetime: params.dropoff_datetime,
    special_requests: params.special_requests,
    driving_license_info: params.driving_license_info,
    base_price: pricing.base_price,
    extras_price: pricing.extras_price,
    insurance_price: pricing.insurance_price,
    tax_amount: pricing.tax_amount,
    total_price: pricing.total_price,
    security_deposit: pricing.security_deposit,
    currency: pricing.currency,
    status: 'pending' as const
  };

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert(bookingData)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create booking: ${error.message}`);
  }

  // Add extras if provided
  if (params.extras && params.extras.length > 0) {
    const extrasData = params.extras.map(extra => ({
      booking_id: booking.id,
      extra_id: extra.extra_id,
      quantity: extra.quantity,
      unit_price: 0, // This would be calculated from the extras table
      total_price: 0  // This would be calculated from the extras table
    }));

    const { error: extrasError } = await supabase
      .from('booking_extras')
      .insert(extrasData);

    if (extrasError) {
      console.error('Failed to add booking extras:', extrasError.message);
    }
  }

  return booking;
}

export async function getBookingByReference(reference: string): Promise<Booking | null> {
  const { data, error } = await supabase
    .from('booking_summary_view')
    .select('*')
    .eq('booking_reference', reference)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`Failed to get booking: ${error.message}`);
  }

  return data;
}

export async function updateBookingStatus(bookingId: string, status: string): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', bookingId);

  if (error) {
    throw new Error(`Failed to update booking status: ${error.message}`);
  }
}

// ============================================================================
// Pricing Functions
// ============================================================================

export async function calculateBookingPrice(params: BookingCreateParams): Promise<PriceCalculation> {
  // Get car details
  const { data: car, error: carError } = await supabase
    .from('cars')
    .select('*')
    .eq('id', params.car_id)
    .single();

  if (carError || !car) {
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
  let basePrice = car.base_price_per_day * rentalDays;

  // Apply pricing rules (simplified - would need full pricing rule engine)
  const { data: pricingRules } = await supabase
    .from('pricing_rules')
    .select('*')
    .eq('agency_id', car.agency_id)
    .eq('is_active', true)
    .order('priority', { ascending: false });

  if (pricingRules) {
    for (const rule of pricingRules) {
      // Apply rule logic (simplified)
      if (rule.rule_type === 'weekly' && rentalDays >= 7) {
        if (rule.adjustment_type === 'percentage') {
          basePrice *= (1 + rule.adjustment_value / 100);
        }
      }
    }
  }

  // Calculate extras
  let extrasPrice = 0;
  const extrasBreakdown = [];

  if (params.extras) {
    const extraIds = params.extras.map(e => e.extra_id);
    const { data: extrasData } = await supabase
      .from('optional_extras')
      .select('*')
      .in('id', extraIds);

    if (extrasData) {
      for (const extra of extrasData) {
        const requestedExtra = params.extras.find(e => e.extra_id === extra.id);
        if (requestedExtra) {
          const extraCost = extra.price_per_day 
            ? extra.price_per_day * rentalDays * requestedExtra.quantity
            : (extra.price_per_booking || 0) * requestedExtra.quantity;
          
          extrasPrice += extraCost;
          extrasBreakdown.push({
            name: extra.name,
            quantity: requestedExtra.quantity,
            unit_price: extra.price_per_day || extra.price_per_booking || 0,
            total_price: extraCost
          });
        }
      }
    }
  }

  // Calculate insurance
  const insurancePrice = car.insurance_daily_cost * rentalDays;

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
    security_deposit: car.security_deposit,
    currency: 'MAD',
    rental_days: rentalDays,
    breakdown: {
      daily_rate: car.base_price_per_day,
      total_days: rentalDays,
      extras: extrasBreakdown,
      taxes: [{
        name: 'VAT',
        rate: taxRate,
        amount: taxAmount
      }]
    }
  };
}

// ============================================================================
// Agency Functions
// ============================================================================

export async function getAgencyBySlug(slug: string): Promise<Agency | null> {
  const { data, error } = await supabase
    .from('agencies')
    .select(`
      *,
      primary_location:locations(*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`Failed to get agency: ${error.message}`);
  }

  return data;
}

export async function getAgencies(city?: string, verified_only?: boolean): Promise<Agency[]> {
  let query = supabase
    .from('agencies')
    .select('*')
    .eq('is_active', true);

  if (city) {
    query = query.eq('city', city);
  }

  if (verified_only) {
    query = query.eq('is_verified', true);
  }

  query = query.order('average_rating', { ascending: false });

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get agencies: ${error.message}`);
  }

  return data || [];
}

// ============================================================================
// Location Functions
// ============================================================================

export async function getLocations(airport_only?: boolean, city?: string): Promise<Location[]> {
  let query = supabase.from('locations').select('*');

  if (airport_only) {
    query = query.eq('is_airport', true);
  }

  if (city) {
    query = query.eq('city', city);
  }

  query = query.order('name');

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get locations: ${error.message}`);
  }

  return data || [];
}

// ============================================================================
// Review Functions
// ============================================================================

export async function getCarReviews(carId: string, limit?: number): Promise<Review[]> {
  let query = supabase
    .from('reviews')
    .select(`
      *,
      customer:users(full_name, avatar_url)
    `)
    .eq('car_id', carId)
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get car reviews: ${error.message}`);
  }

  return data || [];
}

export async function getAgencyReviews(agencyId: string, limit?: number): Promise<Review[]> {
  let query = supabase
    .from('reviews')
    .select(`
      *,
      customer:users(full_name, avatar_url),
      car:cars(make, model, year)
    `)
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get agency reviews: ${error.message}`);
  }

  return data || [];
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

export function isCarAvailable(
  car: Car, 
  pickupDate: string, 
  dropoffDate: string,
  existingBookings?: Booking[]
): boolean {
  if (car.status !== 'available') return false;

  if (!existingBookings) return true;

  const pickup = new Date(pickupDate);
  const dropoff = new Date(dropoffDate);

  return !existingBookings.some(booking => {
    if (booking.car_id !== car.id) return false;
    if (!['confirmed', 'active'].includes(booking.status)) return false;

    const bookingPickup = new Date(booking.pickup_datetime);
    const bookingDropoff = new Date(booking.dropoff_datetime);

    // Check for overlap
    return pickup < bookingDropoff && dropoff > bookingPickup;
  });
}

// ============================================================================
// Error Handling
// ============================================================================

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export function handleDatabaseError(error: unknown): never {
  if (error && typeof error === 'object' && 'code' in error) {
    const dbError = error as { code: string; message?: string; details?: unknown };
    throw new DatabaseError(
      dbError.message || 'Database operation failed',
      dbError.code,
      dbError.details
    );
  }
  
  if (error instanceof Error) {
    throw new Error(error.message);
  }
  
  throw new Error('Unknown database error');
}
