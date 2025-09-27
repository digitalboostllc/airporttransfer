-- Supabase RLS (Row Level Security) Setup for Venboo
-- Run these commands in your Supabase SQL Editor

-- Enable RLS on critical tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
-- Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id);

-- Create policies for bookings table
-- Users can only see their own bookings
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (auth.uid()::text = customer_id);

CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid()::text = customer_id);

-- Agency owners can see their agency's bookings
CREATE POLICY "Agency owners can view agency bookings" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::text 
            AND users.agency_id = bookings.agency_id
            AND users.role = 'agency_owner'
        )
    );

-- Create policies for cars table
-- Everyone can view cars (public listings)
CREATE POLICY "Anyone can view cars" ON cars
    FOR SELECT USING (true);

-- Only agency owners can manage their cars
CREATE POLICY "Agency owners can manage their cars" ON cars
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::text 
            AND users.agency_id = cars.agency_id
            AND users.role = 'agency_owner'
        )
    );

-- Create policies for agencies table
-- Everyone can view agency info (for car listings)
CREATE POLICY "Anyone can view agencies" ON agencies
    FOR SELECT USING (status = 'approved');

-- Only agency owners can update their agency
CREATE POLICY "Agency owners can update own agency" ON agencies
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::text 
            AND users.agency_id = agencies.id
            AND users.role = 'agency_owner'
        )
    );

-- Create policies for reviews table
-- Everyone can read approved reviews
CREATE POLICY "Anyone can view approved reviews" ON reviews
    FOR SELECT USING (is_verified = true);

-- Users can create reviews for their completed bookings
CREATE POLICY "Users can create reviews for own bookings" ON reviews
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE bookings.id = reviews.booking_id
            AND bookings.customer_id = auth.uid()::text
            AND bookings.status = 'completed'
        )
    );

-- Grant necessary permissions to service role (for your API)
-- This allows your Next.js API routes to bypass RLS when needed
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Note: Your Next.js app will use the service_role key for API operations
-- This bypasses RLS and uses your application logic for security instead
