import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
        userId: string;
        email: string;
        role: string;
        agencyId?: string;
      };
    } catch (_error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { name, phone, dateOfBirth, drivingLicenseNumber, drivingLicenseExpiry } = await request.json();

    // Update user profile
    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        fullName: name,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        drivingLicenseNumber,
        drivingLicenseExpiry: drivingLicenseExpiry ? new Date(drivingLicenseExpiry) : undefined,
        updatedAt: new Date()
      }
    });

    // Return updated user data (without password)
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.fullName,
      phone: user.phone,
      role: user.role,
      agencyId: user.agencyId,
      createdAt: user.createdAt
    };

    return NextResponse.json({ user: userResponse });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

