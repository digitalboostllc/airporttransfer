import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAgencyByUserId } from '@/lib/agency';

// GET - Get car by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const car = await prisma.car.findUnique({
      where: { id },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            slug: true,
            email: true,
            phone: true,
          }
        },
        _count: {
          select: { bookings: true }
        },
        reviews: {
          include: {
            customer: {
              select: {
                fullName: true,
                avatarUrl: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        bookings: {
          where: { status: { in: ['confirmed', 'completed'] } },
          select: { totalPrice: true }
        }
      }
    });

    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    // Calculate stats
    const averageRating = car.reviews.length > 0 
      ? car.reviews.reduce((sum, review) => sum + review.rating, 0) / car.reviews.length
      : 0;
    
    const totalRevenue = car.bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

    const carWithStats = {
      id: car.id,
      make: car.make,
      model: car.model,
      year: car.year,
      category: car.category,
      pricePerDay: car.basePricePerDay,
      images: car.images || [],
      features: car.features || [],
      specifications: {
        engine: car.engineSize || '',
        transmission: car.transmission,
        fuelType: car.fuelType,
        seats: car.seats,
        luggage: car.luggageCapacity || 0,
        doors: car.doors,
        airConditioning: true, // Default
        insurance: car.basicInsuranceIncluded ? 'Basic included' : 'Not included',
        mileage: car.mileage.toString(),
        minimumAge: `${car.minimumAge} years`,
        drivingLicense: `Valid for ${car.minimumLicenseYears}+ years`,
        deposit: `${car.securityDeposit} MAD`,
      },
      location: '', // Not stored in current schema
      description: '', // Not stored in current schema
      status: car.status,
      isActive: car.status === 'available',
      totalBookings: car._count.bookings,
      totalRevenue,
      averageRating: Math.round(averageRating * 10) / 10,
      agency: car.agency,
      reviews: car.reviews,
      createdAt: car.createdAt,
      updatedAt: car.updatedAt
    };

    return NextResponse.json(carWithStats);
  } catch (error) {
    console.error('Get car API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update car (agency owner only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: carId } = await params;
    
    // Check if car belongs to this agency
    const existingCar = await prisma.car.findFirst({
      where: { 
        id: carId,
        agencyId: agency.id
      }
    });

    if (!existingCar) {
      return NextResponse.json({ error: 'Car not found or access denied' }, { status: 404 });
    }

    const carData = await request.json();

    // Update the car
    const updatedCar = await prisma.car.update({
      where: { id: carId },
      data: {
        make: carData.make || existingCar.make,
        model: carData.model || existingCar.model,
        year: carData.year ? parseInt(carData.year) : existingCar.year,
        category: carData.category || existingCar.category,
        basePricePerDay: carData.pricePerDay ? parseFloat(carData.pricePerDay) : existingCar.basePricePerDay,
        images: carData.images !== undefined ? carData.images : existingCar.images,
        features: carData.features !== undefined ? carData.features : existingCar.features,
        // specifications, location, description not in current schema
        status: carData.status || existingCar.status,
        // isActive is derived from status, not a separate field
        updatedAt: new Date()
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
        id: updatedCar.id,
        make: updatedCar.make,
        model: updatedCar.model,
        year: updatedCar.year,
        category: updatedCar.category,
        pricePerDay: updatedCar.basePricePerDay,
        images: updatedCar.images || [],
        features: updatedCar.features || [],
        specifications: {
          engine: updatedCar.engineSize || '',
          transmission: updatedCar.transmission,
          fuelType: updatedCar.fuelType,
          seats: updatedCar.seats,
          luggage: updatedCar.luggageCapacity || 0,
          doors: updatedCar.doors,
          airConditioning: true,
          insurance: updatedCar.basicInsuranceIncluded ? 'Basic included' : 'Not included',
          mileage: updatedCar.mileage.toString(),
          minimumAge: `${updatedCar.minimumAge} years`,
          drivingLicense: `Valid for ${updatedCar.minimumLicenseYears}+ years`,
          deposit: `${updatedCar.securityDeposit} MAD`,
        },
        location: '', // Not in current schema
        description: '', // Not in current schema
        status: updatedCar.status,
        isActive: updatedCar.status === 'available',
        agency: updatedCar.agency,
        createdAt: updatedCar.createdAt,
        updatedAt: updatedCar.updatedAt
      }
    });
  } catch (error) {
    console.error('Update car API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete car (agency owner only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: carId } = await params;

    // Check if car belongs to this agency
    const existingCar = await prisma.car.findFirst({
      where: { 
        id: carId,
        agencyId: agency.id
      },
      include: {
        _count: {
          select: { 
            bookings: {
              where: { status: { in: ['pending', 'confirmed', 'active'] } }
            }
          }
        }
      }
    });

    if (!existingCar) {
      return NextResponse.json({ error: 'Car not found or access denied' }, { status: 404 });
    }

    // Check if car has active bookings
    if (existingCar._count.bookings > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete car with active bookings. Please complete or cancel all bookings first.' 
      }, { status: 400 });
    }

    // Delete the car
    await prisma.car.delete({
      where: { id: carId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete car API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
