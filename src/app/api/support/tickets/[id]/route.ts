import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SupportTicketStatus, SupportTicketPriority } from '@prisma/client';

// GET /api/support/tickets/[id] - Get specific ticket with messages
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const resolvedParams = await params;
    const ticketId = resolvedParams.id;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        assignedTo: {
          select: { id: true, email: true, fullName: true }
        },
        relatedBooking: {
          select: { id: true, bookingReference: true, customerName: true }
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: { id: true, fullName: true, role: true }
            }
          }
        }
      }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check permission - users can only see their own tickets (unless admin)
    if (decoded.role !== 'admin' && ticket.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      ticket
    });

  } catch (error) {
    console.error('Get support ticket API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/support/tickets/[id] - Update ticket (status, priority, assignment, etc.)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const resolvedParams = await params;
    const ticketId = resolvedParams.id;
    const updates = await request.json();

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: { id: true, userId: true, status: true }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check permissions
    const canUpdate = decoded.role === 'admin' || ticket.userId === decoded.userId;
    if (!canUpdate) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate update data
    const allowedUpdates: Record<string, unknown> = {};

    // Only admins can update certain fields
    if (decoded.role === 'admin') {
      if (updates.status && Object.values(SupportTicketStatus).includes(updates.status)) {
        allowedUpdates.status = updates.status;
        
        // Set resolvedAt when status is resolved/closed
        if (['resolved', 'closed'].includes(updates.status) && ticket.status !== updates.status) {
          allowedUpdates.resolvedAt = new Date();
        }
      }

      if (updates.priority && Object.values(SupportTicketPriority).includes(updates.priority)) {
        allowedUpdates.priority = updates.priority;
      }

      if (updates.assignedToUserId !== undefined) {
        // Verify assigned user exists and is admin
        if (updates.assignedToUserId) {
          const assignedUser = await prisma.user.findUnique({
            where: { id: updates.assignedToUserId },
            select: { role: true }
          });
          
          if (!assignedUser || assignedUser.role !== 'admin') {
            return NextResponse.json({ error: 'Invalid assigned user' }, { status: 400 });
          }
        }
        allowedUpdates.assignedToUserId = updates.assignedToUserId;
      }

      if (updates.internalNotes !== undefined) {
        allowedUpdates.internalNotes = updates.internalNotes;
      }
    }

    // Regular users can only update customer satisfaction
    if (updates.customerSatisfaction && ticket.userId === decoded.userId) {
      if (Number.isInteger(updates.customerSatisfaction) && 
          updates.customerSatisfaction >= 1 && 
          updates.customerSatisfaction <= 5) {
        allowedUpdates.customerSatisfaction = updates.customerSatisfaction;
      }
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: allowedUpdates,
      include: {
        user: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        assignedTo: {
          select: { id: true, email: true, fullName: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      ticket: updatedTicket
    });

  } catch (error) {
    console.error('Update support ticket API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/support/tickets/[id] - Delete ticket (admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const resolvedParams = await params;
    const ticketId = resolvedParams.id;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: { id: true }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    await prisma.supportTicket.delete({
      where: { id: ticketId }
    });

    return NextResponse.json({
      success: true,
      message: 'Ticket deleted successfully'
    });

  } catch (error) {
    console.error('Delete support ticket API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
