'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  Settings, 
  Car, 
  Calendar, 
  CreditCard,
  LogOut,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth, withAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/lib/auth-client';
import { getUserBookings, cancelBooking, type Booking } from '@/lib/bookings';
import { sendBookingCancellation } from '@/lib/notifications';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { format, differenceInDays } from 'date-fns';
import Image from 'next/image';

function ProfilePage() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: '',
    drivingLicenseNumber: '',
    drivingLicenseExpiry: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSaveProfile = async () => {
    if (!user || !token) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await updateUserProfile(token, {
        name: profileData.name,
        phone: profileData.phone,
        dateOfBirth: profileData.dateOfBirth,
        drivingLicenseNumber: profileData.drivingLicenseNumber,
        drivingLicenseExpiry: profileData.drivingLicenseExpiry
      });
      
      if (result) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setError('An error occurred while updating your profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: '',
      drivingLicenseNumber: '',
      drivingLicenseExpiry: ''
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Load user bookings
  const loadBookings = useCallback(async () => {
    if (!user) return;
    
    setBookingsLoading(true);
    try {
      const userBookings = await getUserBookings(user.id);
      setBookings(userBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setBookingsLoading(false);
    }
  }, [user]);

  // Load bookings when user visits bookings tab
  useEffect(() => {
    if (activeTab === 'bookings' && user) {
      loadBookings();
    }
  }, [activeTab, user, loadBookings]);

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId: string) => {
    if (!user) return;
    
    const confirmed = window.confirm('Are you sure you want to cancel this booking?');
    if (!confirmed) return;

    try {
      // Find the booking to get its details for the email
      const bookingToCancel = bookings.find(b => b.id === bookingId);
      
      const result = await cancelBooking(bookingId, user.id);
      if (result.success) {
        // Send cancellation email if we have the booking details
        if (bookingToCancel) {
          sendBookingCancellation(bookingToCancel, user).catch(error => 
            console.error('Cancellation email failed:', error)
          );
        }
        
        setSuccess('Booking cancelled successfully. A confirmation email has been sent.');
        setError(''); // Clear any existing errors
        loadBookings(); // Reload bookings
      } else {
        setError(result.error || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Cancel booking error:', error);
      setError('An error occurred while cancelling the booking');
    }
  };

  // Get booking status styling
  const getBookingStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="page" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
              <p className="text-red-100 mt-2">
                {user?.role === 'agency_owner' ? 'Manage your agency and fleet' : 'Manage your bookings and profile'}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <User className="w-12 h-12" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-red-50 text-red-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-5 h-5 mr-3" />
                  Profile
                </button>
                
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === 'bookings'
                      ? 'bg-red-50 text-red-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Car className="w-5 h-5 mr-3" />
                  My Bookings
                </button>
                
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-red-50 text-red-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Settings
                </button>

                {user?.role === 'agency_owner' && (
                  <button
                    onClick={() => router.push('/agency/dashboard')}
                    className="w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors text-gray-600 hover:bg-gray-50"
                  >
                    <CreditCard className="w-5 h-5 mr-3" />
                    Agency Dashboard
                  </button>
                )}
                
                <hr className="my-4 border-gray-200" />
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                    {!isEditing ? (
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        className="flex items-center"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveProfile}
                          disabled={loading}
                          className="flex items-center bg-green-600 hover:bg-green-700"
                        >
                          {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          variant="outline"
                          className="flex items-center"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Success/Error Messages */}
                  {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-600 text-sm">{success}</p>
                    </div>
                  )}
                  {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {user?.role === 'agency_owner' ? 'Agency Name' : 'Full Name'}
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          name="name"
                          value={profileData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="pl-10 h-12"
                          placeholder="Enter your name"
                        />
                      </div>
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          name="email"
                          type="email"
                          value={profileData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="pl-10 h-12"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    {/* Phone Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          name="phone"
                          value={profileData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="pl-10 h-12"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>

                    {/* Account Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Type
                      </label>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center">
                          {user?.role === 'agency_owner' ? (
                            <>
                              <CreditCard className="w-5 h-5 text-orange-500 mr-3" />
                              <span className="font-medium text-gray-900">Agency Account</span>
                              <span className="ml-auto bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                                Business
                              </span>
                            </>
                          ) : (
                            <>
                              <User className="w-5 h-5 text-blue-500 mr-3" />
                              <span className="font-medium text-gray-900">Customer Account</span>
                              <span className="ml-auto bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                Personal
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Member Since */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Member Since
                      </label>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-gray-900">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bookings Tab */}
              {activeTab === 'bookings' && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h2>
                  
                  {/* Success/Error Messages */}
                  {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-600 text-sm">{success}</p>
                    </div>
                  )}
                  {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}
                  
                  {bookingsLoading ? (
                    <div className="text-center py-12">
                      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading your bookings...</p>
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-12">
                      <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                      <p className="text-gray-500 mb-6">Start exploring cars to make your first booking</p>
                      <Button 
                        onClick={() => router.push('/cars')}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Browse Cars
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {bookings.map((booking) => (
                        <div key={booking.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                  src={booking.car.images[0] || '/placeholder-car.png'}
                                  alt={`${booking.car.make} ${booking.car.model}`}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {booking.car.make} {booking.car.model} {booking.car.year}
                                </h3>
                                <p className="text-sm text-gray-600">{booking.car.agency.name}</p>
                                <p className="text-sm text-gray-500">
                                  {format(booking.pickupDatetime, 'MMM dd')} - {format(booking.dropoffDatetime, 'MMM dd, yyyy')}
                                </p>
                                <p className="text-sm text-gray-500">
                                  📍 Pickup Location
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:items-end gap-3">
                              <div className="text-right">
                                <div className="text-lg font-bold text-gray-900">{booking.totalPrice} MAD</div>
                                <div className="text-sm text-gray-500">
                                  {differenceInDays(booking.dropoffDatetime, booking.pickupDatetime)} days
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize ${getBookingStatusColor(booking.status)}`}>
                                  {booking.status}
                                </span>
                                {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleCancelBooking(booking.id)}
                                    className="text-xs"
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </div>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/cars/${booking.carId}`)}
                                className="text-xs"
                              >
                                View Car
                              </Button>
                            </div>
                          </div>
                          
                          {/* Booking Details */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Booking ID:</span>
                                <p className="text-gray-600">#{booking.id.slice(-8)}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Payment:</span>
                                <p className="text-gray-600 capitalize">{booking.paymentMethod}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Booked:</span>
                                <p className="text-gray-600">{format(booking.createdAt, 'MMM dd, yyyy')}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Category:</span>
                                <p className="text-gray-600 capitalize">{booking.car.category}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Security</h3>
                      <div className="space-y-4">
                        <Button variant="outline" className="w-full justify-start">
                          Change Password
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          Two-Factor Authentication
                        </Button>
                      </div>
                    </div>

                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Email notifications</span>
                          <input type="checkbox" className="rounded" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">SMS notifications</span>
                          <input type="checkbox" className="rounded" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Marketing emails</span>
                          <input type="checkbox" className="rounded" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 text-red-600">Danger Zone</h3>
                      <Button variant="destructive" className="w-full">
                        Delete Account
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        This action cannot be undone. All your data will be permanently deleted.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default withAuth(ProfilePage);
