import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token and check admin role
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
        userId: string;
        role: string;
      };
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get platform statistics
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalAgencies,
      totalCars,
      totalBookings,
      totalRevenue,
      monthlyRevenue,
      activeUsers,
      pendingAgencies
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'agency_owner' } }),
      prisma.car.count(),
      prisma.booking.count(),
      prisma.booking.aggregate({
        where: { status: { in: ['confirmed', 'completed'] } },
        _sum: { totalPrice: true }
      }),
      prisma.booking.aggregate({
        where: { 
          status: { in: ['confirmed', 'completed'] },
          createdAt: { gte: startOfMonth }
        },
        _sum: { totalPrice: true }
      }),
      prisma.user.count({
        where: { 
          lastLoginAt: { gte: thirtyDaysAgo }
        }
      }),
      prisma.agency.count({
        where: { status: 'pending' }
      })
    ]);

    const stats = {
      totalUsers,
      totalAgencies,
      totalCars,
      totalBookings,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      monthlyRevenue: monthlyRevenue._sum.totalPrice || 0,
      activeUsers,
      pendingAgencies
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Get platform stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get platform statistics' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
