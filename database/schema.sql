-- ============================================================================
-- Car Rental Marketplace Database Schema
-- ============================================================================
-- This schema supports a multi-agency car rental marketplace
-- Compatible with PostgreSQL / Supabase
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('customer', 'agency_owner', 'agency_staff', 'admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'active', 'completed', 'cancelled');
CREATE TYPE car_status AS ENUM ('available', 'rented', 'maintenance', 'inactive');
CREATE TYPE transmission_type AS ENUM ('manual', 'automatic', 'cvt');
CREATE TYPE fuel_type AS ENUM ('petrol', 'diesel', 'hybrid', 'electric');
CREATE TYPE car_category AS ENUM ('economy', 'compact', 'midsize', 'luxury', 'suv', 'van', 'convertible', 'sports');

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    full_name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'customer',
    password_hash TEXT, -- For custom auth, or leave NULL if using OAuth
    avatar_url TEXT,
    date_of_birth DATE,
    driving_license_number VARCHAR(50),
    driving_license_expiry DATE,
    preferred_language VARCHAR(5) DEFAULT 'en',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- LOCATIONS TABLE
-- ============================================================================

CREATE TABLE locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'Morocco',
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_airport BOOLEAN DEFAULT FALSE,
    airport_code VARCHAR(5), -- CMN, RAK, etc.
    operating_hours JSONB, -- {"monday": {"open": "08:00", "close": "20:00"}, ...}
    contact_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- AGENCIES TABLE
-- ============================================================================

CREATE TABLE agencies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL, -- URL-friendly name
    description TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    website_url TEXT,
    license_number VARCHAR(100) UNIQUE,
    
    -- Address & Location
    primary_location_id UUID REFERENCES locations(id),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    
    -- Business Information
    founded_year INTEGER,
    fleet_size INTEGER DEFAULT 0,
    languages JSONB DEFAULT '["ar", "fr", "en"]', -- Supported languages
    
    -- Settings
    commission_rate DECIMAL(5, 2) DEFAULT 10.00, -- Platform commission %
    auto_confirm_bookings BOOLEAN DEFAULT FALSE,
    cancellation_policy TEXT,
    terms_and_conditions TEXT,
    
    -- Status & Verification
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    verification_documents JSONB, -- Array of document URLs
    
    -- Ratings (calculated)
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- AGENCY_LOCATIONS (Many-to-Many)
-- ============================================================================

CREATE TABLE agency_locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    services JSONB DEFAULT '["pickup", "dropoff"]', -- Available services at this location
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(agency_id, location_id)
);

-- ============================================================================
-- CARS TABLE
-- ============================================================================

CREATE TABLE cars (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
    
    -- Basic Information
    make VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    color VARCHAR(50),
    license_plate VARCHAR(20) UNIQUE,
    vin VARCHAR(50) UNIQUE,
    
    -- Classification
    category car_category NOT NULL,
    body_type VARCHAR(50), -- hatchback, sedan, coupe, etc.
    
    -- Specifications
    seats INTEGER NOT NULL,
    doors INTEGER NOT NULL,
    luggage_capacity INTEGER, -- Number of large bags
    transmission transmission_type NOT NULL,
    fuel_type fuel_type NOT NULL,
    engine_size VARCHAR(20), -- "1.6L", "2.0T", etc.
    fuel_capacity INTEGER, -- Liters
    
    -- Features (stored as JSONB for flexibility)
    features JSONB DEFAULT '[]', -- ["GPS", "Bluetooth", "AC", "Leather Seats", ...]
    
    -- Pricing
    base_price_per_day DECIMAL(10, 2) NOT NULL,
    price_per_km DECIMAL(10, 2) DEFAULT 0.00,
    free_km_per_day INTEGER DEFAULT 0, -- 0 means unlimited
    security_deposit DECIMAL(10, 2) NOT NULL,
    
    -- Requirements
    minimum_age INTEGER DEFAULT 21,
    minimum_license_years INTEGER DEFAULT 1,
    
    -- Insurance
    basic_insurance_included BOOLEAN DEFAULT TRUE,
    insurance_daily_cost DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Status
    status car_status DEFAULT 'available',
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Maintenance
    last_service_date DATE,
    next_service_date DATE,
    mileage INTEGER DEFAULT 0,
    
    -- Media
    images JSONB DEFAULT '[]', -- Array of image URLs
    main_image_url TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CHECK (year >= 2000 AND year <= EXTRACT(YEAR FROM NOW()) + 1),
    CHECK (seats >= 2 AND seats <= 12),
    CHECK (base_price_per_day > 0),
    CHECK (security_deposit >= 0)
);

-- ============================================================================
-- OPTIONAL_EXTRAS TABLE
-- ============================================================================

CREATE TABLE optional_extras (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_per_day DECIMAL(10, 2),
    price_per_booking DECIMAL(10, 2),
    max_quantity INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CHECK (price_per_day IS NOT NULL OR price_per_booking IS NOT NULL)
);

-- ============================================================================
-- BOOKINGS TABLE
-- ============================================================================

CREATE TABLE bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_reference VARCHAR(20) UNIQUE NOT NULL, -- Human-readable reference
    
    -- Relationships
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL,
    car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
    
    -- Customer Details (stored even if user is deleted)
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    
    -- Rental Details
    pickup_location_id UUID REFERENCES locations(id),
    dropoff_location_id UUID REFERENCES locations(id),
    pickup_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    dropoff_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_pickup_datetime TIMESTAMP WITH TIME ZONE,
    actual_dropoff_datetime TIMESTAMP WITH TIME ZONE,
    
    -- Pricing Breakdown
    base_price DECIMAL(10, 2) NOT NULL,
    extras_price DECIMAL(10, 2) DEFAULT 0.00,
    insurance_price DECIMAL(10, 2) DEFAULT 0.00,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_price DECIMAL(10, 2) NOT NULL,
    security_deposit DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MAD',
    
    -- Status & Tracking
    status booking_status DEFAULT 'pending',
    confirmation_code VARCHAR(10), -- For customer reference
    
    -- Additional Information
    special_requests TEXT,
    driving_license_info JSONB, -- Stored license details for verification
    
    -- Payment Information
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, refunded, failed
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Cancellation
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by UUID REFERENCES users(id),
    cancellation_reason TEXT,
    refund_amount DECIMAL(10, 2),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CHECK (pickup_datetime < dropoff_datetime),
    CHECK (total_price >= 0),
    CHECK (security_deposit >= 0)
);

-- ============================================================================
-- BOOKING_EXTRAS (Many-to-Many)
-- ============================================================================

CREATE TABLE booking_extras (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    extra_id UUID REFERENCES optional_extras(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    
    UNIQUE(booking_id, extra_id)
);

-- ============================================================================
-- REVIEWS TABLE
-- ============================================================================

CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
    
    -- Review Details
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    
    -- Detailed Ratings
    cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
    service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    
    -- Status
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Response from Agency
    agency_response TEXT,
    agency_response_date TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure only one review per booking
    UNIQUE(booking_id)
);

-- ============================================================================
-- PRICING_RULES TABLE (For dynamic pricing)
-- ============================================================================

CREATE TABLE pricing_rules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE, -- NULL for agency-wide rules
    
    -- Rule Details
    name VARCHAR(255) NOT NULL,
    rule_type VARCHAR(50) NOT NULL, -- 'seasonal', 'weekly', 'promotional', 'demand'
    
    -- Conditions
    start_date DATE,
    end_date DATE,
    min_rental_days INTEGER,
    max_rental_days INTEGER,
    days_of_week JSONB, -- [1,2,3,4,5] for weekdays
    
    -- Pricing Adjustment
    adjustment_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed_amount'
    adjustment_value DECIMAL(10, 2) NOT NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0, -- Higher priority rules applied first
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date)
);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification Details
    type VARCHAR(50) NOT NULL, -- 'booking_confirmed', 'payment_received', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Related Data
    related_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    action_url TEXT, -- URL to navigate to when clicked
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    sent_via JSONB DEFAULT '[]', -- ['email', 'sms', 'push']
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SYSTEM_SETTINGS TABLE
-- ============================================================================

CREATE TABLE system_settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Agency indexes
CREATE INDEX idx_agencies_slug ON agencies(slug);
CREATE INDEX idx_agencies_city ON agencies(city);
CREATE INDEX idx_agencies_is_active ON agencies(is_active);
CREATE INDEX idx_agencies_rating ON agencies(average_rating DESC);

-- Car indexes
CREATE INDEX idx_cars_agency_id ON cars(agency_id);
CREATE INDEX idx_cars_category ON cars(category);
CREATE INDEX idx_cars_status ON cars(status);
CREATE INDEX idx_cars_make_model ON cars(make, model);
CREATE INDEX idx_cars_price ON cars(base_price_per_day);
CREATE INDEX idx_cars_features ON cars USING GIN(features);

-- Booking indexes
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_agency_id ON bookings(agency_id);
CREATE INDEX idx_bookings_car_id ON bookings(car_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_pickup_datetime ON bookings(pickup_datetime);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);

-- Location indexes
CREATE INDEX idx_locations_city ON locations(city);
CREATE INDEX idx_locations_airport ON locations(is_airport);
CREATE INDEX idx_locations_coordinates ON locations(latitude, longitude);

-- Review indexes
CREATE INDEX idx_reviews_agency_id ON reviews(agency_id);
CREATE INDEX idx_reviews_car_id ON reviews(car_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON agencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_reference IS NULL THEN
        NEW.booking_reference := 'AR' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('booking_ref_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE SEQUENCE booking_ref_seq;
CREATE TRIGGER set_booking_reference BEFORE INSERT ON bookings FOR EACH ROW EXECUTE FUNCTION generate_booking_reference();

-- Update agency rating when reviews change
CREATE OR REPLACE FUNCTION update_agency_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE agencies 
    SET 
        average_rating = (
            SELECT ROUND(AVG(rating)::numeric, 2) 
            FROM reviews 
            WHERE agency_id = COALESCE(NEW.agency_id, OLD.agency_id)
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE agency_id = COALESCE(NEW.agency_id, OLD.agency_id)
        )
    WHERE id = COALESCE(NEW.agency_id, OLD.agency_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agency_rating_on_review AFTER INSERT OR UPDATE OR DELETE ON reviews 
FOR EACH ROW EXECUTE FUNCTION update_agency_rating();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY users_own_data ON users FOR ALL USING (auth.uid() = id);

-- Agencies can manage their own data
CREATE POLICY agencies_own_data ON agencies FOR ALL USING (
    id IN (
        SELECT agency_id FROM agency_staff WHERE user_id = auth.uid()
        UNION
        SELECT id FROM agencies WHERE owner_id = auth.uid()
    )
);

-- Cars belong to agencies
CREATE POLICY cars_agency_access ON cars FOR ALL USING (
    agency_id IN (
        SELECT agency_id FROM agency_staff WHERE user_id = auth.uid()
        UNION
        SELECT id FROM agencies WHERE owner_id = auth.uid()
    )
);

-- Public can view active cars
CREATE POLICY cars_public_read ON cars FOR SELECT USING (status = 'available');

-- Bookings access
CREATE POLICY bookings_customer_access ON bookings FOR ALL USING (customer_id = auth.uid());
CREATE POLICY bookings_agency_access ON bookings FOR ALL USING (
    agency_id IN (
        SELECT agency_id FROM agency_staff WHERE user_id = auth.uid()
        UNION
        SELECT id FROM agencies WHERE owner_id = auth.uid()
    )
);

-- ============================================================================
-- SAMPLE DATA INSERTION
-- ============================================================================

-- Insert sample system settings
INSERT INTO system_settings (key, value, description) VALUES
('platform_commission', '10.0', 'Default platform commission percentage'),
('currency', '"MAD"', 'Default currency'),
('supported_languages', '["ar", "fr", "en"]', 'Supported platform languages'),
('booking_cancellation_hours', '24', 'Hours before rental to allow free cancellation'),
('max_rental_days', '30', 'Maximum rental duration in days');

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Available cars with agency info
CREATE VIEW available_cars_view AS
SELECT 
    c.*,
    a.name as agency_name,
    a.slug as agency_slug,
    a.average_rating as agency_rating,
    a.total_reviews as agency_reviews,
    a.phone as agency_phone,
    a.email as agency_email
FROM cars c
JOIN agencies a ON c.agency_id = a.id
WHERE c.status = 'available' AND a.is_active = true;

-- Booking summary view
CREATE VIEW booking_summary_view AS
SELECT 
    b.*,
    c.make, c.model, c.year,
    a.name as agency_name,
    pl.name as pickup_location_name,
    dl.name as dropoff_location_name
FROM bookings b
LEFT JOIN cars c ON b.car_id = c.id
LEFT JOIN agencies a ON b.agency_id = a.id  
LEFT JOIN locations pl ON b.pickup_location_id = pl.id
LEFT JOIN locations dl ON b.dropoff_location_id = dl.id;

-- Agency dashboard stats
CREATE VIEW agency_stats_view AS
SELECT 
    a.id,
    a.name,
    COUNT(c.id) as total_cars,
    COUNT(CASE WHEN c.status = 'available' THEN 1 END) as available_cars,
    COUNT(CASE WHEN c.status = 'rented' THEN 1 END) as rented_cars,
    COUNT(b.id) as total_bookings,
    COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) as confirmed_bookings,
    COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.total_price END), 0) as total_revenue,
    a.average_rating,
    a.total_reviews
FROM agencies a
LEFT JOIN cars c ON a.id = c.agency_id
LEFT JOIN bookings b ON a.id = b.agency_id
GROUP BY a.id, a.name, a.average_rating, a.total_reviews;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
