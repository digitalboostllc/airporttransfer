import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { 
  getAgencyStats, 
  getAgencyBookings, 
  getAgencyCars, 
  getAgencyByUserId,
  updateBookingStatus
} from '@/lib/agency';

// GET - Get agency dashboard data
export async function GET(request: NextRequest) {
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
    if (!agency) {
      return NextResponse.json({ error: 'No agency found for this user' }, { status: 403 });
    }

    // Check if agency is approved
    if (agency.status !== 'approved') {
      return NextResponse.json({ 
        error: 'Agency not approved', 
        agencyStatus: agency.status 
      }, { status: 403 });
    }

    // Get query parameters
    const url = new URL(request.url);
    const dataType = url.searchParams.get('type'); // 'stats', 'bookings', 'cars', or 'all'
    const limit = url.searchParams.get('limit');

    let result: any = {};

    switch (dataType) {
      case 'stats':
        result.stats = await getAgencyStats(agency.id);
        break;
        
      case 'bookings':
        result.bookings = await getAgencyBookings(agency.id, limit ? parseInt(limit) : undefined);
        break;
        
      case 'cars':
        result.cars = await getAgencyCars(agency.id);
        break;
        
      case 'all':
      default:
        // Get all data for dashboard
        const [stats, bookings, cars] = await Promise.all([
          getAgencyStats(agency.id),
          getAgencyBookings(agency.id, 10), // Last 10 bookings
          getAgencyCars(agency.id)
        ]);
        result = { stats, bookings, cars, agency };
        break;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Agency dashboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update booking status
export async function PUT(request: NextRequest) {
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

    const { bookingId, status } = await request.json();

    if (!bookingId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await updateBookingStatus(bookingId, agency.id, status);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('Update booking status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
