'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Car as CarIcon, 
  Plus, 
  Calendar, 
  DollarSign, 
  Edit3,
  Trash2,
  Settings,
  BarChart3,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRequireAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Image from 'next/image';
import {
  getAgencyDashboardData,
  updateBookingStatus,
  type AgencyDashboardData,
  type AgencyCar
} from '@/lib/agency-client';
import { type Car } from '@/lib/car-client';
import { deleteCar, toggleCarStatus } from '@/lib/car-client';
import CarManagementModal from '@/components/CarManagementModal';
import BookingCalendar from '@/components/BookingCalendar';


function AgencyDashboardPage() {
  const router = useRouter();
  const { hasAccess, user, token } = useRequireAuth('agency_owner');
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data states
  const [dashboardData, setDashboardData] = useState<AgencyDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updatingBooking, setUpdatingBooking] = useState<string | null>(null);

  // Car management states
  const [carModalOpen, setCarModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<AgencyCar | null>(null);
  const [updatingCar, setUpdatingCar] = useState<string | null>(null);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError('');
    try {
      const data = await getAgencyDashboardData(token);
      if (data) {
        setDashboardData(data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
      setError('An error occurred while loading dashboard data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Handle booking status update
  const handleBookingStatusUpdate = async (bookingId: string, newStatus: 'confirmed' | 'cancelled' | 'completed' | 'in_progress') => {
    if (!token || !dashboardData) return;
    
    setUpdatingBooking(bookingId);
    try {
      const result = await updateBookingStatus(token, bookingId, newStatus);
      if (result.success) {
        // Refresh dashboard data
        await loadDashboardData();
      } else {
        setError(result.error || 'Failed to update booking status');
      }
    } catch (error) {
      console.error('Update booking status error:', error);
      setError('An error occurred while updating booking status');
    } finally {
      setUpdatingBooking(null);
    }
  };

  // Car management functions
  const handleAddCar = () => {
    setEditingCar(null);
    setCarModalOpen(true);
  };

  const handleEditCar = (car: AgencyCar) => {
    setEditingCar(car);
    setCarModalOpen(true);
  };

  const handleDeleteCar = async (carId: string) => {
    if (!token || !confirm('Are you sure you want to delete this car? This action cannot be undone.')) return;
    
    setUpdatingCar(carId);
    try {
      const result = await deleteCar(token, carId);
      if (result.success) {
        await loadDashboardData(); // Refresh data
      } else {
        setError(result.error || 'Failed to delete car');
      }
    } catch (error) {
      console.error('Delete car error:', error);
      setError('An error occurred while deleting the car');
    } finally {
      setUpdatingCar(null);
    }
  };

  const handleToggleCarStatus = async (carId: string, isActive: boolean) => {
    if (!token) return;
    
    setUpdatingCar(carId);
    try {
      const result = await toggleCarStatus(token, carId, isActive);
      if (result.success) {
        await loadDashboardData(); // Refresh data
      } else {
        setError(result.error || 'Failed to update car status');
      }
    } catch (error) {
      console.error('Toggle car status error:', error);
      setError('An error occurred while updating car status');
    } finally {
      setUpdatingCar(null);
    }
  };

  const handleCarModalSuccess = () => {
    loadDashboardData(); // Refresh data
    setCarModalOpen(false);
    setEditingCar(null);
  };

  const handleCarModalClose = () => {
    setCarModalOpen(false);
    setEditingCar(null);
  };

  // Load data on component mount and when user/token changes
  useEffect(() => {
    if (user && token && hasAccess) {
      loadDashboardData();
    }
  }, [user, token, hasAccess, loadDashboardData]);

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4">
            <CarIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Agency Access Required</h2>
            <p className="text-gray-600 mb-6">You need an agency account to access this dashboard.</p>
            <Button 
              onClick={() => router.push('/register?type=agency')}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Register as Agency
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'rented': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCars = dashboardData?.cars.filter(car =>
    `${car.make} ${car.model}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="page" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Agency Dashboard</h1>
              <p className="text-orange-100 mt-2">
                Welcome back, {user?.name}! Manage your fleet and bookings.
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <CarIcon className="w-12 h-12" />
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
                      ? "bg-orange-50 text-orange-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <BarChart3 className="w-5 h-5 mr-3" />
                  Overview
                </button>
                
                <button
                  onClick={() => setActiveTab('cars')}
                  className={cn(
                    "w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors",
                    activeTab === 'cars'
                      ? "bg-orange-50 text-orange-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <CarIcon className="w-5 h-5 mr-3" />
                  Fleet Management
                </button>
                
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={cn(
                    "w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors",
                    activeTab === 'bookings'
                      ? "bg-orange-50 text-orange-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <Clock className="w-5 h-5 mr-3" />
                  Bookings
                </button>
                
                <button
                  onClick={() => setActiveTab('calendar')}
                  className={cn(
                    "w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors",
                    activeTab === 'calendar'
                      ? "bg-orange-50 text-orange-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <Calendar className="w-5 h-5 mr-3" />
                  Calendar View
                </button>
                
                <button
                  onClick={() => setActiveTab('settings')}
                  className={cn(
                    "w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors",
                    activeTab === 'settings'
                      ? "bg-orange-50 text-orange-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Agency Settings
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Error State */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                      <span className="text-red-700">{error}</span>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                    <span className="ml-2 text-gray-600">Loading dashboard data...</span>
                  </div>
                )}

                {/* Stats Cards */}
                {dashboardData && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center">
                        <div className="bg-blue-100 rounded-lg p-3 mr-4">
                          <CarIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Cars</p>
                          <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalCars}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center">
                        <div className="bg-green-100 rounded-lg p-3 mr-4">
                          <Calendar className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Active Bookings</p>
                          <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.activeBookings}</p>
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
                          <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalRevenue.toLocaleString()} MAD</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center">
                        <div className="bg-purple-100 rounded-lg p-3 mr-4">
                          <Star className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Avg Rating</p>
                          <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.averageRating}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Bookings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
                    <Button 
                      onClick={() => setActiveTab('bookings')}
                      variant="outline" 
                      size="sm"
                    >
                      View All
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {dashboardData?.bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{booking.customerName}</p>
                          <p className="text-sm text-gray-600">{booking.carMake} {booking.carModel} {booking.carYear}</p>
                          <p className="text-sm text-gray-500">
                            {format(booking.pickupDatetime, 'MMM dd')} - {format(booking.dropoffDatetime, 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{booking.totalPrice.toLocaleString()} MAD</p>
                          <span className={cn(
                            "inline-block px-2 py-1 rounded text-xs font-medium",
                            getBookingStatusColor(booking.status)
                          )}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No recent bookings found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Cars Tab */}
            {activeTab === 'cars' && (
              <div className="space-y-6">
                {/* Header with Search and Add Button */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1 max-w-md">
                    <Input
                      placeholder="Search cars..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button 
                    onClick={handleAddCar}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Car
                  </Button>
                </div>

                {/* Cars Grid */}
                {filteredCars.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <CarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No cars in your fleet yet</p>
                    <p className="mb-6">Add your first car to start accepting bookings</p>
                    <Button 
                      onClick={handleAddCar}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Car
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredCars.map((car) => (
                      <div key={car.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                              <Image
                                src={car.images?.[0] || '/placeholder-car.png'}
                                alt={`${car.make} ${car.model}`}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {car.make} {car.model} {car.year}
                              </h3>
                              <p className="text-sm text-gray-600 capitalize">{car.category}</p>
                              <p className="text-lg font-bold text-gray-900 mt-1">{car.pricePerDay} MAD/day</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <span className={cn(
                              "inline-block px-2 py-1 rounded text-xs font-medium capitalize",
                              getStatusColor(car.status)
                            )}>
                              {car.status}
                            </span>
                            {!car.isActive && (
                              <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                          <div>
                            <p className="text-sm text-gray-600">Bookings</p>
                            <p className="font-semibold text-gray-900">{car.totalBookings}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Revenue</p>
                            <p className="font-semibold text-gray-900">{car.totalRevenue.toLocaleString()} MAD</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Rating</p>
                            <div className="flex items-center justify-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                              <p className="font-semibold text-gray-900">{car.averageRating || 'N/A'}</p>
                            </div>
                          </div>
                        </div>

                        {car.location && (
                          <p className="text-sm text-gray-600 mb-4">📍 {car.location}</p>
                        )}

                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleEditCar(car)}
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleToggleCarStatus(car.id, !car.isActive)}
                            disabled={updatingCar === car.id}
                            className={car.isActive ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}
                          >
                            {updatingCar === car.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : car.isActive ? (
                              <>
                                <XCircle className="w-4 h-4 mr-1" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Activate
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteCar(car.id)}
                            disabled={updatingCar === car.id}
                            className="text-red-600 hover:bg-red-50"
                          >
                            {updatingCar === car.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">All Bookings</h3>
                
                {dashboardData?.bookings.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No bookings yet</p>
                    <p>Your bookings will appear here once customers start booking your cars</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData?.bookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{booking.customerName}</p>
                              <p className="text-sm text-gray-600">{booking.carMake} {booking.carModel} {booking.carYear}</p>
                              <p className="text-sm text-gray-500">
                                {format(booking.pickupDatetime, 'MMM dd, yyyy')} - {format(booking.dropoffDatetime, 'MMM dd, yyyy')}
                              </p>
                              <p className="text-xs text-gray-400">Ref: {booking.bookingReference}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">{booking.totalPrice.toLocaleString()} MAD</p>
                              <span className={cn(
                                "inline-block px-2 py-1 rounded text-xs font-medium",
                                getBookingStatusColor(booking.status)
                              )}>
                                {booking.status}
                              </span>
                              <p className="text-xs text-gray-500 mt-1">Payment: {booking.paymentStatus}</p>
                            </div>
                          </div>
                          
                          {booking.specialRequests && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                              <strong>Special requests:</strong> {booking.specialRequests}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col space-y-2 ml-6">
                          {/* Status update buttons */}
                          {booking.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleBookingStatusUpdate(booking.id, 'confirmed')}
                                disabled={updatingBooking === booking.id}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                {updatingBooking === booking.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                                Confirm
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleBookingStatusUpdate(booking.id, 'cancelled')}
                                disabled={updatingBooking === booking.id}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4" />
                                Cancel
                              </Button>
                            </>
                          )}
                          
                          {booking.status === 'confirmed' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleBookingStatusUpdate(booking.id, 'completed')}
                              disabled={updatingBooking === booking.id}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {updatingBooking === booking.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              Complete
                            </Button>
                          )}
                          
                          {/* Contact customer */}
                          {booking.customerPhone && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={`tel:${booking.customerPhone}`}>
                                <span className="text-xs">📞 Call</span>
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Calendar Tab */}
            {activeTab === 'calendar' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Calendar View</h3>
                      <p className="text-gray-600">Visualize your bookings and manage availability</p>
                    </div>
                  </div>
                  
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading calendar...</p>
                    </div>
                  ) : (
                    <BookingCalendar
                      bookings={dashboardData?.bookings.map(booking => ({
                        id: booking.id,
                        bookingReference: booking.bookingReference,
                        customerName: booking.customerName,
                        customerEmail: booking.customerEmail,
                        customerPhone: booking.customerPhone,
                        pickupDatetime: booking.pickupDatetime.toISOString(),
                        dropoffDatetime: booking.dropoffDatetime.toISOString(),
                        status: booking.status as 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled',
                        totalPrice: booking.totalPrice,
                        carId: '', // Not available from agency booking data
                        carMake: booking.carMake,
                        carModel: booking.carModel,
                        carYear: booking.carYear,
                        specialRequests: booking.specialRequests || undefined
                      })) || []}
                      cars={dashboardData?.cars.map(car => ({
                        id: car.id,
                        make: car.make,
                        model: car.model,
                        year: car.year,
                        category: car.category
                      })) || []}
                      loading={loading}
                      onDateClick={(date) => {
                        console.log('Date clicked:', date);
                        // TODO: Add functionality for date click (e.g., create new booking)
                      }}
                      onBookingClick={(booking) => {
                        console.log('Booking clicked:', booking);
                        // TODO: Add functionality for booking click (e.g., view/edit booking)
                      }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Agency Settings</h3>
                
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Agency Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input placeholder="Agency Name" value={user?.name} />
                      <Input placeholder="Contact Email" value={user?.email} />
                      <Input placeholder="Phone Number" value={user?.phone} />
                      <Input placeholder="License Number" />
                    </div>
                  </div>

                  <div className="border-b border-gray-200 pb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Location</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input placeholder="Address" />
                      <Input placeholder="City" />
                      <Input placeholder="Postal Code" />
                      <Input placeholder="Country" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Business Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Accept online bookings</span>
                        <input type="checkbox" className="rounded" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Instant booking confirmation</span>
                        <input type="checkbox" className="rounded" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Email notifications</span>
                        <input type="checkbox" className="rounded" defaultChecked />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button className="bg-green-600 hover:bg-green-700">
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* Car Management Modal */}
      {token && (
        <CarManagementModal
          isOpen={carModalOpen}
          onClose={handleCarModalClose}
          onSuccess={handleCarModalSuccess}
          car={editingCar as Car | null}
          token={token}
        />
      )}
    </div>
  );
}

export default AgencyDashboardPage;
