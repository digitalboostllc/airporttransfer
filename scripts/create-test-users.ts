import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUsers() {
  console.log('🔍 Checking current users...');
  
  // Check existing users
  const existingUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      fullName: true
    }
  });

  console.log('📊 Current users:', existingUsers);

  const testUsers = [
    {
      email: 'customer@example.com',
      password: 'password123',
      fullName: 'John Customer',
      phone: '+212 6XX XX XX XX',
      role: 'customer' as const
    },
    {
      email: 'agency@atlasrent.ma',
      password: 'password123',
      fullName: 'Atlas Rent Agency',
      phone: '+212 5XX XX XX XX',
      role: 'agency_owner' as const
    },
    {
      email: 'admin@carrental.ma',
      password: 'password123',
      fullName: 'System Administrator',
      phone: '+212 5XX XX XX XX',
      role: 'admin' as const
    }
  ];

  console.log('\n🚀 Creating test users...');

  for (const userData of testUsers) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      console.log(`⚠️  User ${userData.email} already exists with role: ${existingUser.role}`);
      
      // Update role if different
      if (existingUser.role !== userData.role) {
        await prisma.user.update({
          where: { email: userData.email },
          data: { role: userData.role }
        });
        console.log(`✅ Updated ${userData.email} role to: ${userData.role}`);
      }
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create user
      const newUser = await prisma.user.create({
        data: {
          email: userData.email,
          passwordHash: hashedPassword,
          fullName: userData.fullName,
          phone: userData.phone,
          role: userData.role,
          emailVerified: true
        }
      });

      console.log(`✅ Created ${userData.role}: ${userData.email}`);

      // If it's an agency owner, create the agency
      if (userData.role === 'agency_owner') {
        const existingAgency = await prisma.agency.findFirst({
          where: { user: { id: newUser.id } }
        });

        if (!existingAgency) {
          const newAgency = await prisma.agency.create({
            data: {
              name: 'Atlas Rent',
              slug: 'atlas-rent',
              email: userData.email,
              phone: userData.phone,
              address: '123 Mohammed V Avenue, Casablanca',
              city: 'Casablanca',
              description: 'Premium car rental service in Morocco with modern fleet and excellent customer service.',
              status: 'approved',
              licenseNumber: 'LIC-2024-001'
            }
          });

          // Link the user to the agency
          await prisma.user.update({
            where: { id: newUser.id },
            data: { agencyId: newAgency.id }
          });

          console.log(`✅ Created agency for: ${userData.email}`);
        }
      }
    }
  }

  console.log('\n🎉 Test users setup complete!');
  console.log('\n📋 You can now test with:');
  console.log('👤 Customer: customer@example.com / password123');
  console.log('🏢 Agency: agency@atlasrent.ma / password123');
  console.log('👨‍💼 Admin: admin@carrental.ma / password123');
}

async function main() {
  try {
    await createTestUsers();
  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();