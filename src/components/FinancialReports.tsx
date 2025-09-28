'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Users,
  Car,
  Activity,
  BarChart3,
  PieChart,
  Download,
  Filter,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus,
  Building2,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface FinancialSummary {
  totalRevenue: number;
  totalCommission: number;
  totalBookings: number;
  averageBookingValue: number;
  activeAgencies: number;
  totalCars: number;
  completionRate: number;
  cancellationRate: number;
}

interface TimeSeriesData {
  period: string;
  revenue: number;
  bookings: number;
  commission: number;
  newCustomers: number;
  newAgencies: number;
}

interface AgencyMetrics {
  agencyId: string;
  agencyName: string;
  totalRevenue: number;
  totalBookings: number;
  averageBookingValue: number;
  commission: number;
  rating: number;
  totalCars: number;
  activeCars: number;
}

interface FinancialReportsProps {
  token: string;
  className?: string;
}

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  format: formatFn = (v) => v.toString() 
}: {
  title: string;
  value: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  format?: (value: number) => string;
}) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{formatFn(value)}</p>
        {change !== undefined && (
          <div className={cn(
            "flex items-center mt-2 text-sm",
            changeType === 'increase' && "text-green-600",
            changeType === 'decrease' && "text-red-600",
            changeType === 'neutral' && "text-gray-500"
          )}>
            {changeType === 'increase' && <ArrowUp className="w-3 h-3 mr-1" />}
            {changeType === 'decrease' && <ArrowDown className="w-3 h-3 mr-1" />}
            {changeType === 'neutral' && <Minus className="w-3 h-3 mr-1" />}
            <span>{Math.abs(change).toFixed(1)}% vs last period</span>
          </div>
        )}
      </div>
      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
    </div>
  </div>
);

const SimpleChart = ({ 
  data, 
  title, 
  type = 'line' 
}: { 
  data: TimeSeriesData[]; 
  title: string; 
  type?: 'line' | 'bar' 
}) => {
  if (!data.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <BarChart3 className="w-12 h-12 mr-4" />
          <span>No data available</span>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium">{format(new Date(item.period), 'MMM dd')}</span>
                  <span className="text-gray-600">{item.revenue.toLocaleString()} MAD</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">{item.bookings} bookings</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function FinancialReports({ token, className = '' }: FinancialReportsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('30');
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [timeseries, setTimeseries] = useState<TimeSeriesData[]>([]);
  const [agencies, setAgencies] = useState<AgencyMetrics[]>([]);
  const [locations, setLocations] = useState<{ location: string; revenue: number; bookings: number }[]>([]);
  const [categories, setCategories] = useState<{ category: string; bookings: number; revenue: number }[]>([]);
  const [bookingStats, setBookingStats] = useState<{ status: string; count: number; percentage: number }[]>([]);

  const loadReports = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/reports?type=comprehensive&period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSummary(data.data.summary);
        setTimeseries(data.data.timeseries);
        setAgencies(data.data.topAgencies);
        setLocations(data.data.locations);
        setCategories(data.data.categories);
        setBookingStats(data.data.bookingDistribution);
      } else {
        setError(data.error || 'Failed to load financial reports');
      }
    } catch (error) {
      console.error('Financial reports error:', error);
      setError('An error occurred while loading reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [period, token]);

  const formatCurrency = (value: number) => `${value.toLocaleString()} MAD`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("text-center py-12", className)}>
        <Activity className="w-12 h-12 text-red-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-900 mb-2">Failed to Load Reports</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadReports} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600">Platform performance and revenue analytics</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
          
          <Button onClick={loadReports} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <Button size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value={summary.totalRevenue}
            changeType="increase"
            change={12.5}
            icon={DollarSign}
            format={formatCurrency}
          />
          <MetricCard
            title="Platform Commission"
            value={summary.totalCommission}
            changeType="increase"
            change={8.3}
            icon={TrendingUp}
            format={formatCurrency}
          />
          <MetricCard
            title="Total Bookings"
            value={summary.totalBookings}
            changeType="increase"
            change={15.2}
            icon={Calendar}
            format={(v) => v.toLocaleString()}
          />
          <MetricCard
            title="Avg Booking Value"
            value={summary.averageBookingValue}
            changeType="neutral"
            change={2.1}
            icon={Activity}
            format={formatCurrency}
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleChart data={timeseries} title="Revenue Trend" />
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status Distribution</h3>
          <div className="space-y-3">
            {bookingStats.map((status, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={cn(
                    "w-3 h-3 rounded-full mr-3",
                    status.status === 'completed' && "bg-green-500",
                    status.status === 'confirmed' && "bg-blue-500",
                    status.status === 'pending' && "bg-yellow-500",
                    status.status === 'cancelled' && "bg-red-500",
                    status.status === 'active' && "bg-purple-500"
                  )} />
                  <span className="text-sm font-medium capitalize">{status.status}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">{status.count}</span>
                  <span className="text-sm font-medium">{status.percentage.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agency Performance */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Agencies</h3>
          <Building2 className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Agency</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Revenue</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Bookings</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Avg Value</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Commission</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Cars</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Rating</th>
              </tr>
            </thead>
            <tbody>
              {agencies.map((agency, index) => (
                <tr key={agency.agencyId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{agency.agencyName}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {formatCurrency(agency.totalRevenue)}
                  </td>
                  <td className="py-3 px-4 text-right">{agency.totalBookings}</td>
                  <td className="py-3 px-4 text-right">
                    {formatCurrency(agency.averageBookingValue)}
                  </td>
                  <td className="py-3 px-4 text-right text-green-600 font-medium">
                    {formatCurrency(agency.commission)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {agency.activeCars}/{agency.totalCars}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end">
                      <span className="mr-1">⭐</span>
                      <span>{agency.rating || 'N/A'}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Location & Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue by Location</h3>
            <MapPin className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {locations.slice(0, 5).map((location, index) => {
              const maxRevenue = Math.max(...locations.map(l => l.revenue));
              const percentage = maxRevenue > 0 ? (location.revenue / maxRevenue) * 100 : 0;
              
              return (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium">{location.location}</span>
                    <span className="text-gray-600">{formatCurrency(location.revenue)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{location.bookings} bookings</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Popular Car Categories</h3>
            <Car className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {categories.slice(0, 5).map((category, index) => {
              const maxBookings = Math.max(...categories.map(c => c.bookings));
              const percentage = maxBookings > 0 ? (category.bookings / maxBookings) * 100 : 0;
              
              return (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium capitalize">{category.category}</span>
                    <span className="text-gray-600">{category.bookings} bookings</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{formatCurrency(category.revenue)} revenue</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Platform Health */}
      {summary && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Platform Health</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {formatPercentage(summary.completionRate)}
              </div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {formatPercentage(summary.cancellationRate)}
              </div>
              <div className="text-sm text-gray-600">Cancellation Rate</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {summary.activeAgencies}
              </div>
              <div className="text-sm text-gray-600">Active Agencies</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {summary.totalCars}
              </div>
              <div className="text-sm text-gray-600">Available Cars</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
