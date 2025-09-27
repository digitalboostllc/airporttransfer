import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAgencyByUserId } from '@/lib/agency';

// GET - Get all cars (with optional agency filter)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const agencyId = url.searchParams.get('agencyId');
    const city = url.searchParams.get('city');
    const category = url.searchParams.get('category');
    const available = url.searchParams.get('available');
    const limit = url.searchParams.get('limit');

    let where: any = { isActive: true };

    // Filter by agency
    if (agencyId) {
      where.agencyId = agencyId;
    }

    // Filter by city/location
    if (city) {
      where.location = { contains: city, mode: 'insensitive' };
    }

    // Filter by category
    if (category) {
      where.category = category;
    }

    // Filter by availability
    if (available === 'true') {
      where.status = 'available';
    }

    const cars = await prisma.car.findMany({
      where,
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        _count: {
          select: { bookings: true }
        },
        reviews: {
          select: { rating: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : undefined
    });

    // Calculate average ratings
    const carsWithRatings = cars.map(car => {
      const averageRating = car.reviews.length > 0 
        ? car.reviews.reduce((sum, review) => sum + review.rating, 0) / car.reviews.length
        : 0;

      return {
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        category: car.category,
        pricePerDay: car.pricePerDay,
        images: car.images || [],
        features: car.features || [],
        specifications: car.specifications || {},
        location: car.location || '',
        status: car.status,
        isActive: car.isActive,
        totalBookings: car._count.bookings,
        averageRating: Math.round(averageRating * 10) / 10,
        agency: car.agency,
        createdAt: car.createdAt,
        updatedAt: car.updatedAt
      };
    });

    return NextResponse.json(carsWithRatings);
  } catch (error) {
    console.error('Get cars API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new car (agency only)
export async function POST(request: NextRequest) {
  try {
    // Get auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user has agency
    const agency = await getAgencyByUserId(payload.userId);
    if (!agency || agency.status !== 'approved') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const carData = await request.json();

    // Validate required fields
    const requiredFields = ['make', 'model', 'year', 'category', 'pricePerDay'];
    for (const field of requiredFields) {
      if (!carData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Create the car
    const car = await prisma.car.create({
      data: {
        agencyId: agency.id,
        make: carData.make,
        model: carData.model,
        year: parseInt(carData.year),
        category: carData.category,
        pricePerDay: parseFloat(carData.pricePerDay),
        images: carData.images || [],
        features: carData.features || [],
        specifications: carData.specifications || {},
        location: carData.location || agency.city,
        description: carData.description || '',
        status: 'available',
        isActive: true
      },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      car: {
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        category: car.category,
        pricePerDay: car.pricePerDay,
        images: car.images || [],
        features: car.features || [],
        specifications: car.specifications || {},
        location: car.location || '',
        description: car.description || '',
        status: car.status,
        isActive: car.isActive,
        agency: car.agency,
        createdAt: car.createdAt,
        updatedAt: car.updatedAt
      }
    });
  } catch (error) {
    console.error('Create car API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
