-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "full_name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'customer',
    "password_hash" TEXT,
    "avatar_url" TEXT,
    "date_of_birth" DATETIME,
    "driving_license_number" TEXT,
    "driving_license_expiry" DATETIME,
    "preferred_language" TEXT NOT NULL DEFAULT 'en',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Morocco',
    "postal_code" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "is_airport" BOOLEAN NOT NULL DEFAULT false,
    "airport_code" TEXT,
    "operating_hours" TEXT,
    "contact_phone" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "agencies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo_url" TEXT,
    "cover_image_url" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "website_url" TEXT,
    "license_number" TEXT,
    "primary_location_id" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "founded_year" INTEGER,
    "fleet_size" INTEGER NOT NULL DEFAULT 0,
    "languages" TEXT NOT NULL DEFAULT '["ar", "fr", "en"]',
    "commission_rate" REAL NOT NULL DEFAULT 10.00,
    "auto_confirm_bookings" BOOLEAN NOT NULL DEFAULT false,
    "cancellation_policy" TEXT,
    "terms_and_conditions" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "verification_documents" TEXT,
    "average_rating" REAL NOT NULL DEFAULT 0.00,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "agencies_primary_location_id_fkey" FOREIGN KEY ("primary_location_id") REFERENCES "locations" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "agency_locations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agency_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "services" TEXT NOT NULL DEFAULT '["pickup", "dropoff"]',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "agency_locations_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "agency_locations_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cars" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agency_id" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "color" TEXT,
    "license_plate" TEXT,
    "vin" TEXT,
    "category" TEXT NOT NULL,
    "body_type" TEXT,
    "seats" INTEGER NOT NULL,
    "doors" INTEGER NOT NULL,
    "luggage_capacity" INTEGER,
    "transmission" TEXT NOT NULL,
    "fuel_type" TEXT NOT NULL,
    "engine_size" TEXT,
    "fuel_capacity" INTEGER,
    "features" TEXT NOT NULL DEFAULT '[]',
    "base_price_per_day" REAL NOT NULL,
    "price_per_km" REAL NOT NULL DEFAULT 0.00,
    "free_km_per_day" INTEGER NOT NULL DEFAULT 0,
    "security_deposit" REAL NOT NULL,
    "minimum_age" INTEGER NOT NULL DEFAULT 21,
    "minimum_license_years" INTEGER NOT NULL DEFAULT 1,
    "basic_insurance_included" BOOLEAN NOT NULL DEFAULT true,
    "insurance_daily_cost" REAL NOT NULL DEFAULT 0.00,
    "status" TEXT NOT NULL DEFAULT 'available',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "last_service_date" DATETIME,
    "next_service_date" DATETIME,
    "mileage" INTEGER NOT NULL DEFAULT 0,
    "images" TEXT NOT NULL DEFAULT '[]',
    "main_image_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "cars_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "optional_extras" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agency_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price_per_day" REAL,
    "price_per_booking" REAL,
    "max_quantity" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "optional_extras_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "booking_reference" TEXT NOT NULL,
    "customer_id" TEXT,
    "agency_id" TEXT,
    "car_id" TEXT,
    "customer_name" TEXT NOT NULL,
    "customer_email" TEXT NOT NULL,
    "customer_phone" TEXT NOT NULL,
    "pickup_location_id" TEXT,
    "dropoff_location_id" TEXT,
    "pickup_datetime" DATETIME NOT NULL,
    "dropoff_datetime" DATETIME NOT NULL,
    "actual_pickup_datetime" DATETIME,
    "actual_dropoff_datetime" DATETIME,
    "base_price" REAL NOT NULL,
    "extras_price" REAL NOT NULL DEFAULT 0.00,
    "insurance_price" REAL NOT NULL DEFAULT 0.00,
    "tax_amount" REAL NOT NULL DEFAULT 0.00,
    "total_price" REAL NOT NULL,
    "security_deposit" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MAD',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "confirmation_code" TEXT,
    "special_requests" TEXT,
    "driving_license_info" TEXT,
    "payment_status" TEXT NOT NULL DEFAULT 'pending',
    "payment_method" TEXT,
    "payment_reference" TEXT,
    "paid_at" DATETIME,
    "cancelled_at" DATETIME,
    "cancelled_by_id" TEXT,
    "cancellation_reason" TEXT,
    "refund_amount" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "bookings_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "bookings_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "bookings_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "cars" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "bookings_pickup_location_id_fkey" FOREIGN KEY ("pickup_location_id") REFERENCES "locations" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "bookings_dropoff_location_id_fkey" FOREIGN KEY ("dropoff_location_id") REFERENCES "locations" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "bookings_cancelled_by_id_fkey" FOREIGN KEY ("cancelled_by_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "booking_extras" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "booking_id" TEXT NOT NULL,
    "extra_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" REAL NOT NULL,
    "total_price" REAL NOT NULL,
    CONSTRAINT "booking_extras_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "booking_extras_extra_id_fkey" FOREIGN KEY ("extra_id") REFERENCES "optional_extras" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "booking_id" TEXT NOT NULL,
    "customer_id" TEXT,
    "agency_id" TEXT NOT NULL,
    "car_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT,
    "cleanliness_rating" INTEGER,
    "service_rating" INTEGER,
    "value_rating" INTEGER,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "agency_response" TEXT,
    "agency_response_date" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reviews_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "reviews_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reviews_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "cars" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pricing_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agency_id" TEXT NOT NULL,
    "car_id" TEXT,
    "name" TEXT NOT NULL,
    "rule_type" TEXT NOT NULL,
    "start_date" DATETIME,
    "end_date" DATETIME,
    "min_rental_days" INTEGER,
    "max_rental_days" INTEGER,
    "days_of_week" TEXT,
    "adjustment_type" TEXT NOT NULL,
    "adjustment_value" REAL NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pricing_rules_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "pricing_rules_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "cars" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "related_booking_id" TEXT,
    "action_url" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "sentVia" TEXT NOT NULL DEFAULT '[]',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "notifications_related_booking_id_fkey" FOREIGN KEY ("related_booking_id") REFERENCES "bookings" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "agencies_slug_key" ON "agencies"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "agencies_license_number_key" ON "agencies"("license_number");

-- CreateIndex
CREATE UNIQUE INDEX "agency_locations_agency_id_location_id_key" ON "agency_locations"("agency_id", "location_id");

-- CreateIndex
CREATE UNIQUE INDEX "cars_license_plate_key" ON "cars"("license_plate");

-- CreateIndex
CREATE UNIQUE INDEX "cars_vin_key" ON "cars"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_booking_reference_key" ON "bookings"("booking_reference");

-- CreateIndex
CREATE UNIQUE INDEX "booking_extras_booking_id_extra_id_key" ON "booking_extras"("booking_id", "extra_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_booking_id_key" ON "reviews"("booking_id");
