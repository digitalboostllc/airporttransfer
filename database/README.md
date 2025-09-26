# Car Rental Marketplace Database Schema

## Overview

This database schema supports a multi-agency car rental marketplace platform. It's designed to handle:
- Multiple rental agencies managing their own fleets
- Customer bookings and reservations
- Dynamic pricing and promotional rules
- Reviews and ratings system
- Location-based services
- Optional extras and add-ons

## Database Structure

### Core Tables

#### Users
Stores customer and agency staff information with role-based access.
```sql
- id: UUID (Primary Key)
- email: Unique identifier
- role: customer | agency_owner | agency_staff | admin
- driving_license_info: Required for rentals
```

#### Agencies
Car rental companies on the platform.
```sql
- id: UUID (Primary Key)
- slug: URL-friendly identifier
- commission_rate: Platform commission percentage
- is_verified: Agency verification status
- average_rating: Calculated from reviews
```

#### Cars
Individual vehicles in agency fleets.
```sql
- id: UUID (Primary Key)
- agency_id: Foreign Key to agencies
- category: economy | compact | luxury | suv | van
- features: JSONB array of features
- status: available | rented | maintenance | inactive
```

#### Bookings
Customer rental reservations.
```sql
- id: UUID (Primary Key)
- booking_reference: Human-readable reference (AR20240101001)
- status: pending | confirmed | active | completed | cancelled
- pricing breakdown with taxes and extras
```

#### Locations
Pickup and dropoff points (airports, city centers, etc.)
```sql
- id: UUID (Primary Key)
- is_airport: Boolean flag for airport locations
- operating_hours: JSONB with daily schedules
- coordinates: Latitude/longitude for mapping
```

### Relationship Tables

#### Agency_Locations
Many-to-many relationship between agencies and their service locations.

#### Booking_Extras
Links bookings to optional extras (GPS, child seats, insurance, etc.)

#### Optional_Extras
Add-on services and equipment offered by agencies.

### System Tables

#### Reviews
Customer feedback and ratings for agencies and cars.

#### Pricing_Rules
Dynamic pricing based on seasons, demand, promotions, etc.

#### Notifications
System notifications for users (booking confirmations, reminders, etc.)

## Key Features

### Row Level Security (RLS)
- Users can only access their own data
- Agencies can only manage their own cars and bookings
- Public can view available cars

### Automatic Functions
- **Booking Reference Generation**: Auto-generates references like "AR20240125001"
- **Rating Updates**: Automatically updates agency ratings when reviews change
- **Timestamp Updates**: Auto-updates `updated_at` fields

### Indexes
Optimized indexes for common queries:
- Car searches by category, location, availability
- Booking lookups by customer, agency, date range
- Agency searches by city, rating, verification status

### Views
Pre-built views for common queries:
- `available_cars_view`: Available cars with agency info
- `booking_summary_view`: Complete booking information
- `agency_stats_view`: Agency dashboard statistics

## Data Types

### ENUMs
- `user_role`: customer, agency_owner, agency_staff, admin
- `booking_status`: pending, confirmed, active, completed, cancelled
- `car_status`: available, rented, maintenance, inactive
- `car_category`: economy, compact, midsize, luxury, suv, van, convertible, sports
- `transmission_type`: manual, automatic, cvt
- `fuel_type`: petrol, diesel, hybrid, electric

### JSONB Fields
- `features`: Car features array
- `operating_hours`: Location schedules
- `languages`: Supported languages
- `images`: Car image URLs

## Setup Instructions

### 1. Create Database
```sql
CREATE DATABASE car_rental_marketplace;
```

### 2. Run Schema
```bash
psql -d car_rental_marketplace -f schema.sql
```

### 3. Insert Sample Data
```bash
psql -d car_rental_marketplace -f sample-data.sql
```

### 4. Set Environment Variables
```env
DATABASE_URL=postgresql://username:password@localhost:5432/car_rental_marketplace
```

## Supabase Integration

This schema is fully compatible with Supabase. To use:

1. Create a new Supabase project
2. Go to SQL Editor and run the schema.sql file
3. Run the sample-data.sql for testing data
4. Configure Row Level Security policies as needed
5. Use the auto-generated TypeScript types

### Supabase Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

## Sample Queries

### Find Available Cars
```sql
SELECT * FROM available_cars_view 
WHERE category = 'luxury' 
AND base_price_per_day <= 400
ORDER BY agency_rating DESC;
```

### Agency Dashboard Stats
```sql
SELECT * FROM agency_stats_view 
WHERE id = 'agency-uuid';
```

### Search Cars by Location and Dates
```sql
SELECT c.*, a.name as agency_name
FROM cars c
JOIN agencies a ON c.agency_id = a.id
JOIN agency_locations al ON a.id = al.agency_id
WHERE al.location_id = 'location-uuid'
AND c.status = 'available'
AND c.id NOT IN (
    SELECT car_id FROM bookings 
    WHERE status IN ('confirmed', 'active')
    AND pickup_datetime <= '2024-12-31 10:00:00'
    AND dropoff_datetime >= '2024-12-25 10:00:00'
);
```

### Calculate Booking Total
```sql
SELECT 
    b.*,
    (b.base_price + b.extras_price + b.insurance_price + b.tax_amount) as total_amount
FROM bookings b
WHERE booking_reference = 'AR20240101001';
```

## Performance Considerations

### Indexes
- All foreign keys are indexed
- Common search fields (category, status, city) are indexed
- JSONB fields use GIN indexes for feature searches

### Partitioning
For high-volume deployments, consider partitioning:
- Bookings table by date (monthly/yearly)
- Reviews table by agency_id

### Caching
Recommended caching strategies:
- Agency information (Redis/Memcached)
- Available cars by location (with TTL)
- Pricing rules (updated when changed)

## Backup and Maintenance

### Regular Tasks
- Daily: Backup database
- Weekly: Update car availability status
- Monthly: Archive completed bookings older than 1 year
- Quarterly: Recalculate agency ratings and statistics

### Monitoring
Monitor these metrics:
- Database connection pool usage
- Slow query log
- Index usage statistics
- Booking conversion rates by agency

## API Integration

This schema supports RESTful APIs for:
- Car search and filtering
- Booking creation and management
- Agency administration
- Customer profiles
- Review and rating system

Common API endpoints would include:
- `GET /api/cars?location=X&category=Y`
- `POST /api/bookings`
- `GET /api/agencies/:slug/cars`
- `POST /api/reviews`
