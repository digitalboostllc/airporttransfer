'use client';

import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Car, 
  Clock, 
  User,
  Phone,
  Mail,
  Filter,
  X,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO,
  isWithinInterval,
  differenceInDays
} from 'date-fns';

interface Booking {
  id: string;
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupDatetime: string;
  dropoffDatetime: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  totalPrice: number;
  carId: string;
  carMake: string;
  carModel: string;
  carYear: number;
  specialRequests?: string;
}

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  category: string;
}

interface BookingCalendarProps {
  bookings: Booking[];
  cars: Car[];
  loading?: boolean;
  onDateClick?: (date: Date) => void;
  onBookingClick?: (booking: Booking) => void;
  className?: string;
}

const BookingModal = ({ booking, isOpen, onClose }: { 
  booking: Booking | null; 
  isOpen: boolean; 
  onClose: () => void; 
}) => {
  if (!isOpen || !booking) return null;

  const pickupDate = parseISO(booking.pickupDatetime);
  const dropoffDate = parseISO(booking.dropoffDatetime);
  const duration = differenceInDays(dropoffDate, pickupDate) + 1;

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    completed: 'bg-gray-100 text-gray-800 border-gray-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <CalendarIcon className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Booking Details
              </h2>
              <p className="text-sm text-gray-600">
                {booking.bookingReference}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Status</span>
            <span className={cn(
              "px-3 py-1 rounded-full text-sm font-medium border capitalize",
              statusColors[booking.status]
            )}>
              {booking.status}
            </span>
          </div>

          {/* Car Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Car className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="font-medium text-gray-900">Vehicle</h3>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {booking.carMake} {booking.carModel} {booking.carYear}
            </p>
          </div>

          {/* Customer Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <User className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="font-medium text-gray-900">Customer</h3>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-gray-900">{booking.customerName}</p>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                {booking.customerEmail}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                {booking.customerPhone}
              </div>
            </div>
          </div>

          {/* Booking Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <MapPin className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-900">Pickup</span>
              </div>
              <p className="text-sm text-green-800">
                {format(pickupDate, 'PPP')}
              </p>
              <p className="text-sm text-green-800">
                {format(pickupDate, 'p')}
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Clock className="w-4 h-4 text-orange-600 mr-2" />
                <span className="text-sm font-medium text-orange-900">Drop-off</span>
              </div>
              <p className="text-sm text-orange-800">
                {format(dropoffDate, 'PPP')}
              </p>
              <p className="text-sm text-orange-800">
                {format(dropoffDate, 'p')}
              </p>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-3">Booking Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Duration:</span>
                <p className="font-medium text-blue-900">{duration} day{duration > 1 ? 's' : ''}</p>
              </div>
              <div>
                <span className="text-blue-700">Total Amount:</span>
                <p className="font-medium text-blue-900">{booking.totalPrice} MAD</p>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          {booking.specialRequests && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Special Requests</h3>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                {booking.specialRequests}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => {
            // TODO: Add booking management actions
            console.log('Manage booking:', booking.id);
          }}>
            Manage Booking
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function BookingCalendar({
  bookings,
  cars,
  loading = false,
  onDateClick,
  onBookingClick,
  className = ''
}: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [filterCar, setFilterCar] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  // Generate calendar days
  const days = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    if (filterCar !== 'all' && booking.carId !== filterCar) return false;
    if (filterStatus !== 'all' && booking.status !== filterStatus) return false;
    return true;
  });

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date) => {
    return filteredBookings.filter(booking => {
      const pickupDate = parseISO(booking.pickupDatetime);
      const dropoffDate = parseISO(booking.dropoffDatetime);
      
      return isWithinInterval(date, {
        start: pickupDate,
        end: dropoffDate
      });
    });
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
    onBookingClick?.(booking);
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-200 text-yellow-800';
      case 'confirmed': return 'bg-blue-200 text-blue-800';
      case 'active': return 'bg-green-200 text-green-800';
      case 'completed': return 'bg-gray-200 text-gray-800';
      case 'cancelled': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className={cn("bg-white rounded-xl border border-gray-200 p-6", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-7 gap-2">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200", className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Booking Calendar
            </h2>
          </div>
          
          {/* Filters */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterCar}
                onChange={(e) => setFilterCar(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Cars</option>
                {cars.map(car => (
                  <option key={car.id} value={car.id}>
                    {car.make} {car.model}
                  </option>
                ))}
              </select>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousMonth}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <h3 className="text-lg font-medium text-gray-900">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Week days header */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map(day => {
            const dayBookings = getBookingsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-[100px] border border-gray-200 rounded-lg p-2 cursor-pointer transition-colors",
                  isCurrentMonth ? "bg-white hover:bg-gray-50" : "bg-gray-50",
                  isToday && "border-blue-500 bg-blue-50"
                )}
                onClick={() => onDateClick?.(day)}
              >
                <div className={cn(
                  "text-sm font-medium mb-1",
                  isCurrentMonth ? "text-gray-900" : "text-gray-400",
                  isToday && "text-blue-600"
                )}>
                  {format(day, 'd')}
                </div>
                
                {/* Bookings for this day */}
                <div className="space-y-1">
                  {dayBookings.slice(0, 2).map(booking => (
                    <div
                      key={booking.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookingClick(booking);
                      }}
                      className={cn(
                        "text-xs px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity",
                        getBookingStatusColor(booking.status)
                      )}
                      title={`${booking.carMake} ${booking.carModel} - ${booking.customerName}`}
                    >
                      <div className="truncate font-medium">
                        {booking.carMake} {booking.carModel}
                      </div>
                      <div className="truncate">
                        {booking.customerName}
                      </div>
                    </div>
                  ))}
                  
                  {dayBookings.length > 2 && (
                    <div className="text-xs text-gray-500 px-2">
                      +{dayBookings.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 pb-6">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-200 rounded mr-2"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-200 rounded mr-2"></div>
            <span>Confirmed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-200 rounded mr-2"></div>
            <span>Active</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-200 rounded mr-2"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-200 rounded mr-2"></div>
            <span>Cancelled</span>
          </div>
        </div>
      </div>

      {/* Booking Detail Modal */}
      <BookingModal
        booking={selectedBooking}
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedBooking(null);
        }}
      />
    </div>
  );
}
