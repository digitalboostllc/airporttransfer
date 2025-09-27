'use client';

export interface AgencyRegistrationData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  licenseNumber?: string;
  description?: string;
  websiteUrl?: string;
}

export interface AgencyStats {
  totalCars: number;
  activeBookings: number;
  totalRevenue: number;
  averageRating: number;
  completedBookings: number;
  pendingBookings: number;
}

export interface AgencyBooking {
  id: string;
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  carMake: string;
  carModel: string;
  carYear: number;
  pickupDatetime: Date;
  dropoffDatetime: Date;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  specialRequests?: string;
  createdAt: Date;
}

export interface AgencyCar {
  id: string;
  make: string;
  model: string;
  year: number;
  category: string;
  pricePerDay: number;
  status: string;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  images: string[];
  location: string;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgencyDashboardData {
  stats: AgencyStats;
  bookings: AgencyBooking[];
  cars: AgencyCar[];
  agency: {
    id: string;
    name: string;
    status: string;
  };
}

// Create pending agency (existing function)
export async function createPendingAgency(
  userId: string, 
  agencyData: AgencyRegistrationData
): Promise<{ success: boolean; agencyId?: string; error?: string }> {
  try {
    const response = await fetch('/api/agencies/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, agencyData })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Registration failed' };
    }

    return { success: true, agencyId: data.agencyId };
  } catch (error) {
    console.error('Create pending agency error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

// Get complete agency dashboard data
export async function getAgencyDashboardData(token: string): Promise<AgencyDashboardData | null> {
  try {
    const response = await fetch('/api/agency/dashboard?type=all', {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch dashboard data');
    }

    const data = await response.json();
    
    // Convert date strings back to Date objects
    return {
      ...data,
      bookings: data.bookings.map((booking: any) => ({
        ...booking,
        pickupDatetime: new Date(booking.pickupDatetime),
        dropoffDatetime: new Date(booking.dropoffDatetime),
        createdAt: new Date(booking.createdAt)
      })),
      cars: data.cars.map((car: any) => ({
        ...car,
        createdAt: new Date(car.createdAt),
        updatedAt: new Date(car.updatedAt)
      }))
    };
  } catch (error) {
    console.error('Get agency dashboard data error:', error);
    return null;
  }
}

// Get agency stats only
export async function getAgencyStats(token: string): Promise<AgencyStats | null> {
  try {
    const response = await fetch('/api/agency/dashboard?type=stats', {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }

    const data = await response.json();
    return data.stats;
  } catch (error) {
    console.error('Get agency stats error:', error);
    return null;
  }
}

// Get agency bookings only
export async function getAgencyBookings(token: string, limit?: number): Promise<AgencyBooking[]> {
  try {
    const url = `/api/agency/dashboard?type=bookings${limit ? `&limit=${limit}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }

    const data = await response.json();
    
    // Convert date strings to Date objects
    return data.bookings.map((booking: any) => ({
      ...booking,
      pickupDatetime: new Date(booking.pickupDatetime),
      dropoffDatetime: new Date(booking.dropoffDatetime),
      createdAt: new Date(booking.createdAt)
    }));
  } catch (error) {
    console.error('Get agency bookings error:', error);
    return [];
  }
}

// Get agency cars only
export async function getAgencyCars(token: string): Promise<AgencyCar[]> {
  try {
    const response = await fetch('/api/agency/dashboard?type=cars', {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cars');
    }

    const data = await response.json();
    
    // Convert date strings to Date objects
    return data.cars.map((car: any) => ({
      ...car,
      createdAt: new Date(car.createdAt),
      updatedAt: new Date(car.updatedAt)
    }));
  } catch (error) {
    console.error('Get agency cars error:', error);
    return [];
  }
}

// Update booking status
export async function updateBookingStatus(
  token: string, 
  bookingId: string, 
  status: 'confirmed' | 'cancelled' | 'completed' | 'in_progress'
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/agency/dashboard', {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bookingId, status })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Failed to update booking' };
    }

    return { success: true };
  } catch (error) {
    console.error('Update booking status error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}