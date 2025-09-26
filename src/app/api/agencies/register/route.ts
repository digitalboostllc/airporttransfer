import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from '@/lib/notifications';

const prisma = new PrismaClient();

export interface AgencyRegistrationData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  licenseNumber?: string;
  description?: string;
  websiteUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, agencyData }: { userId: string; agencyData: AgencyRegistrationData } = await request.json();

    // Validate required fields
    if (!userId || !agencyData.name || !agencyData.email || !agencyData.address || !agencyData.city || !agencyData.description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate slug from agency name
    const slug = agencyData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Check if slug already exists
    const existingAgency = await prisma.agency.findUnique({
      where: { slug }
    });

    if (existingAgency) {
      return NextResponse.json(
        { error: 'Agency name already taken' },
        { status: 400 }
      );
    }

    // Create the agency
    const agency = await prisma.agency.create({
      data: {
        name: agencyData.name,
        slug,
        email: agencyData.email,
        phone: agencyData.phone,
        address: agencyData.address,
        city: agencyData.city,
        licenseNumber: agencyData.licenseNumber,
        description: agencyData.description,
        websiteUrl: agencyData.websiteUrl,
        status: 'pending'
      }
    });

    // Link user to agency
    await prisma.user.update({
      where: { id: userId },
      data: { 
        agencyId: agency.id,
        role: 'agency_owner'
      }
    });

    // Send admin notification about new agency registration
    try {
      const template = {
        to: 'admin@carrental.ma',
        subject: `New Agency Registration - ${agencyData.name}`,
        html: `
          <h2>New Agency Registration</h2>
          <p><strong>Agency:</strong> ${agencyData.name}</p>
          <p><strong>Email:</strong> ${agencyData.email}</p>
          <p><strong>Phone:</strong> ${agencyData.phone}</p>
          <p><strong>Address:</strong> ${agencyData.address}, ${agencyData.city}</p>
          <p><strong>Description:</strong> ${agencyData.description}</p>
          ${agencyData.licenseNumber ? `<p><strong>License:</strong> ${agencyData.licenseNumber}</p>` : ''}
          ${agencyData.websiteUrl ? `<p><strong>Website:</strong> ${agencyData.websiteUrl}</p>` : ''}
          <p>Please review this registration in the admin panel.</p>
        `,
        text: `New Agency Registration: ${agencyData.name}. Please review in admin panel.`
      };

      await sendEmail(template);
      console.log('✅ Admin notification sent for new agency registration:', agencyData.name);
    } catch (emailError) {
      console.error('❌ Failed to send admin notification:', emailError);
      // Don't fail the registration if email fails
    }

    return NextResponse.json({
      success: true,
      agencyId: agency.id
    });

  } catch (error) {
    console.error('Agency registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register agency' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

