'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Car, 
  Plus, 
  Calendar, 
  DollarSign, 
  Edit3,
  Trash2,
  Eye,
  Settings,
  BarChart3,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRequireAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// Mock data for agency dashboard
const mockAgencyData = {
  stats: {
    totalCars: 24,
    activeBookings: 12,
    totalRevenue: 45670,
    averageRating: 4.7
  },
  recentBookings: [
    {
      id: '1',
      customerName: 'Ahmed Benali',
      carModel: 'Renault Clio 2023',
      dates: 'Dec 15-18, 2024',
      status: 'confirmed',
      amount: 540
    },
    {
      id: '2',
      customerName: 'Sarah Johnson',
      carModel: 'Mercedes A-Class 2024',
      dates: 'Dec 20-25, 2024',
      status: 'pending',
      amount: 1140
    },
    {
      id: '3',
      customerName: 'Mohamed Alami',
      carModel: 'Peugeot 308 2024',
      dates: 'Dec 10-12, 2024',
      status: 'completed',
      amount: 440
    }
  ],
  cars: [
    {
      id: '1',
      make: 'Renault',
      model: 'Clio',
      year: 2023,
      category: 'economy',
      pricePerDay: 180,
      status: 'available',
      bookings: 15,
      revenue: 4500,
      rating: 4.5,
      image: '/renault-clio.jpg'
    },
    {
      id: '2',
      make: 'Mercedes-Benz',
      model: 'A-Class',
      year: 2024,
      category: 'luxury',
      pricePerDay: 380,
      status: 'rented',
      bookings: 8,
      revenue: 6840,
      rating: 4.9,
      image: '/mercedes-a-class.jpg'
    },
    {
      id: '3',
      make: 'Peugeot',
      model: '308',
      year: 2024,
      category: 'compact',
      pricePerDay: 220,
      status: 'maintenance',
      bookings: 12,
      revenue: 3960,
      rating: 4.6,
      image: '/peugeot-308.jpg'
    }
  ]
};

function AgencyDashboardPage() {
  const router = useRouter();
  const { hasAccess, user } = useRequireAuth('agency_owner');
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4">
            <Car className="w-16 h-16 text-red-500 mx-auto mb-4" />
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

  const filteredCars = mockAgencyData.cars.filter(car =>
    `${car.make} ${car.model}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <Car className="w-12 h-12" />
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
                  <Car className="w-5 h-5 mr-3" />
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
                  <Calendar className="w-5 h-5 mr-3" />
                  Bookings
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
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="bg-blue-100 rounded-lg p-3 mr-4">
                        <Car className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Cars</p>
                        <p className="text-2xl font-bold text-gray-900">{mockAgencyData.stats.totalCars}</p>
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
                        <p className="text-2xl font-bold text-gray-900">{mockAgencyData.stats.activeBookings}</p>
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
                        <p className="text-2xl font-bold text-gray-900">{mockAgencyData.stats.totalRevenue.toLocaleString()} MAD</p>
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
                        <p className="text-2xl font-bold text-gray-900">{mockAgencyData.stats.averageRating}</p>
                      </div>
                    </div>
                  </div>
                </div>

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
                    {mockAgencyData.recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{booking.customerName}</p>
                          <p className="text-sm text-gray-600">{booking.carModel}</p>
                          <p className="text-sm text-gray-500">{booking.dates}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{booking.amount} MAD</p>
                          <span className={cn(
                            "inline-block px-2 py-1 rounded text-xs font-medium",
                            getBookingStatusColor(booking.status)
                          )}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))}
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
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Car
                  </Button>
                </div>

                {/* Cars Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredCars.map((car) => (
                    <div key={car.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={car.image || '/placeholder-car.png'}
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
                        <span className={cn(
                          "inline-block px-2 py-1 rounded text-xs font-medium capitalize",
                          getStatusColor(car.status)
                        )}>
                          {car.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Bookings</p>
                          <p className="font-semibold text-gray-900">{car.bookings}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Revenue</p>
                          <p className="font-semibold text-gray-900">{car.revenue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Rating</p>
                          <div className="flex items-center justify-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                            <p className="font-semibold text-gray-900">{car.rating}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">All Bookings</h3>
                
                <div className="space-y-4">
                  {mockAgencyData.recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900">{booking.customerName}</p>
                        <p className="text-sm text-gray-600">{booking.carModel}</p>
                        <p className="text-sm text-gray-500">{booking.dates}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{booking.amount} MAD</p>
                          <span className={cn(
                            "inline-block px-2 py-1 rounded text-xs font-medium",
                            getBookingStatusColor(booking.status)
                          )}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
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
    </div>
  );
}

export default AgencyDashboardPage;
