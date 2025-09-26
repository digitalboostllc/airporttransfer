#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUsers() {
  console.log('👥 Creating test users for workflow testing...\n');

  try {
    // Hash passwords
    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Create Admin User
    console.log('🔑 Creating Admin User...');
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@carrental.ma' },
      update: {},
      create: {
        email: 'admin@carrental.ma',
        passwordHash: passwordHash,
        fullName: 'System Administrator',
        phone: '+212600000001',
        role: 'admin',
        emailVerified: true,
        isActive: true,
      },
    });
    console.log(`✅ Admin created: ${adminUser.email} (ID: ${adminUser.id})`);

    // 2. Create Customer User
    console.log('👤 Creating Customer User...');
    const customerUser = await prisma.user.upsert({
      where: { email: 'customer@example.com' },
      update: {},
      create: {
        email: 'customer@example.com',
        passwordHash: passwordHash,
        fullName: 'Ahmed Hassan',
        phone: '+212600000002',
        role: 'customer',
        dateOfBirth: new Date('1990-01-15'),
        drivingLicenseNumber: 'DL123456789',
        drivingLicenseExpiry: new Date('2026-12-31'),
        emailVerified: true,
        isActive: true,
      },
    });
    console.log(`✅ Customer created: ${customerUser.email} (ID: ${customerUser.id})`);

    // 3. Create Agency User (Approved)
    console.log('🏢 Creating Approved Agency User...');
    const approvedAgencyUser = await prisma.user.upsert({
      where: { email: 'agency@atlasrent.ma' },
      update: {},
      create: {
        email: 'agency@atlasrent.ma',
        passwordHash: passwordHash,
        fullName: 'Youssef Atlas',
        phone: '+212600000003',
        role: 'agency_owner',
        emailVerified: true,
        isActive: true,
      },
    });

    // Check if agency exists, create if not
    let approvedAgency = await prisma.agency.findFirst({
      where: { email: 'agency@atlasrent.ma' }
    });

    if (!approvedAgency) {
      approvedAgency = await prisma.agency.create({
        data: {
          name: 'Atlas Rent Car',
          slug: 'atlas-rent-car-test',
          email: 'agency@atlasrent.ma',
          phone: '+212600000003',
          address: '123 Hassan II Avenue',
          city: 'Casablanca',
          description: 'Premium car rental service in Morocco',
          status: 'approved',
          approvedAt: new Date(),
          isActive: true,
          isVerified: true,
        },
      });
    }

    // Link user to agency
    await prisma.user.update({
      where: { id: approvedAgencyUser.id },
      data: { agencyId: approvedAgency.id },
    });

    console.log(`✅ Approved Agency created: ${approvedAgencyUser.email} (Agency: ${approvedAgency.name})`);

    // 4. Create Pending Agency User
    console.log('⏳ Creating Pending Agency User...');
    const pendingAgencyUser = await prisma.user.upsert({
      where: { email: 'pending@newagency.ma' },
      update: {},
      create: {
        email: 'pending@newagency.ma',
        passwordHash: passwordHash,
        fullName: 'Sara Morocco',
        phone: '+212600000004',
        role: 'agency_owner',
        emailVerified: true,
        isActive: true,
      },
    });

    // Check if pending agency exists, create if not
    let pendingAgency = await prisma.agency.findFirst({
      where: { email: 'pending@newagency.ma' }
    });

    if (!pendingAgency) {
      pendingAgency = await prisma.agency.create({
        data: {
          name: 'Morocco Car Rentals',
          slug: 'morocco-car-rentals-test',
          email: 'pending@newagency.ma',
          phone: '+212600000004',
          address: '456 Mohammed V Street',
          city: 'Rabat',
          description: 'New agency awaiting approval to join the platform',
          status: 'pending', // This will require admin approval
          isActive: true,
        },
      });
    }

    // Link user to agency
    await prisma.user.update({
      where: { id: pendingAgencyUser.id },
      data: { agencyId: pendingAgency.id },
    });

    console.log(`✅ Pending Agency created: ${pendingAgencyUser.email} (Agency: ${pendingAgency.name})`);

    console.log('\n🎉 Test users created successfully!\n');

    // Display login credentials
    console.log('🔐 TEST LOGIN CREDENTIALS:');
    console.log('=' .repeat(50));
    console.log('👨‍💼 ADMIN PANEL ACCESS:');
    console.log('   Email: admin@carrental.ma');
    console.log('   Password: password123');
    console.log('   Access: http://localhost:3000/admin/dashboard');
    console.log('');
    console.log('👤 CUSTOMER ACCESS:');
    console.log('   Email: customer@example.com');
    console.log('   Password: password123');
    console.log('   Access: http://localhost:3000/profile');
    console.log('');
    console.log('🏢 APPROVED AGENCY ACCESS:');
    console.log('   Email: agency@atlasrent.ma');
    console.log('   Password: password123');
    console.log('   Access: http://localhost:3000/agency/dashboard');
    console.log('');
    console.log('⏳ PENDING AGENCY (for admin approval):');
    console.log('   Email: pending@newagency.ma');
    console.log('   Password: password123');
    console.log('   Status: Awaits admin approval');
    console.log('=' .repeat(50));

    console.log('\n🧪 TESTING WORKFLOWS:');
    console.log('1. Login as admin → Approve pending agency');
    console.log('2. Login as customer → Browse cars → Make booking');
    console.log('3. Login as agency → Add cars → Manage bookings');
    console.log('4. Test email notifications (check console)');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();
