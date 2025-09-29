import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyTestSetup() {
  console.log('🔍 Verifying test setup...\n');

  // Check agency owner and their agency
  const agencyOwner = await prisma.user.findUnique({
    where: { email: 'agency@atlasrent.ma' },
    include: {
      agency: true
    }
  });

  if (agencyOwner) {
    console.log('🏢 Agency Owner Found:');
    console.log(`   Email: ${agencyOwner.email}`);
    console.log(`   Name: ${agencyOwner.fullName}`);
    console.log(`   Role: ${agencyOwner.role}`);
    
    if (agencyOwner.agency) {
      console.log('✅ Agency Associated:');
      console.log(`   Agency Name: ${agencyOwner.agency.name}`);
      console.log(`   Status: ${agencyOwner.agency.status}`);
      console.log(`   City: ${agencyOwner.agency.city}`);
    } else {
      console.log('❌ No agency found for agency owner');
    }
  }

  // Check all test users
  console.log('\n📋 All Test Users:');
  const testEmails = ['customer@example.com', 'agency@atlasrent.ma', 'admin@carrental.ma'];
  
  for (const email of testEmails) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        email: true,
        fullName: true,
        role: true,
        emailVerified: true
      }
    });
    
    if (user) {
      console.log(`✅ ${user.role.toUpperCase()}: ${email} (${user.fullName})`);
    } else {
      console.log(`❌ MISSING: ${email}`);
    }
  }

  console.log('\n🎯 Ready to test role-based authentication!');
}

async function main() {
  try {
    await verifyTestSetup();
  } catch (error) {
    console.error('❌ Error verifying setup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
