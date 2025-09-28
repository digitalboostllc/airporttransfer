import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { FinancialReportService } from '@/lib/financial-reports';
import { subDays, subMonths, subYears, startOfDay, endOfDay } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'summary';
    const period = searchParams.get('period') || '30'; // days
    const groupBy = searchParams.get('groupBy') as 'day' | 'week' | 'month' || 'day';
    
    // Calculate date range
    const endDate = endOfDay(new Date());
    let startDate: Date;
    
    switch (period) {
      case '7':
        startDate = startOfDay(subDays(endDate, 7));
        break;
      case '30':
        startDate = startOfDay(subDays(endDate, 30));
        break;
      case '90':
        startDate = startOfDay(subDays(endDate, 90));
        break;
      case '365':
        startDate = startOfDay(subDays(endDate, 365));
        break;
      case 'month':
        startDate = startOfDay(subMonths(endDate, 1));
        break;
      case 'year':
        startDate = startOfDay(subYears(endDate, 1));
        break;
      default:
        startDate = startOfDay(subDays(endDate, parseInt(period) || 30));
    }

    switch (reportType) {
      case 'summary':
        const summary = await FinancialReportService.getFinancialSummary(startDate, endDate);
        return NextResponse.json({ 
          success: true, 
          data: summary,
          period: { startDate, endDate }
        });

      case 'timeseries':
        const timeseries = await FinancialReportService.getTimeSeriesData(startDate, endDate, groupBy);
        return NextResponse.json({ 
          success: true, 
          data: timeseries,
          period: { startDate, endDate }
        });

      case 'agencies':
        const limit = parseInt(searchParams.get('limit') || '10');
        const agencies = await FinancialReportService.getAgencyMetrics(startDate, endDate, limit);
        return NextResponse.json({ 
          success: true, 
          data: agencies,
          period: { startDate, endDate }
        });

      case 'locations':
        const locations = await FinancialReportService.getRevenueByLocation(startDate, endDate);
        return NextResponse.json({ 
          success: true, 
          data: locations,
          period: { startDate, endDate }
        });

      case 'bookings':
        const bookingStats = await FinancialReportService.getBookingStatusDistribution(startDate, endDate);
        return NextResponse.json({ 
          success: true, 
          data: bookingStats,
          period: { startDate, endDate }
        });

      case 'categories':
        const categories = await FinancialReportService.getPopularCarCategories(startDate, endDate);
        return NextResponse.json({ 
          success: true, 
          data: categories,
          period: { startDate, endDate }
        });

      case 'comprehensive':
        // Get all reports in one request
        const [
          comprehensiveSummary,
          comprehensiveTimeseries,
          topAgencies,
          topLocations,
          bookingDistribution,
          popularCategories
        ] = await Promise.all([
          FinancialReportService.getFinancialSummary(startDate, endDate),
          FinancialReportService.getTimeSeriesData(startDate, endDate, groupBy),
          FinancialReportService.getAgencyMetrics(startDate, endDate, 5),
          FinancialReportService.getRevenueByLocation(startDate, endDate),
          FinancialReportService.getBookingStatusDistribution(startDate, endDate),
          FinancialReportService.getPopularCarCategories(startDate, endDate)
        ]);

        return NextResponse.json({ 
          success: true, 
          data: {
            summary: comprehensiveSummary,
            timeseries: comprehensiveTimeseries,
            topAgencies,
            locations: topLocations,
            bookingDistribution,
            categories: popularCategories
          },
          period: { startDate, endDate }
        });

      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

  } catch (error) {
    console.error('Financial reports error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate financial reports',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
