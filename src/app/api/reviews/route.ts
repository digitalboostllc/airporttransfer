import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'customer') {
      return NextResponse.json({ error: 'Only customers can create reviews' }, { status: 403 });
    }

    const {
      bookingId,
      rating,
      title,
      comment,
      cleanlinessRating,
      serviceRating,
      valueRating
    } = await request.json();

    if (!bookingId || !rating) {
      return NextResponse.json({ error: 'Booking ID and rating are required' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Verify booking exists and belongs to customer
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        car: {
          select: { agencyId: true }
        }
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.customerId !== decoded.userId) {
      return NextResponse.json({ error: 'You can only review your own bookings' }, { status: 403 });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return NextResponse.json({ error: 'You can only review completed bookings' }, { status: 400 });
    }

    // Check if review already exists
    const existingReview = await prisma.review.findFirst({
      where: {
        bookingId,
        customerId: decoded.userId
      }
    });

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this booking' }, { status: 400 });
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        bookingId,
        customerId: decoded.userId,
        agencyId: booking.car?.agencyId || '',
        carId: booking.carId || '',
        rating: Math.max(1, Math.min(5, rating)),
        title: title?.trim() || null,
        comment: comment?.trim() || null,
        cleanlinessRating: cleanlinessRating ? Math.max(1, Math.min(5, cleanlinessRating)) : null,
        serviceRating: serviceRating ? Math.max(1, Math.min(5, serviceRating)) : null,
        valueRating: valueRating ? Math.max(1, Math.min(5, valueRating)) : null,
        isVerified: true // Since it's tied to a real booking
      },
      include: {
        booking: {
          include: {
            car: {
              select: { make: true, model: true, year: true }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        cleanlinessRating: review.cleanlinessRating,
        serviceRating: review.serviceRating,
        valueRating: review.valueRating,
        createdAt: review.createdAt,
        car: review.booking.car
      }
    });

  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const carId = searchParams.get('carId');
    const agencyId = searchParams.get('agencyId');
    const customerId = searchParams.get('customerId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {
      isVerified: true
    };

    if (carId) where.carId = carId;
    if (agencyId) where.agencyId = agencyId;
    if (customerId) where.customerId = customerId;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          booking: {
            include: {
              car: {
                select: { make: true, model: true, year: true, category: true }
              },
              customer: {
                select: { fullName: true }
              }
            }
          }
        },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: offset,
        take: limit
      }),
      prisma.review.count({ where })
    ]);

    const formattedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      cleanlinessRating: review.cleanlinessRating,
      serviceRating: review.serviceRating,
      valueRating: review.valueRating,
      createdAt: review.createdAt,
      customerName: review.booking.customer?.fullName || 'Anonymous',
      car: review.booking.car,
      agencyResponse: review.agencyResponse,
      agencyResponseDate: review.agencyResponseDate,
      isFeatured: review.isFeatured
    }));

    // Calculate average ratings
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;

    const averageCleanlinessRating = reviews.filter(r => r.cleanlinessRating).length > 0
      ? reviews.filter(r => r.cleanlinessRating).reduce((sum, r) => sum + (r.cleanlinessRating || 0), 0) / reviews.filter(r => r.cleanlinessRating).length
      : 0;

    const averageServiceRating = reviews.filter(r => r.serviceRating).length > 0
      ? reviews.filter(r => r.serviceRating).reduce((sum, r) => sum + (r.serviceRating || 0), 0) / reviews.filter(r => r.serviceRating).length
      : 0;

    const averageValueRating = reviews.filter(r => r.valueRating).length > 0
      ? reviews.filter(r => r.valueRating).reduce((sum, r) => sum + (r.valueRating || 0), 0) / reviews.filter(r => r.valueRating).length
      : 0;

    return NextResponse.json({
      reviews: formattedReviews,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      stats: {
        averageRating: Math.round(averageRating * 10) / 10,
        averageCleanlinessRating: Math.round(averageCleanlinessRating * 10) / 10,
        averageServiceRating: Math.round(averageServiceRating * 10) / 10,
        averageValueRating: Math.round(averageValueRating * 10) / 10,
        totalReviews: total
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
