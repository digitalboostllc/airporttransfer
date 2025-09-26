// ============================================================================
// Database Types for Car Rental Marketplace
// ============================================================================
// Auto-generated types corresponding to the PostgreSQL schema
// ============================================================================

export type UserRole = 'customer' | 'agency_owner' | 'agency_staff' | 'admin';
export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
export type CarStatus = 'available' | 'rented' | 'maintenance' | 'inactive';
export type TransmissionType = 'manual' | 'automatic' | 'cvt';
export type FuelType = 'petrol' | 'diesel' | 'hybrid' | 'electric';
export type CarCategory = 'economy' | 'compact' | 'midsize' | 'luxury' | 'suv' | 'van' | 'convertible' | 'sports';

// ============================================================================
// Core Entity Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  phone?: string;
  full_name: string;
  role: UserRole;
  password_hash?: string;
  avatar_url?: string;
  date_of_birth?: string;
  driving_license_number?: string;
  driving_license_expiry?: string;
  preferred_language: string;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  is_airport: boolean;
  airport_code?: string;
  operating_hours?: OperatingHours;
  contact_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Agency {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  cover_image_url?: string;
  email: string;
  phone: string;
  website_url?: string;
  license_number?: string;
  primary_location_id?: string;
  address: string;
  city: string;
  founded_year?: number;
  fleet_size: number;
  languages: string[];
  commission_rate: number;
  auto_confirm_bookings: boolean;
  cancellation_policy?: string;
  terms_and_conditions?: string;
  is_verified: boolean;
  is_active: boolean;
  verification_documents?: string[];
  average_rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
  
  // Relations
  primary_location?: Location;
}

export interface Car {
  id: string;
  agency_id: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  license_plate?: string;
  vin?: string;
  category: CarCategory;
  body_type?: string;
  seats: number;
  doors: number;
  luggage_capacity?: number;
  transmission: TransmissionType;
  fuel_type: FuelType;
  engine_size?: string;
  fuel_capacity?: number;
  features: string[];
  base_price_per_day: number;
  price_per_km: number;
  free_km_per_day: number;
  security_deposit: number;
  minimum_age: number;
  minimum_license_years: number;
  basic_insurance_included: boolean;
  insurance_daily_cost: number;
  status: CarStatus;
  is_featured: boolean;
  last_service_date?: string;
  next_service_date?: string;
  mileage: number;
  images: string[];
  main_image_url?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  agency?: Agency;
}

export interface Booking {
  id: string;
  booking_reference: string;
  customer_id?: string;
  agency_id?: string;
  car_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  pickup_location_id?: string;
  dropoff_location_id?: string;
  pickup_datetime: string;
  dropoff_datetime: string;
  actual_pickup_datetime?: string;
  actual_dropoff_datetime?: string;
  base_price: number;
  extras_price: number;
  insurance_price: number;
  tax_amount: number;
  total_price: number;
  security_deposit: number;
  currency: string;
  status: BookingStatus;
  confirmation_code?: string;
  special_requests?: string;
  driving_license_info?: Record<string, unknown>;
  payment_status: string;
  payment_method?: string;
  payment_reference?: string;
  paid_at?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  cancellation_reason?: string;
  refund_amount?: number;
  created_at: string;
  updated_at: string;
  
  // Relations
  customer?: User;
  agency?: Agency;
  car?: Car;
  pickup_location?: Location;
  dropoff_location?: Location;
  extras?: BookingExtra[];
}

export interface OptionalExtra {
  id: string;
  agency_id: string;
  name: string;
  description?: string;
  price_per_day?: number;
  price_per_booking?: number;
  max_quantity: number;
  is_active: boolean;
  created_at: string;
  
  // Relations
  agency?: Agency;
}

export interface BookingExtra {
  id: string;
  booking_id: string;
  extra_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  
  // Relations
  booking?: Booking;
  extra?: OptionalExtra;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id?: string;
  agency_id: string;
  car_id: string;
  rating: number;
  title?: string;
  comment?: string;
  cleanliness_rating?: number;
  service_rating?: number;
  value_rating?: number;
  is_verified: boolean;
  is_featured: boolean;
  agency_response?: string;
  agency_response_date?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  booking?: Booking;
  customer?: User;
  agency?: Agency;
  car?: Car;
}

export interface PricingRule {
  id: string;
  agency_id: string;
  car_id?: string;
  name: string;
  rule_type: string;
  start_date?: string;
  end_date?: string;
  min_rental_days?: number;
  max_rental_days?: number;
  days_of_week?: number[];
  adjustment_type: 'percentage' | 'fixed_amount';
  adjustment_value: number;
  is_active: boolean;
  priority: number;
  created_at: string;
  
  // Relations
  agency?: Agency;
  car?: Car;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  related_booking_id?: string;
  action_url?: string;
  is_read: boolean;
  sent_via: string[];
  created_at: string;
  
  // Relations
  user?: User;
  related_booking?: Booking;
}

export interface AgencyLocation {
  id: string;
  agency_id: string;
  location_id: string;
  is_primary: boolean;
  services: string[];
  created_at: string;
  
  // Relations
  agency?: Agency;
  location?: Location;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface OperatingHours {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

export interface DaySchedule {
  open?: string;
  close?: string;
  closed?: boolean;
}

export interface CarSearchParams {
  location_id?: string;
  city?: string;
  category?: CarCategory;
  pickup_datetime?: string;
  dropoff_datetime?: string;
  min_price?: number;
  max_price?: number;
  transmission?: TransmissionType;
  fuel_type?: FuelType;
  min_seats?: number;
  features?: string[];
  agency_id?: string;
  sort_by?: 'price_asc' | 'price_desc' | 'rating' | 'popular';
  limit?: number;
  offset?: number;
}

export interface BookingCreateParams {
  car_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  pickup_location_id: string;
  dropoff_location_id: string;
  pickup_datetime: string;
  dropoff_datetime: string;
  special_requests?: string;
  driving_license_info?: Record<string, unknown>;
  extras?: Array<{
    extra_id: string;
    quantity: number;
  }>;
}

export interface PriceCalculation {
  base_price: number;
  extras_price: number;
  insurance_price: number;
  tax_amount: number;
  total_price: number;
  security_deposit: number;
  currency: string;
  rental_days: number;
  breakdown: {
    daily_rate: number;
    total_days: number;
    extras: Array<{
      name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }>;
    taxes: Array<{
      name: string;
      rate: number;
      amount: number;
    }>;
  };
}

// ============================================================================
// View Types (for database views)
// ============================================================================

export interface AvailableCarView extends Car {
  agency_name: string;
  agency_slug: string;
  agency_rating: number;
  agency_reviews: number;
  agency_phone: string;
  agency_email: string;
}

export interface BookingSummaryView extends Booking {
  make: string;
  model: string;
  year: number;
  agency_name: string;
  pickup_location_name: string;
  dropoff_location_name: string;
}

export interface AgencyStatsView {
  id: string;
  name: string;
  total_cars: number;
  available_cars: number;
  rented_cars: number;
  total_bookings: number;
  confirmed_bookings: number;
  total_revenue: number;
  average_rating: number;
  total_reviews: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CarSearchResponse {
  cars: AvailableCarView[];
  filters: {
    categories: Array<{ value: CarCategory; count: number }>;
    price_range: { min: number; max: number };
    agencies: Array<{ id: string; name: string; count: number }>;
    features: Array<{ value: string; count: number }>;
  };
  total: number;
}

// ============================================================================
// Form Types
// ============================================================================

export interface CarSearchFormData {
  location: string;
  pickup_date?: Date;
  return_date?: Date;
  pickup_time?: string;
  return_time?: string;
  category?: CarCategory;
}

export interface BookingFormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  pickup_date: Date;
  return_date: Date;
  pickup_time: string;
  return_time: string;
  special_requests?: string;
  extras: Array<{
    extra_id: string;
    quantity: number;
  }>;
  driving_license_number: string;
  driving_license_expiry: Date;
}

export interface ReviewFormData {
  rating: number;
  title?: string;
  comment?: string;
  cleanliness_rating?: number;
  service_rating?: number;
  value_rating?: number;
}

// ============================================================================
// Database Configuration
// ============================================================================

export interface DatabaseConfig {
  url: string;
  max_connections?: number;
  ssl?: boolean;
  schema?: string;
}

export interface SupabaseConfig {
  url: string;
  anon_key: string;
  service_key?: string;
}

// ============================================================================
// Error Types
// ============================================================================

export interface DatabaseError extends Error {
  code: string;
  detail?: string;
  hint?: string;
  table?: string;
  column?: string;
}

export interface ValidationError extends Error {
  field: string;
  value: unknown;
  constraint: string;
}
