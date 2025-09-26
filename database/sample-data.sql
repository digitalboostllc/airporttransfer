-- ============================================================================
-- Sample Data for Car Rental Marketplace
-- ============================================================================
-- This file populates the database with realistic sample data for development
-- ============================================================================

-- ============================================================================
-- SAMPLE LOCATIONS
-- ============================================================================

INSERT INTO locations (id, name, address, city, country, postal_code, latitude, longitude, is_airport, airport_code, operating_hours, contact_phone) VALUES
-- Airports
(uuid_generate_v4(), 'Mohammed V International Airport', 'Mohammed V International Airport, Terminal 1', 'Casablanca', 'Morocco', '20000', 33.3675, -7.5898, true, 'CMN', '{"monday": {"open": "06:00", "close": "23:00"}, "tuesday": {"open": "06:00", "close": "23:00"}, "wednesday": {"open": "06:00", "close": "23:00"}, "thursday": {"open": "06:00", "close": "23:00"}, "friday": {"open": "06:00", "close": "23:00"}, "saturday": {"open": "06:00", "close": "23:00"}, "sunday": {"open": "06:00", "close": "23:00"}}', '+212 5 22 53 90 40'),

(uuid_generate_v4(), 'Marrakech Menara Airport', 'Marrakech Menara Airport', 'Marrakech', 'Morocco', '40000', 31.6069, -8.0363, true, 'RAK', '{"monday": {"open": "06:00", "close": "23:00"}, "tuesday": {"open": "06:00", "close": "23:00"}, "wednesday": {"open": "06:00", "close": "23:00"}, "thursday": {"open": "06:00", "close": "23:00"}, "friday": {"open": "06:00", "close": "23:00"}, "saturday": {"open": "06:00", "close": "23:00"}, "sunday": {"open": "06:00", "close": "23:00"}}', '+212 5 24 44 79 10'),

(uuid_generate_v4(), 'Tangier Ibn Battuta Airport', 'Tangier Ibn Battuta Airport', 'Tangier', 'Morocco', '90000', 35.7269, -5.9200, true, 'TNG', '{"monday": {"open": "06:00", "close": "23:00"}, "tuesday": {"open": "06:00", "close": "23:00"}, "wednesday": {"open": "06:00", "close": "23:00"}, "thursday": {"open": "06:00", "close": "23:00"}, "friday": {"open": "06:00", "close": "23:00"}, "saturday": {"open": "06:00", "close": "23:00"}, "sunday": {"open": "06:00", "close": "23:00"}}', '+212 5 39 39 37 20'),

-- City Centers
(uuid_generate_v4(), 'Casablanca City Center', 'Avenue Hassan II, Centre Ville', 'Casablanca', 'Morocco', '20000', 33.5935, -7.6184, false, null, '{"monday": {"open": "08:00", "close": "20:00"}, "tuesday": {"open": "08:00", "close": "20:00"}, "wednesday": {"open": "08:00", "close": "20:00"}, "thursday": {"open": "08:00", "close": "20:00"}, "friday": {"open": "08:00", "close": "20:00"}, "saturday": {"open": "08:00", "close": "18:00"}, "sunday": {"closed": true}}', '+212 5 22 26 75 30'),

(uuid_generate_v4(), 'Rabat Gare Train Station', 'Avenue Mohammed V, Gare Rabat Ville', 'Rabat', 'Morocco', '10000', 34.0209, -6.8416, false, null, '{"monday": {"open": "07:00", "close": "21:00"}, "tuesday": {"open": "07:00", "close": "21:00"}, "wednesday": {"open": "07:00", "close": "21:00"}, "thursday": {"open": "07:00", "close": "21:00"}, "friday": {"open": "07:00", "close": "21:00"}, "saturday": {"open": "07:00", "close": "21:00"}, "sunday": {"open": "07:00", "close": "21:00"}}', '+212 5 37 77 47 47'),

(uuid_generate_v4(), 'Marrakech Medina', 'Place Jemaa el-Fnaa, Medina', 'Marrakech', 'Morocco', '40000', 31.6258, -7.9891, false, null, '{"monday": {"open": "08:00", "close": "19:00"}, "tuesday": {"open": "08:00", "close": "19:00"}, "wednesday": {"open": "08:00", "close": "19:00"}, "thursday": {"open": "08:00", "close": "19:00"}, "friday": {"open": "08:00", "close": "19:00"}, "saturday": {"open": "08:00", "close": "19:00"}, "sunday": {"open": "09:00", "close": "18:00"}}', '+212 5 24 38 76 35');

-- ============================================================================
-- SAMPLE AGENCIES
-- ============================================================================

-- Store location IDs for reference
DO $$
DECLARE
    cmn_airport_id UUID;
    casa_center_id UUID;
    rak_airport_id UUID;
    marrakech_medina_id UUID;
    rabat_station_id UUID;
BEGIN
    -- Get location IDs
    SELECT id INTO cmn_airport_id FROM locations WHERE airport_code = 'CMN';
    SELECT id INTO casa_center_id FROM locations WHERE name = 'Casablanca City Center';
    SELECT id INTO rak_airport_id FROM locations WHERE airport_code = 'RAK';
    SELECT id INTO marrakech_medina_id FROM locations WHERE name = 'Marrakech Medina';
    SELECT id INTO rabat_station_id FROM locations WHERE name = 'Rabat Gare Train Station';

    -- Insert agencies
    INSERT INTO agencies (id, name, slug, description, logo_url, email, phone, website_url, license_number, primary_location_id, address, city, founded_year, fleet_size, commission_rate, is_verified, is_active, average_rating, total_reviews) VALUES
    
    (uuid_generate_v4(), 'EuroCar Morocco', 'eurocar-morocco', 'Leading car rental company in Morocco with over 20 years of experience. We offer a wide range of vehicles from economy cars to luxury SUVs, serving all major airports and cities across Morocco.', '/logos/eurocar-logo.png', 'info@eurocar-morocco.ma', '+212 5 22 33 44 55', 'https://eurocar-morocco.ma', 'LIC-EURO-2019-001', cmn_airport_id, 'Mohammed V International Airport, Terminal 1', 'Casablanca', 2003, 150, 8.50, true, true, 4.5, 234),
    
    (uuid_generate_v4(), 'Atlas Rent Car', 'atlas-rent-car', 'Premium car rental service focusing on quality vehicles and exceptional customer service. Specializing in business and leisure travel with modern fleet and 24/7 support.', '/logos/atlas-logo.png', 'reservations@atlasrentcar.ma', '+212 5 24 44 88 99', 'https://atlasrentcar.ma', 'LIC-ATLAS-2020-002', rak_airport_id, 'Marrakech Menara Airport, Arrival Hall', 'Marrakech', 2010, 85, 9.00, true, true, 4.7, 189),
    
    (uuid_generate_v4(), 'Premium Car Rental', 'premium-car-rental', 'Luxury and executive car rental service for discerning clients. Our fleet includes the latest Mercedes-Benz, BMW, and Audi models with personalized service and chauffeur options.', '/logos/premium-logo.png', 'luxury@premiumcarrental.ma', '+212 5 22 95 76 84', 'https://premiumcarrental.ma', 'LIC-PREM-2018-003', casa_center_id, 'Boulevard Zerktouni, Twin Center', 'Casablanca', 2018, 45, 12.00, true, true, 4.9, 156),
    
    (uuid_generate_v4(), 'Budget Car Morocco', 'budget-car-morocco', 'Affordable car rental solutions for budget-conscious travelers. Clean, reliable vehicles at competitive prices with flexible rental terms and multiple pickup locations.', '/logos/budget-logo.png', 'booking@budgetcarmorocco.ma', '+212 5 37 65 43 21', 'https://budgetcarmorocco.ma', 'LIC-BUDG-2015-004', rabat_station_id, 'Avenue Mohammed V, Agdal', 'Rabat', 2015, 120, 7.50, true, true, 4.2, 298),
    
    (uuid_generate_v4(), 'Family Van Rental', 'family-van-rental', 'Specialized in large vehicles and family-friendly rentals. Perfect for group travel, family vacations, and cargo transport with spacious vans and minibuses.', '/logos/family-logo.png', 'family@vanrental.ma', '+212 5 24 33 77 66', 'https://familyvanrental.ma', 'LIC-FAMI-2017-005', marrakech_medina_id, 'Avenue Mohammed VI, Gueliz', 'Marrakech', 2017, 35, 10.00, true, true, 4.4, 87);
END $$;

-- ============================================================================
-- SAMPLE OPTIONAL EXTRAS
-- ============================================================================

DO $$
DECLARE
    eurocar_id UUID;
    atlas_id UUID;
    premium_id UUID;
    budget_id UUID;
    family_id UUID;
BEGIN
    -- Get agency IDs
    SELECT id INTO eurocar_id FROM agencies WHERE slug = 'eurocar-morocco';
    SELECT id INTO atlas_id FROM agencies WHERE slug = 'atlas-rent-car';
    SELECT id INTO premium_id FROM agencies WHERE slug = 'premium-car-rental';
    SELECT id INTO budget_id FROM agencies WHERE slug = 'budget-car-morocco';
    SELECT id INTO family_id FROM agencies WHERE slug = 'family-van-rental';

    -- Common extras for all agencies
    INSERT INTO optional_extras (agency_id, name, description, price_per_day, max_quantity) VALUES
    -- EuroCar Morocco
    (eurocar_id, 'Additional Driver', 'Add an extra authorized driver to your rental', 50.00, 3),
    (eurocar_id, 'GPS Navigation Device', 'Garmin GPS with Morocco maps and POIs', 30.00, 1),
    (eurocar_id, 'Child Safety Seat (0-4 years)', 'Safety-certified child seat for infants and toddlers', 25.00, 3),
    (eurocar_id, 'Full Coverage Insurance', 'Zero deductible comprehensive insurance coverage', 80.00, 1),
    (eurocar_id, 'WiFi Hotspot Device', 'Mobile internet access for up to 5 devices', 40.00, 1),
    (eurocar_id, 'Snow Chains', 'Required for mountain driving in winter', null, 15.00, 1),
    
    -- Atlas Rent Car
    (atlas_id, 'Additional Driver', 'Add an extra authorized driver to your rental', 45.00, 3),
    (atlas_id, 'Premium GPS System', 'Touch screen GPS with traffic updates', 35.00, 1),
    (atlas_id, 'Child Seat (0-4 years)', 'Premium child safety seat', 30.00, 3),
    (atlas_id, 'Booster Seat (4-12 years)', 'Comfortable booster seat for older children', 20.00, 3),
    (atlas_id, 'Full Insurance Plus', 'Comprehensive coverage with roadside assistance', 90.00, 1),
    (atlas_id, 'Ski Equipment Rack', 'Roof rack for ski equipment', 25.00, 1),
    (atlas_id, 'Mobile Phone Holder', 'Adjustable phone mount for navigation', null, 10.00, 1),
    
    -- Premium Car Rental
    (premium_id, 'Professional Chauffeur', 'Experienced professional driver service', 200.00, 1),
    (premium_id, 'Additional Driver', 'Add an extra authorized driver', 60.00, 2),
    (premium_id, 'Premium Child Seat', 'Luxury child safety seat with premium materials', 40.00, 2),
    (premium_id, 'Concierge Service', '24/7 personal concierge assistance', 100.00, 1),
    (premium_id, 'Airport VIP Meet & Greet', 'Personal assistant at airport arrival', null, 150.00, 1),
    (premium_id, 'Vehicle Delivery', 'Car delivered to your location', null, 80.00, 1),
    
    -- Budget Car Morocco
    (budget_id, 'Additional Driver', 'Extra driver authorization', 40.00, 3),
    (budget_id, 'Basic GPS Device', 'Simple GPS navigation system', 25.00, 1),
    (budget_id, 'Child Seat', 'Standard child safety seat', 20.00, 3),
    (budget_id, 'Enhanced Insurance', 'Reduced deductible insurance option', 60.00, 1),
    (budget_id, 'Roof Box', 'Extra luggage storage space', 35.00, 1),
    
    -- Family Van Rental
    (family_id, 'Additional Driver', 'Extra authorized driver for family trips', 45.00, 3),
    (family_id, 'Multiple Child Seats Package', '3 child seats of different sizes', null, 80.00, 1),
    (family_id, 'Entertainment System', 'DVD player with kids movies', 50.00, 1),
    (family_id, 'Luggage Trailer', 'Additional cargo space for large groups', 70.00, 1),
    (family_id, 'Camping Equipment Package', 'Tents, sleeping bags, and camping gear', null, 120.00, 1);
END $$;

-- ============================================================================
-- SAMPLE CARS
-- ============================================================================

DO $$
DECLARE
    eurocar_id UUID;
    atlas_id UUID;
    premium_id UUID;
    budget_id UUID;
    family_id UUID;
BEGIN
    -- Get agency IDs
    SELECT id INTO eurocar_id FROM agencies WHERE slug = 'eurocar-morocco';
    SELECT id INTO atlas_id FROM agencies WHERE slug = 'atlas-rent-car';
    SELECT id INTO premium_id FROM agencies WHERE slug = 'premium-car-rental';
    SELECT id INTO budget_id FROM agencies WHERE slug = 'budget-car-morocco';
    SELECT id INTO family_id FROM agencies WHERE slug = 'family-van-rental';

    INSERT INTO cars (agency_id, make, model, year, color, license_plate, category, body_type, seats, doors, luggage_capacity, transmission, fuel_type, engine_size, fuel_capacity, features, base_price_per_day, free_km_per_day, security_deposit, minimum_age, images, main_image_url) VALUES
    
    -- EuroCar Morocco Fleet
    (eurocar_id, 'Renault', 'Clio', 2023, 'White', '12345-A-20', 'economy', 'Hatchback', 5, 4, 2, 'manual', 'petrol', '1.0L', 45, '["GPS Navigation", "Bluetooth", "USB Charging", "Power Steering", "Central Locking", "Electric Windows", "Radio/CD Player", "Safety Airbags"]', 180.00, 300, 2000.00, 23, '["/cars/renault-clio-1.jpg", "/cars/renault-clio-2.jpg", "/cars/renault-clio-3.jpg"]', '/cars/renault-clio-1.jpg'),
    
    (eurocar_id, 'Peugeot', '208', 2024, 'Silver', '12346-A-20', 'economy', 'Hatchback', 5, 4, 2, 'automatic', 'petrol', '1.2L', 50, '["GPS Navigation", "Bluetooth", "Cruise Control", "Parking Sensors", "Climate Control", "Keyless Entry", "LED Headlights"]', 200.00, 300, 2200.00, 23, '["/cars/peugeot-208-1.jpg", "/cars/peugeot-208-2.jpg"]', '/cars/peugeot-208-1.jpg'),
    
    (eurocar_id, 'Volkswagen', 'Golf', 2024, 'Blue', '12347-A-20', 'compact', 'Hatchback', 5, 4, 3, 'automatic', 'petrol', '1.4T', 55, '["GPS Navigation", "Bluetooth", "Cruise Control", "Parking Sensors", "Premium Audio", "Heated Seats", "Keyless Entry"]', 240.00, 0, 2500.00, 25, '["/cars/volkswagen-golf-1.jpg"]', '/cars/volkswagen-golf-1.jpg'),
    
    -- Atlas Rent Car Fleet
    (atlas_id, 'Toyota', 'RAV4', 2024, 'Black', '22345-B-20', 'suv', 'SUV', 5, 5, 4, 'automatic', 'hybrid', '2.5L Hybrid', 55, '["GPS Navigation", "Bluetooth", "AWD", "360° Camera", "Heated Seats", "Wireless Charging", "Toyota Safety Sense"]', 320.00, 0, 3500.00, 25, '["/cars/toyota-rav4-1.jpg", "/cars/toyota-rav4-2.jpg"]', '/cars/toyota-rav4-1.jpg'),
    
    (atlas_id, 'Nissan', 'Qashqai', 2023, 'Red', '22346-B-20', 'suv', 'Crossover', 5, 5, 4, 'automatic', 'petrol', '1.6T', 60, '["GPS Navigation", "Bluetooth", "Reverse Camera", "Keyless Entry", "Hill Start Assist", "Intelligent Emergency Braking"]', 290.00, 0, 3000.00, 25, '["/cars/nissan-qashqai-1.jpg"]', '/cars/nissan-qashqai-1.jpg'),
    
    (atlas_id, 'Honda', 'CR-V', 2024, 'White Pearl', '22347-B-20', 'suv', 'SUV', 5, 5, 4, 'automatic', 'hybrid', '2.0L Hybrid', 57, '["Honda Sensing", "GPS Navigation", "Bluetooth", "AWD", "Panoramic Sunroof", "Leather Seats", "Premium Audio"]', 340.00, 0, 3800.00, 25, '["/cars/honda-crv-1.jpg"]', '/cars/honda-crv-1.jpg'),
    
    -- Premium Car Rental Fleet
    (premium_id, 'Mercedes-Benz', 'A-Class', 2024, 'Metallic Grey', '32345-C-20', 'luxury', 'Sedan', 5, 4, 3, 'automatic', 'petrol', '2.0T', 62, '["MBUX Infotainment", "GPS Navigation", "Bluetooth", "Leather Seats", "Premium Sound", "Keyless Entry", "LED Headlights", "Ambient Lighting"]', 380.00, 0, 5000.00, 25, '["/cars/mercedes-a-class-1.jpg", "/cars/mercedes-a-class-2.jpg"]', '/cars/mercedes-a-class-1.jpg'),
    
    (premium_id, 'BMW', '3 Series', 2024, 'Jet Black', '32346-C-20', 'luxury', 'Sedan', 5, 4, 3, 'automatic', 'petrol', '2.0T', 59, '["iDrive System", "GPS Navigation", "Bluetooth", "Leather Seats", "Premium Sound", "Keyless Entry", "LED Headlights", "Sunroof", "Sport Mode"]', 450.00, 0, 6000.00, 25, '["/cars/bmw-3-series-1.jpg"]', '/cars/bmw-3-series-1.jpg'),
    
    (premium_id, 'Audi', 'A4', 2024, 'Glacier White', '32347-C-20', 'luxury', 'Sedan', 5, 4, 3, 'automatic', 'petrol', '2.0T TFSI', 58, '["Virtual Cockpit", "GPS Navigation", "Bluetooth", "Leather Seats", "Premium Sound", "Matrix LED", "Keyless Entry", "Quattro AWD"]', 420.00, 0, 5500.00, 25, '["/cars/audi-a4-1.jpg"]', '/cars/audi-a4-1.jpg'),
    
    -- Budget Car Morocco Fleet
    (budget_id, 'Dacia', 'Sandero', 2023, 'White', '42345-D-20', 'economy', 'Hatchback', 5, 4, 2, 'manual', 'petrol', '1.0L', 50, '["Radio", "USB Port", "Power Steering", "Central Locking"]', 150.00, 250, 1500.00, 21, '["/cars/dacia-sandero-1.jpg"]', '/cars/dacia-sandero-1.jpg'),
    
    (budget_id, 'Hyundai', 'i20', 2023, 'Silver', '42346-D-20', 'economy', 'Hatchback', 5, 4, 2, 'manual', 'petrol', '1.2L', 45, '["Bluetooth", "USB Charging", "Power Steering", "Electric Windows"]', 170.00, 300, 1800.00, 21, '["/cars/hyundai-i20-1.jpg"]', '/cars/hyundai-i20-1.jpg'),
    
    (budget_id, 'Kia', 'Picanto', 2023, 'Red', '42347-D-20', 'economy', 'City Car', 4, 4, 1, 'manual', 'petrol', '1.0L', 42, '["Radio", "USB Port", "Power Steering", "Central Locking"]', 140.00, 200, 1400.00, 21, '["/cars/kia-picanto-1.jpg"]', '/cars/kia-picanto-1.jpg'),
    
    -- Family Van Rental Fleet
    (family_id, 'Ford', 'Transit', 2023, 'White', '52345-E-20', 'van', 'Van', 9, 5, 6, 'manual', 'diesel', '2.0L TDCi', 80, '["GPS Navigation", "Bluetooth", "Large Cargo Space", "Power Steering", "Sliding Doors"]', 280.00, 0, 3000.00, 25, '["/cars/ford-transit-1.jpg"]', '/cars/ford-transit-1.jpg'),
    
    (family_id, 'Citroën', 'Berlingo', 2023, 'Blue', '52346-E-20', 'van', 'MPV', 7, 5, 5, 'manual', 'diesel', '1.6L HDi', 60, '["GPS Navigation", "Bluetooth", "Sliding Doors", "Large Cargo Space", "Roof Rails"]', 250.00, 0, 2500.00, 23, '["/cars/citroen-berlingo-1.jpg"]', '/cars/citroen-berlingo-1.jpg'),
    
    (family_id, 'Mercedes-Benz', 'V-Class', 2024, 'Black', '52347-E-20', 'luxury', 'Luxury Van', 8, 5, 4, 'automatic', 'diesel', '2.2L CDI', 70, '["Premium Navigation", "Bluetooth", "Luxury Interior", "Premium Sound", "Ambient Lighting", "Power Sliding Doors", "Leather Seats"]', 500.00, 0, 8000.00, 25, '["/cars/mercedes-v-class-1.jpg"]', '/cars/mercedes-v-class-1.jpg');
    
END $$;

-- ============================================================================
-- SAMPLE USERS
-- ============================================================================

INSERT INTO users (id, email, phone, full_name, role, date_of_birth, driving_license_number, preferred_language, email_verified) VALUES
(uuid_generate_v4(), 'ahmed.hassan@email.com', '+212661234567', 'Ahmed Hassan', 'customer', '1985-03-15', 'DL123456789', 'ar', true),
(uuid_generate_v4(), 'sarah.martin@email.com', '+212662345678', 'Sarah Martin', 'customer', '1990-07-22', 'DL987654321', 'fr', true),
(uuid_generate_v4(), 'omar.benali@email.com', '+212663456789', 'Omar Ben Ali', 'customer', '1988-12-08', 'DL456789123', 'ar', true),
(uuid_generate_v4(), 'julie.dubois@email.com', '+212664567890', 'Julie Dubois', 'customer', '1992-05-30', 'DL789123456', 'fr', true),
(uuid_generate_v4(), 'john.smith@email.com', '+212665678901', 'John Smith', 'customer', '1987-09-14', 'DL321654987', 'en', true);

-- ============================================================================
-- SAMPLE PRICING RULES
-- ============================================================================

DO $$
DECLARE
    eurocar_id UUID;
    atlas_id UUID;
    premium_id UUID;
BEGIN
    SELECT id INTO eurocar_id FROM agencies WHERE slug = 'eurocar-morocco';
    SELECT id INTO atlas_id FROM agencies WHERE slug = 'atlas-rent-car';
    SELECT id INTO premium_id FROM agencies WHERE slug = 'premium-car-rental';

    INSERT INTO pricing_rules (agency_id, name, rule_type, start_date, end_date, min_rental_days, adjustment_type, adjustment_value, is_active, priority) VALUES
    -- Seasonal pricing
    (eurocar_id, 'Summer High Season', 'seasonal', '2024-06-15', '2024-09-15', 1, 'percentage', 25.00, true, 10),
    (eurocar_id, 'Winter Low Season', 'seasonal', '2024-12-01', '2024-02-28', 1, 'percentage', -15.00, true, 10),
    (atlas_id, 'Ramadan Special', 'promotional', '2024-03-10', '2024-04-10', 3, 'percentage', -20.00, true, 15),
    (premium_id, 'Weekend Premium', 'weekly', null, null, 1, 'percentage', 30.00, true, 5),
    
    -- Long rental discounts
    (eurocar_id, 'Weekly Discount', 'promotional', null, null, 7, 'percentage', -10.00, true, 5),
    (atlas_id, 'Monthly Discount', 'promotional', null, null, 30, 'percentage', -25.00, true, 5);
END $$;

-- ============================================================================
-- UPDATE FLEET SIZES
-- ============================================================================

UPDATE agencies SET fleet_size = (
    SELECT COUNT(*) FROM cars WHERE agency_id = agencies.id
) WHERE id IN (
    SELECT DISTINCT agency_id FROM cars
);
