'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3,
  Users,
  Building2,
  Car,
  Calendar,
  DollarSign,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Ban,
  UserCheck,
  UserX,
  Clock,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRequireAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FinancialReports from '@/components/FinancialReports';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  getPlatformStats,
  getAllUsers,
  getAllAgencies,
  getAllBookings,
  updateUserStatus,
  approveAgency,
  rejectAgency,
  suspendAgency,
  adminUpdateBookingStatus,
  type PlatformStats,
  type AdminUser,
  type AdminAgency,
  type AdminBooking
} from '@/lib/admin';

function AdminDashboardPage() {
  const router = useRouter();
  const { hasAccess, user, token } = useRequireAuth('admin');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Data states
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [agencies, setAgencies] = useState<AdminAgency[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);

  // Load data based on active tab
  const loadData = async (tab: string) => {
    setLoading(true);
    try {
      switch (tab) {
        case 'overview':
          const statsData = await getPlatformStats();
          setStats(statsData);
          break;
        case 'users':
          const usersData = await getAllUsers();
          setUsers(usersData);
          break;
        case 'agencies':
          const agenciesData = await getAllAgencies();
          setAgencies(agenciesData);
          break;
        case 'bookings':
          const bookingsData = await getAllBookings();
          setBookings(bookingsData);
          break;
      }
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (user && hasAccess) {
      loadData(activeTab);
    }
  }, [activeTab, user, hasAccess]);

  // Handle user status toggle
  const handleUserStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      const result = await updateUserStatus(userId, !currentStatus);
      if (result.success) {
        loadData('users'); // Reload users
      } else {
        alert(result.error || 'Failed to update user status');
      }
    } catch (error) {
      console.error('User status toggle error:', error);
      alert('An error occurred');
    }
  };

  // Handle agency approval
  const handleAgencyApproval = async (agencyId: string, action: 'approve' | 'reject' | 'suspend') => {
    try {
      let result;
      if (action === 'approve') {
        result = await approveAgency(agencyId);
      } else if (action === 'reject') {
        const reason = prompt('Reason for rejection (optional):');
        result = await rejectAgency(agencyId, reason || undefined);
      } else {
        const reason = prompt('Reason for suspension (optional):');
        result = await suspendAgency(agencyId, reason || undefined);
      }

      if (result.success) {
        loadData('agencies'); // Reload agencies
      } else {
        alert(result.error || 'Failed to update agency status');
      }
    } catch (error) {
      console.error('Agency action error:', error);
      alert('An error occurred');
    }
  };

  // Handle booking status update
  const handleBookingStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      const result = await adminUpdateBookingStatus(
        bookingId, 
        newStatus as 'pending' | 'confirmed' | 'cancelled' | 'completed'
      );
      if (result.success) {
        loadData('bookings'); // Reload bookings
      } else {
        alert(result.error || 'Failed to update booking status');
      }
    } catch (error) {
      console.error('Booking status update error:', error);
      alert('An error occurred');
    }
  };

  // Access control
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
          <p className="text-gray-600 mb-6">You need admin privileges to access this dashboard.</p>
          <Button onClick={() => router.push('/')}>
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  // Filter functions
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAgencies = agencies.filter(agency =>
    agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agency.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBookings = bookings.filter(booking =>
    booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.agencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.carName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Status badge helper
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      inactive: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      suspended: { bg: 'bg-orange-100', text: 'text-orange-800', icon: Ban },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle },
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={cn(
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize",
        config.bg,
        config.text
      )}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="page" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
              <p className="text-purple-100 mt-2">
                Welcome back, {user?.name}! Manage the entire CarRental platform.
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Shield className="w-12 h-12" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={cn(
                    "w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors",
                    activeTab === 'overview'
                      ? "bg-purple-50 text-purple-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <BarChart3 className="w-5 h-5 mr-3" />
                  Platform Overview
                </button>
                
                <button
                  onClick={() => setActiveTab('users')}
                  className={cn(
                    "w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors",
                    activeTab === 'users'
                      ? "bg-purple-50 text-purple-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <Users className="w-5 h-5 mr-3" />
                  User Management
                </button>
                
                <button
                  onClick={() => setActiveTab('agencies')}
                  className={cn(
                    "w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors",
                    activeTab === 'agencies'
                      ? "bg-purple-50 text-purple-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <Building2 className="w-5 h-5 mr-3" />
                  Agency Management
                </button>
                
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={cn(
                    "w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors",
                    activeTab === 'bookings'
                      ? "bg-purple-50 text-purple-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <Calendar className="w-5 h-5 mr-3" />
                  Booking Oversight
                </button>
                
                <button
                  onClick={() => setActiveTab('reports')}
                  className={cn(
                    "w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors",
                    activeTab === 'reports'
                      ? "bg-purple-50 text-purple-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <TrendingUp className="w-5 h-5 mr-3" />
                  Financial Reports
                </button>

                <button
                  onClick={() => setActiveTab('support')}
                  className={cn(
                    "w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors",
                    activeTab === 'support'
                      ? "bg-green-50 text-green-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <MessageSquare className="w-5 h-5 mr-3" />
                  Support Tickets
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading platform statistics...</p>
                  </div>
                ) : stats ? (
                  <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                          <div className="bg-blue-100 rounded-lg p-3 mr-4">
                            <Users className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                          <div className="bg-orange-100 rounded-lg p-3 mr-4">
                            <Building2 className="w-6 h-6 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Agencies</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalAgencies}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                          <div className="bg-green-100 rounded-lg p-3 mr-4">
                            <Car className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Cars</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalCars}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                          <div className="bg-purple-100 rounded-lg p-3 mr-4">
                            <Calendar className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Bookings</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                          <div className="bg-yellow-100 rounded-lg p-3 mr-4">
                            <DollarSign className="w-6 h-6 text-yellow-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString()} MAD</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                          <div className="bg-green-100 rounded-lg p-3 mr-4">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Monthly Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.monthlyRevenue.toLocaleString()} MAD</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                          <div className="bg-blue-100 rounded-lg p-3 mr-4">
                            <UserCheck className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Active Users (30d)</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                          <div className="bg-yellow-100 rounded-lg p-3 mr-4">
                            <AlertTriangle className="w-6 h-6 text-yellow-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Pending Agencies</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.pendingAgencies}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Button 
                          onClick={() => setActiveTab('agencies')}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                          disabled={stats.pendingAgencies === 0}
                        >
                          <Building2 className="w-4 h-4 mr-2" />
                          Review Agencies ({stats.pendingAgencies})
                        </Button>
                        <Button 
                          onClick={() => setActiveTab('users')}
                          variant="outline"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Manage Users
                        </Button>
                        <Button 
                          onClick={() => setActiveTab('bookings')}
                          variant="outline"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          View Bookings
                        </Button>
                        <Button 
                          onClick={() => window.open('/api/admin/export', '_blank')}
                          variant="outline"
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Export Data
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Failed to load platform statistics</p>
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                  <div className="flex-1 max-w-md">
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading users...</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Users className="w-5 h-5 text-gray-600" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={cn(
                                  "inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize",
                                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                  user.role === 'agency_owner' ? 'bg-orange-100 text-orange-800' :
                                  'bg-blue-100 text-blue-800'
                                )}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(user.isActive ? 'active' : 'inactive')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {user.bookingsCount}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {user.lastLogin ? format(user.lastLogin, 'MMM dd, yyyy') : 'Never'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <Button
                                  size="sm"
                                  variant={user.isActive ? "destructive" : "default"}
                                  onClick={() => handleUserStatusToggle(user.id, user.isActive)}
                                >
                                  {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Agencies Tab */}
            {activeTab === 'agencies' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-2xl font-bold text-gray-900">Agency Management</h2>
                  <div className="flex-1 max-w-md">
                    <Input
                      placeholder="Search agencies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading agencies...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredAgencies.map((agency) => (
                      <div key={agency.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                              <Building2 className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{agency.name}</h3>
                              <p className="text-sm text-gray-600">{agency.email}</p>
                            </div>
                          </div>
                          {getStatusBadge(agency.status)}
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                          <div>
                            <p className="text-sm text-gray-600">Cars</p>
                            <p className="font-semibold text-gray-900">{agency.carsCount}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Bookings</p>
                            <p className="font-semibold text-gray-900">{agency.bookingsCount}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Revenue</p>
                            <p className="font-semibold text-gray-900">{agency.totalRevenue.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="text-xs text-gray-500 mb-4">
                          <p>Registered: {format(agency.createdAt, 'MMM dd, yyyy')}</p>
                          {agency.approvedAt && <p>Approved: {format(agency.approvedAt, 'MMM dd, yyyy')}</p>}
                        </div>

                        <div className="flex space-x-2">
                          {agency.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                onClick={() => handleAgencyApproval(agency.id, 'approve')}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="flex-1"
                                onClick={() => handleAgencyApproval(agency.id, 'reject')}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {agency.status === 'approved' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1"
                              onClick={() => handleAgencyApproval(agency.id, 'suspend')}
                            >
                              <Ban className="w-4 h-4 mr-1" />
                              Suspend
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-2xl font-bold text-gray-900">Booking Oversight</h2>
                  <div className="flex-1 max-w-md">
                    <Input
                      placeholder="Search bookings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading bookings...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                      <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-gray-900">#{booking.id.slice(-8)}</h3>
                              {getStatusBadge(booking.status)}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Customer: <span className="font-medium text-gray-900">{booking.customerName}</span></p>
                                <p className="text-gray-600">Email: <span className="font-medium text-gray-900">{booking.customerEmail}</span></p>
                              </div>
                              <div>
                                <p className="text-gray-600">Car: <span className="font-medium text-gray-900">{booking.carName}</span></p>
                                <p className="text-gray-600">Agency: <span className="font-medium text-gray-900">{booking.agencyName}</span></p>
                              </div>
                              <div>
                                <p className="text-gray-600">Pickup: <span className="font-medium text-gray-900">{format(booking.pickupDate, 'MMM dd, yyyy')}</span></p>
                                <p className="text-gray-600">Return: <span className="font-medium text-gray-900">{format(booking.returnDate, 'MMM dd, yyyy')}</span></p>
                              </div>
                              <div>
                                <p className="text-gray-600">Amount: <span className="font-medium text-gray-900">{booking.totalPrice} MAD</span></p>
                                <p className="text-gray-600">Payment: <span className="font-medium text-gray-900 capitalize">{booking.paymentMethod}</span></p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <select
                              value={booking.status}
                              onChange={(e) => handleBookingStatusUpdate(booking.id, e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && token && (
              <FinancialReports token={token} />
            )}

            {/* Support Tab */}
            {activeTab === 'support' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Support Tickets</h3>
                      <p className="text-gray-600">Manage customer support requests and inquiries</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open('/support', '_blank')}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        View All Tickets
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <MessageSquare className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <h4 className="text-lg font-medium text-yellow-900 mb-2">Support System Ready</h4>
                    <p className="text-yellow-700 mb-4">
                      The customer support ticket system is now available. Customers can create tickets, and admin users can manage them.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="bg-white rounded-lg p-4 border border-yellow-200">
                        <h5 className="font-medium text-gray-900 mb-2">Features Available:</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Create and manage support tickets</li>
                          <li>• Real-time messaging between customers and support</li>
                          <li>• Ticket categorization and priority levels</li>
                          <li>• Customer satisfaction ratings</li>
                          <li>• Internal notes for support staff</li>
                        </ul>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-yellow-200">
                        <h5 className="font-medium text-gray-900 mb-2">Getting Started:</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Visit the Support page to view all tickets</li>
                          <li>• Click on individual tickets to respond</li>
                          <li>• Use internal notes for team communication</li>
                          <li>• Assign tickets to specific support agents</li>
                          <li>• Track resolution times and satisfaction</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default AdminDashboardPage;
