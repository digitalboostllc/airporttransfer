import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SupportTicketCategory, SupportTicketPriority } from '@prisma/client';

// Generate unique ticket number
function generateTicketNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `VEN-${timestamp}-${random}`.toUpperCase();
}

// GET /api/support/tickets - Get support tickets
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build where clause based on user role
    const whereClause: Record<string, unknown> = {};
    
    // Non-admin users can only see their own tickets
    if (decoded.role !== 'admin') {
      whereClause.userId = decoded.userId;
    }

    // Add filters
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    if (category && category !== 'all') {
      whereClause.category = category;
    }

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where: whereClause,
        include: {
          user: {
            select: { id: true, email: true, fullName: true, role: true }
          },
          assignedTo: {
            select: { id: true, email: true, fullName: true }
          },
          relatedBooking: {
            select: { id: true, bookingReference: true }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              user: {
                select: { id: true, fullName: true }
              }
            }
          },
          _count: { select: { messages: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.supportTicket.count({ where: whereClause })
    ]);

    return NextResponse.json({
      success: true,
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Support tickets API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/support/tickets - Create new support ticket
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const {
      category,
      priority = 'medium',
      subject,
      description,
      relatedBookingId,
      attachments = []
    } = await request.json();

    // Validate required fields
    if (!category || !subject || !description) {
      return NextResponse.json({ 
        error: 'Missing required fields: category, subject, description' 
      }, { status: 400 });
    }

    // Validate enum values
    if (!Object.values(SupportTicketCategory).includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    if (!Object.values(SupportTicketPriority).includes(priority)) {
      return NextResponse.json({ error: 'Invalid priority' }, { status: 400 });
    }

    // Verify booking exists if provided
    if (relatedBookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: relatedBookingId },
        select: { id: true, customerId: true }
      });

      if (!booking) {
        return NextResponse.json({ error: 'Related booking not found' }, { status: 400 });
      }

      // Only allow users to reference their own bookings (unless admin)
      if (decoded.role !== 'admin' && booking.customerId !== decoded.userId) {
        return NextResponse.json({ error: 'Unauthorized to reference this booking' }, { status: 403 });
      }
    }

    const ticketNumber = generateTicketNumber();

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId: decoded.userId,
        category,
        priority,
        subject,
        description,
        attachments: JSON.stringify(attachments),
        relatedBookingId: relatedBookingId || null,
      },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        relatedBooking: {
          select: { id: true, bookingReference: true }
        }
      }
    });

    // Create initial message
    await prisma.supportMessage.create({
      data: {
        ticketId: ticket.id,
        userId: decoded.userId,
        message: description,
        attachments: JSON.stringify(attachments)
      }
    });

    // TODO: Send notification email to support team

    return NextResponse.json({
      success: true,
      ticket
    }, { status: 201 });

  } catch (error) {
    console.error('Create support ticket API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
