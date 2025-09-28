import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { confirmPaymentIntent } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { sendPaymentConfirmation, sendAgencyBookingNotification } from '@/lib/email-notifications';

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

    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Payment Intent ID is required' }, { status: 400 });
    }

    // Confirm payment with Stripe
    const paymentIntent = await confirmPaymentIntent(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ 
        error: 'Payment not successful',
        status: paymentIntent.status 
      }, { status: 400 });
    }

    // Find the booking
    const booking = await prisma.booking.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
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

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: 'completed',
        status: 'confirmed',
        paidAt: new Date(),
        paymentReference: paymentIntent.id,
      }
    });

    // Send enhanced notification emails
    try {
      // Create user object for email notifications
      const customer = {
        id: decoded.userId,
        email: booking.customerEmail,
        name: booking.customerName
      };

      // Send payment confirmation email to customer
      await sendPaymentConfirmation(booking as any, customer as any, {
        amount: booking.totalPrice,
        currency: 'MAD',
        paymentMethod: 'Credit Card',
        transactionId: paymentIntent.id
      });

      // Send agency notification if agency has contact email
      if (booking.car?.agency?.contactEmail) {
        await sendAgencyBookingNotification(
          booking as any,
          booking.car.agency.contactEmail,
          'new'
        );
      }

    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the payment confirmation if email fails
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: updatedBooking.id,
        reference: updatedBooking.bookingReference,
        status: updatedBooking.status,
        paymentStatus: updatedBooking.paymentStatus,
      }
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}
