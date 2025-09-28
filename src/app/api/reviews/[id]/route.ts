import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const review = await prisma.review.findUnique({
      where: { id },
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
      }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      cleanlinessRating: review.cleanlinessRating,
      serviceRating: review.serviceRating,
      valueRating: review.valueRating,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      customerName: review.booking.customer?.fullName || 'Anonymous',
      car: review.booking.car,
      agencyResponse: review.agencyResponse,
      agencyResponseDate: review.agencyResponseDate,
      isFeatured: review.isFeatured,
      isVerified: review.isVerified
    });

  } catch (error) {
    console.error('Get review error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const {
      rating,
      title,
      comment,
      cleanlinessRating,
      serviceRating,
      valueRating,
      agencyResponse
    } = await request.json();

    // Get the review
    const existingReview = await prisma.review.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            car: {
              select: { agencyId: true }
            }
          }
        }
      }
    });

    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Check permissions
    if (decoded.role === 'customer') {
      // Customers can only edit their own reviews
      if (existingReview.customerId !== decoded.userId) {
        return NextResponse.json({ error: 'You can only edit your own reviews' }, { status: 403 });
      }
      
      // Customers can't add agency response
      if (agencyResponse !== undefined) {
        return NextResponse.json({ error: 'Customers cannot add agency responses' }, { status: 403 });
      }

    } else if (decoded.role === 'agency_owner') {
      // Agency owners can only respond to reviews for their cars
      if (existingReview.booking.car?.agencyId !== decoded.agencyId) {
        return NextResponse.json({ error: 'You can only respond to reviews for your cars' }, { status: 403 });
      }

      // Agency owners can only add responses, not edit customer review content
      if (rating !== undefined || title !== undefined || comment !== undefined || 
          cleanlinessRating !== undefined || serviceRating !== undefined || valueRating !== undefined) {
        return NextResponse.json({ error: 'Agencies can only add responses, not edit review content' }, { status: 403 });
      }

    } else if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    
    if (decoded.role === 'customer' || decoded.role === 'admin') {
      if (rating !== undefined) {
        updateData.rating = Math.max(1, Math.min(5, rating));
      }
      if (title !== undefined) updateData.title = title?.trim() || null;
      if (comment !== undefined) updateData.comment = comment?.trim() || null;
      if (cleanlinessRating !== undefined) {
        updateData.cleanlinessRating = cleanlinessRating ? Math.max(1, Math.min(5, cleanlinessRating)) : null;
      }
      if (serviceRating !== undefined) {
        updateData.serviceRating = serviceRating ? Math.max(1, Math.min(5, serviceRating)) : null;
      }
      if (valueRating !== undefined) {
        updateData.valueRating = valueRating ? Math.max(1, Math.min(5, valueRating)) : null;
      }
    }

    if ((decoded.role === 'agency_owner' || decoded.role === 'admin') && agencyResponse !== undefined) {
      updateData.agencyResponse = agencyResponse?.trim() || null;
      updateData.agencyResponseDate = agencyResponse?.trim() ? new Date() : null;
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: updateData,
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
      }
    });

    return NextResponse.json({
      success: true,
      review: {
        id: updatedReview.id,
        rating: updatedReview.rating,
        title: updatedReview.title,
        comment: updatedReview.comment,
        cleanlinessRating: updatedReview.cleanlinessRating,
        serviceRating: updatedReview.serviceRating,
        valueRating: updatedReview.valueRating,
        createdAt: updatedReview.createdAt,
        updatedAt: updatedReview.updatedAt,
        customerName: updatedReview.booking.customer?.fullName || 'Anonymous',
        car: updatedReview.booking.car,
        agencyResponse: updatedReview.agencyResponse,
        agencyResponseDate: updatedReview.agencyResponseDate
      }
    });

  } catch (error) {
    console.error('Update review error:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get the review
    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Check permissions
    if (decoded.role === 'customer' && review.customerId !== decoded.userId) {
      return NextResponse.json({ error: 'You can only delete your own reviews' }, { status: 403 });
    } else if (decoded.role === 'agency_owner') {
      return NextResponse.json({ error: 'Agencies cannot delete customer reviews' }, { status: 403 });
    } else if (decoded.role !== 'admin' && decoded.role !== 'customer') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    await prisma.review.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete review error:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
