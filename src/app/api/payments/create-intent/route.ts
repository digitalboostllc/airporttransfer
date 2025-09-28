import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createPaymentIntent, createStripeCustomer, getStripeCustomer } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { bookingId, amount } = await request.json();

    if (!bookingId || !amount) {
      return NextResponse.json({ error: 'Booking ID and amount are required' }, { status: 400 });
    }

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        car: {
          include: {
            agency: true
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify the user owns this booking
    if (booking.customerId !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized to access this booking' }, { status: 403 });
    }

    // Get or create Stripe customer
    let stripeCustomer = await getStripeCustomer(booking.customerEmail);
    if (!stripeCustomer) {
      stripeCustomer = await createStripeCustomer(
        booking.customerEmail,
        booking.customerName,
        {
          userId: decoded.userId,
          bookingId: booking.id,
        }
      );
    }

    // Create payment intent
    const paymentIntent = await createPaymentIntent(
      amount,
      'mad', // Moroccan Dirham
      {
        bookingId: booking.id,
        customerId: decoded.userId,
        carId: booking.carId || '',
        agencyId: booking.car?.agency?.id || '',
        bookingReference: booking.bookingReference,
      }
    );

    // Update booking with payment intent ID
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        stripePaymentIntentId: paymentIntent.id,
        paymentStatus: 'pending'
      }
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
