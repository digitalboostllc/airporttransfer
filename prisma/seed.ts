// ============================================================================
// Prisma Seed File
// ============================================================================
// This file populates the local database with sample data for development
// ============================================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create sample locations
  console.log('📍 Creating locations...');
  const cmnAirport = await prisma.location.create({
    data: {
      name: 'Mohammed V International Airport',
      address: 'Mohammed V International Airport, Terminal 1',
      city: 'Casablanca',
      country: 'Morocco',
      postalCode: '20000',
      latitude: 33.3675,
      longitude: -7.5898,
      isAirport: true,
      airportCode: 'CMN',
      operatingHours: JSON.stringify({
        monday: { open: '06:00', close: '23:00' },
        tuesday: { open: '06:00', close: '23:00' },
        wednesday: { open: '06:00', close: '23:00' },
        thursday: { open: '06:00', close: '23:00' },
        friday: { open: '06:00', close: '23:00' },
        saturday: { open: '06:00', close: '23:00' },
        sunday: { open: '06:00', close: '23:00' }
      }),
      contactPhone: '+212 5 22 53 90 40',
    },
  });

  const rakAirport = await prisma.location.create({
    data: {
      name: 'Marrakech Menara Airport',
      address: 'Marrakech Menara Airport',
      city: 'Marrakech',
      country: 'Morocco',
      postalCode: '40000',
      latitude: 31.6069,
      longitude: -8.0363,
      isAirport: true,
      airportCode: 'RAK',
      operatingHours: JSON.stringify({
        monday: { open: '06:00', close: '23:00' },
        tuesday: { open: '06:00', close: '23:00' },
        wednesday: { open: '06:00', close: '23:00' },
        thursday: { open: '06:00', close: '23:00' },
        friday: { open: '06:00', close: '23:00' },
        saturday: { open: '06:00', close: '23:00' },
        sunday: { open: '06:00', close: '23:00' }
      }),
      contactPhone: '+212 5 24 44 79 10',
    },
  });

  const casablancaCenter = await prisma.location.create({
    data: {
      name: 'Casablanca City Center',
      address: 'Avenue Hassan II, Centre Ville',
      city: 'Casablanca',
      country: 'Morocco',
      postalCode: '20000',
      latitude: 33.5935,
      longitude: -7.6184,
      isAirport: false,
      operatingHours: JSON.stringify({
        monday: { open: '08:00', close: '20:00' },
        tuesday: { open: '08:00', close: '20:00' },
        wednesday: { open: '08:00', close: '20:00' },
        thursday: { open: '08:00', close: '20:00' },
        friday: { open: '08:00', close: '20:00' },
        saturday: { open: '08:00', close: '18:00' },
        sunday: { closed: true }
      }),
      contactPhone: '+212 5 22 26 75 30',
    },
  });

  // Create sample agencies
  console.log('🏢 Creating agencies...');
  const eurocarAgency = await prisma.agency.create({
    data: {
      name: 'EuroCar Morocco',
      slug: 'eurocar-morocco',
      description: 'Leading car rental company in Morocco with over 20 years of experience. We offer a wide range of vehicles from economy cars to luxury SUVs, serving all major airports and cities across Morocco.',
      logoUrl: '/logos/eurocar-logo.png',
      email: 'info@eurocar-morocco.ma',
      phone: '+212 5 22 33 44 55',
      websiteUrl: 'https://eurocar-morocco.ma',
      licenseNumber: 'LIC-EURO-2019-001',
      primaryLocationId: cmnAirport.id,
      address: 'Mohammed V International Airport, Terminal 1',
      city: 'Casablanca',
      foundedYear: 2003,
      fleetSize: 12,
      commissionRate: 8.50,
      isVerified: true,
      isActive: true,
      averageRating: 4.5,
      totalReviews: 234,
    },
  });

  const atlasAgency = await prisma.agency.create({
    data: {
      name: 'Atlas Rent Car',
      slug: 'atlas-rent-car',
      description: 'Premium car rental service focusing on quality vehicles and exceptional customer service. Specializing in business and leisure travel with modern fleet and 24/7 support.',
      logoUrl: '/logos/atlas-logo.png',
      email: 'reservations@atlasrentcar.ma',
      phone: '+212 5 24 44 88 99',
      websiteUrl: 'https://atlasrentcar.ma',
      licenseNumber: 'LIC-ATLAS-2020-002',
      primaryLocationId: rakAirport.id,
      address: 'Marrakech Menara Airport, Arrival Hall',
      city: 'Marrakech',
      foundedYear: 2010,
      fleetSize: 8,
      commissionRate: 9.00,
      isVerified: true,
      isActive: true,
      averageRating: 4.7,
      totalReviews: 189,
    },
  });

  const premiumAgency = await prisma.agency.create({
    data: {
      name: 'Premium Car Rental',
      slug: 'premium-car-rental',
      description: 'Luxury and executive car rental service for discerning clients. Our fleet includes the latest Mercedes-Benz, BMW, and Audi models with personalized service and chauffeur options.',
      logoUrl: '/logos/premium-logo.png',
      email: 'luxury@premiumcarrental.ma',
      phone: '+212 5 22 95 76 84',
      websiteUrl: 'https://premiumcarrental.ma',
      licenseNumber: 'LIC-PREM-2018-003',
      primaryLocationId: casablancaCenter.id,
      address: 'Boulevard Zerktouni, Twin Center',
      city: 'Casablanca',
      foundedYear: 2018,
      fleetSize: 3,
      commissionRate: 12.00,
      isVerified: true,
      isActive: true,
      averageRating: 4.9,
      totalReviews: 156,
    },
  });

  // Create sample optional extras
  console.log('🎯 Creating optional extras...');
  await prisma.optionalExtra.createMany({
    data: [
      // EuroCar Morocco extras
      {
        agencyId: eurocarAgency.id,
        name: 'Additional Driver',
        description: 'Add an extra authorized driver to your rental',
        pricePerDay: 50.00,
        maxQuantity: 3,
      },
      {
        agencyId: eurocarAgency.id,
        name: 'GPS Navigation Device',
        description: 'Garmin GPS with Morocco maps and POIs',
        pricePerDay: 30.00,
        maxQuantity: 1,
      },
      {
        agencyId: eurocarAgency.id,
        name: 'Child Safety Seat (0-4 years)',
        description: 'Safety-certified child seat for infants and toddlers',
        pricePerDay: 25.00,
        maxQuantity: 3,
      },
      {
        agencyId: eurocarAgency.id,
        name: 'Full Coverage Insurance',
        description: 'Zero deductible comprehensive insurance coverage',
        pricePerDay: 80.00,
        maxQuantity: 1,
      },

      // Atlas Rent Car extras
      {
        agencyId: atlasAgency.id,
        name: 'Additional Driver',
        description: 'Add an extra authorized driver to your rental',
        pricePerDay: 45.00,
        maxQuantity: 3,
      },
      {
        agencyId: atlasAgency.id,
        name: 'Premium GPS System',
        description: 'Touch screen GPS with traffic updates',
        pricePerDay: 35.00,
        maxQuantity: 1,
      },
      {
        agencyId: atlasAgency.id,
        name: 'Full Insurance Plus',
        description: 'Comprehensive coverage with roadside assistance',
        pricePerDay: 90.00,
        maxQuantity: 1,
      },

      // Premium Car Rental extras
      {
        agencyId: premiumAgency.id,
        name: 'Professional Chauffeur',
        description: 'Experienced professional driver service',
        pricePerDay: 200.00,
        maxQuantity: 1,
      },
      {
        agencyId: premiumAgency.id,
        name: 'Airport VIP Meet & Greet',
        description: 'Personal assistant at airport arrival',
        pricePerBooking: 150.00,
        maxQuantity: 1,
      },
      {
        agencyId: premiumAgency.id,
        name: 'Vehicle Delivery',
        description: 'Car delivered to your location',
        pricePerBooking: 80.00,
        maxQuantity: 1,
      },
    ],
  });

  // Create sample cars
  console.log('🚗 Creating cars...');
  const cars = await prisma.car.createMany({
    data: [
      // EuroCar Morocco fleet
      {
        agencyId: eurocarAgency.id,
        make: 'Renault',
        model: 'Clio',
        year: 2023,
        color: 'White',
        licensePlate: '12345-A-20',
        category: 'economy',
        bodyType: 'Hatchback',
        seats: 5,
        doors: 4,
        luggageCapacity: 2,
        transmission: 'manual',
        fuelType: 'petrol',
        engineSize: '1.0L',
        fuelCapacity: 45,
        features: JSON.stringify(['GPS Navigation', 'Bluetooth', 'USB Charging', 'Power Steering', 'Central Locking', 'Electric Windows', 'Radio/CD Player', 'Safety Airbags']),
        basePricePerDay: 180.00,
        freeKmPerDay: 300,
        securityDeposit: 2000.00,
        minimumAge: 23,
        images: JSON.stringify(['/cars/renault-clio-1.jpg', '/cars/renault-clio-2.jpg', '/cars/renault-clio-3.jpg']),
        mainImageUrl: '/cars/renault-clio-1.jpg',
      },
      {
        agencyId: eurocarAgency.id,
        make: 'Peugeot',
        model: '208',
        year: 2024,
        color: 'Silver',
        licensePlate: '12346-A-20',
        category: 'economy',
        bodyType: 'Hatchback',
        seats: 5,
        doors: 4,
        luggageCapacity: 2,
        transmission: 'automatic',
        fuelType: 'petrol',
        engineSize: '1.2L',
        fuelCapacity: 50,
        features: JSON.stringify(['GPS Navigation', 'Bluetooth', 'Cruise Control', 'Parking Sensors', 'Climate Control', 'Keyless Entry', 'LED Headlights']),
        basePricePerDay: 200.00,
        freeKmPerDay: 300,
        securityDeposit: 2200.00,
        minimumAge: 23,
        images: JSON.stringify(['/cars/peugeot-208-1.jpg', '/cars/peugeot-208-2.jpg']),
        mainImageUrl: '/cars/peugeot-208-1.jpg',
      },
      {
        agencyId: eurocarAgency.id,
        make: 'Volkswagen',
        model: 'Golf',
        year: 2024,
        color: 'Blue',
        licensePlate: '12347-A-20',
        category: 'compact',
        bodyType: 'Hatchback',
        seats: 5,
        doors: 4,
        luggageCapacity: 3,
        transmission: 'automatic',
        fuelType: 'petrol',
        engineSize: '1.4T',
        fuelCapacity: 55,
        features: JSON.stringify(['GPS Navigation', 'Bluetooth', 'Cruise Control', 'Parking Sensors', 'Premium Audio', 'Heated Seats', 'Keyless Entry']),
        basePricePerDay: 240.00,
        freeKmPerDay: 0,
        securityDeposit: 2500.00,
        minimumAge: 25,
        images: JSON.stringify(['/cars/volkswagen-golf-1.jpg']),
        mainImageUrl: '/cars/volkswagen-golf-1.jpg',
      },

      // Atlas Rent Car fleet
      {
        agencyId: atlasAgency.id,
        make: 'Toyota',
        model: 'RAV4',
        year: 2024,
        color: 'Black',
        licensePlate: '22345-B-20',
        category: 'suv',
        bodyType: 'SUV',
        seats: 5,
        doors: 5,
        luggageCapacity: 4,
        transmission: 'automatic',
        fuelType: 'hybrid',
        engineSize: '2.5L Hybrid',
        fuelCapacity: 55,
        features: JSON.stringify(['GPS Navigation', 'Bluetooth', 'AWD', '360° Camera', 'Heated Seats', 'Wireless Charging', 'Toyota Safety Sense']),
        basePricePerDay: 320.00,
        freeKmPerDay: 0,
        securityDeposit: 3500.00,
        minimumAge: 25,
        images: JSON.stringify(['/cars/toyota-rav4-1.jpg', '/cars/toyota-rav4-2.jpg']),
        mainImageUrl: '/cars/toyota-rav4-1.jpg',
      },
      {
        agencyId: atlasAgency.id,
        make: 'Nissan',
        model: 'Qashqai',
        year: 2023,
        color: 'Red',
        licensePlate: '22346-B-20',
        category: 'suv',
        bodyType: 'Crossover',
        seats: 5,
        doors: 5,
        luggageCapacity: 4,
        transmission: 'automatic',
        fuelType: 'petrol',
        engineSize: '1.6T',
        fuelCapacity: 60,
        features: JSON.stringify(['GPS Navigation', 'Bluetooth', 'Reverse Camera', 'Keyless Entry', 'Hill Start Assist', 'Intelligent Emergency Braking']),
        basePricePerDay: 290.00,
        freeKmPerDay: 0,
        securityDeposit: 3000.00,
        minimumAge: 25,
        images: JSON.stringify(['/cars/nissan-qashqai-1.jpg']),
        mainImageUrl: '/cars/nissan-qashqai-1.jpg',
      },

      // Premium Car Rental fleet
      {
        agencyId: premiumAgency.id,
        make: 'Mercedes-Benz',
        model: 'A-Class',
        year: 2024,
        color: 'Metallic Grey',
        licensePlate: '32345-C-20',
        category: 'luxury',
        bodyType: 'Sedan',
        seats: 5,
        doors: 4,
        luggageCapacity: 3,
        transmission: 'automatic',
        fuelType: 'petrol',
        engineSize: '2.0T',
        fuelCapacity: 62,
        features: JSON.stringify(['MBUX Infotainment', 'GPS Navigation', 'Bluetooth', 'Leather Seats', 'Premium Sound', 'Keyless Entry', 'LED Headlights', 'Ambient Lighting']),
        basePricePerDay: 380.00,
        freeKmPerDay: 0,
        securityDeposit: 5000.00,
        minimumAge: 25,
        images: JSON.stringify(['/cars/mercedes-a-class-1.jpg', '/cars/mercedes-a-class-2.jpg']),
        mainImageUrl: '/cars/mercedes-a-class-1.jpg',
      },
      {
        agencyId: premiumAgency.id,
        make: 'BMW',
        model: '3 Series',
        year: 2024,
        color: 'Jet Black',
        licensePlate: '32346-C-20',
        category: 'luxury',
        bodyType: 'Sedan',
        seats: 5,
        doors: 4,
        luggageCapacity: 3,
        transmission: 'automatic',
        fuelType: 'petrol',
        engineSize: '2.0T',
        fuelCapacity: 59,
        features: JSON.stringify(['iDrive System', 'GPS Navigation', 'Bluetooth', 'Leather Seats', 'Premium Sound', 'Keyless Entry', 'LED Headlights', 'Sunroof', 'Sport Mode']),
        basePricePerDay: 450.00,
        freeKmPerDay: 0,
        securityDeposit: 6000.00,
        minimumAge: 25,
        images: JSON.stringify(['/cars/bmw-3-series-1.jpg']),
        mainImageUrl: '/cars/bmw-3-series-1.jpg',
      },
      {
        agencyId: premiumAgency.id,
        make: 'Audi',
        model: 'A4',
        year: 2024,
        color: 'Glacier White',
        licensePlate: '32347-C-20',
        category: 'luxury',
        bodyType: 'Sedan',
        seats: 5,
        doors: 4,
        luggageCapacity: 3,
        transmission: 'automatic',
        fuelType: 'petrol',
        engineSize: '2.0T TFSI',
        fuelCapacity: 58,
        features: JSON.stringify(['Virtual Cockpit', 'GPS Navigation', 'Bluetooth', 'Leather Seats', 'Premium Sound', 'Matrix LED', 'Keyless Entry', 'Quattro AWD']),
        basePricePerDay: 420.00,
        freeKmPerDay: 0,
        securityDeposit: 5500.00,
        minimumAge: 25,
        images: JSON.stringify(['/cars/audi-a4-1.jpg']),
        mainImageUrl: '/cars/audi-a4-1.jpg',
      },
    ],
  });

  // Create sample users
  console.log('👥 Creating sample users...');
  const sampleUser = await prisma.user.create({
    data: {
      email: 'ahmed.hassan@email.com',
      phone: '+212661234567',
      fullName: 'Ahmed Hassan',
      role: 'customer',
      dateOfBirth: new Date('1985-03-15'),
      drivingLicenseNumber: 'DL123456789',
      preferredLanguage: 'ar',
      emailVerified: true,
    },
  });

  // Create sample pricing rules
  console.log('💰 Creating pricing rules...');
  await prisma.pricingRule.createMany({
    data: [
      {
        agencyId: eurocarAgency.id,
        name: 'Summer High Season',
        ruleType: 'seasonal',
        startDate: new Date('2024-06-15'),
        endDate: new Date('2024-09-15'),
        minRentalDays: 1,
        adjustmentType: 'percentage',
        adjustmentValue: 25.00,
        isActive: true,
        priority: 10,
      },
      {
        agencyId: atlasAgency.id,
        name: 'Weekly Discount',
        ruleType: 'promotional',
        minRentalDays: 7,
        adjustmentType: 'percentage',
        adjustmentValue: -10.00,
        isActive: true,
        priority: 5,
      },
    ],
  });

  // Update agency fleet sizes
  console.log('📊 Updating agency fleet sizes...');
  const eurocarCarCount = await prisma.car.count({ where: { agencyId: eurocarAgency.id } });
  const atlasCarCount = await prisma.car.count({ where: { agencyId: atlasAgency.id } });
  const premiumCarCount = await prisma.car.count({ where: { agencyId: premiumAgency.id } });

  await prisma.agency.update({
    where: { id: eurocarAgency.id },
    data: { fleetSize: eurocarCarCount },
  });

  await prisma.agency.update({
    where: { id: atlasAgency.id },
    data: { fleetSize: atlasCarCount },
  });

  await prisma.agency.update({
    where: { id: premiumAgency.id },
    data: { fleetSize: premiumCarCount },
  });

  console.log('✅ Database seeding completed successfully!');
  console.log(`📍 Created ${await prisma.location.count()} locations`);
  console.log(`🏢 Created ${await prisma.agency.count()} agencies`);
  console.log(`🚗 Created ${await prisma.car.count()} cars`);
  console.log(`🎯 Created ${await prisma.optionalExtra.count()} optional extras`);
  console.log(`💰 Created ${await prisma.pricingRule.count()} pricing rules`);
  console.log(`👥 Created ${await prisma.user.count()} users`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
