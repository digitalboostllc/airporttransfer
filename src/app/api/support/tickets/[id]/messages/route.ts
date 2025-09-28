import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/support/tickets/[id]/messages - Get messages for a ticket
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const ticketId = params.id;

    // Check if ticket exists and user has permission
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: { id: true, userId: true }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Users can only see messages for their own tickets (unless admin)
    if (decoded.role !== 'admin' && ticket.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const messages = await prisma.supportMessage.findMany({
      where: {
        ticketId,
        // Regular users can't see internal messages
        ...(decoded.role !== 'admin' ? { isInternal: false } : {})
      },
      include: {
        user: {
          select: { id: true, fullName: true, role: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({
      success: true,
      messages
    });

  } catch (error) {
    console.error('Get support messages API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/support/tickets/[id]/messages - Add message to ticket
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const ticketId = params.id;
    const { message, attachments = [], isInternal = false } = await request.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // Check if ticket exists and user has permission
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: { id: true, userId: true, status: true }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Users can only add messages to their own tickets (unless admin)
    const canAddMessage = decoded.role === 'admin' || ticket.userId === decoded.userId;
    if (!canAddMessage) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only admins can add internal messages
    const messageIsInternal = decoded.role === 'admin' ? isInternal : false;

    // Don't allow messages on closed tickets (unless admin)
    if (ticket.status === 'closed' && decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Cannot add messages to closed tickets' }, { status: 400 });
    }

    const supportMessage = await prisma.supportMessage.create({
      data: {
        ticketId,
        userId: decoded.userId,
        message: message.trim(),
        attachments: JSON.stringify(attachments),
        isInternal: messageIsInternal
      },
      include: {
        user: {
          select: { id: true, fullName: true, role: true }
        }
      }
    });

    // Update ticket status if needed
    let ticketUpdates: any = {};
    
    // If customer sends a message, set status to 'open' if it was 'waiting_customer'
    if (ticket.userId === decoded.userId && ticket.status === 'waiting_customer') {
      ticketUpdates.status = 'open';
    }
    
    // If admin sends a non-internal message, set status to 'waiting_customer' if it was 'open'
    if (decoded.role === 'admin' && !messageIsInternal && ticket.status === 'open') {
      ticketUpdates.status = 'waiting_customer';
    }

    if (Object.keys(ticketUpdates).length > 0) {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: ticketUpdates
      });
    }

    // TODO: Send email notification based on message type and recipient

    return NextResponse.json({
      success: true,
      message: supportMessage
    }, { status: 201 });

  } catch (error) {
    console.error('Add support message API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
