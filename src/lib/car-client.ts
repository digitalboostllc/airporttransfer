'use client';

export interface CarData {
  make: string;
  model: string;
  year: number;
  category: string;
  pricePerDay: number;
  images?: string[];
  features?: string[];
  specifications?: Record<string, any>;
  location?: string;
  description?: string;
  status?: 'available' | 'rented' | 'maintenance';
  isActive?: boolean;
}

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  category: string;
  pricePerDay: number;
  images: string[];
  features: string[];
  specifications: Record<string, any>;
  location: string;
  description: string;
  status: string;
  isActive: boolean;
  totalBookings?: number;
  totalRevenue?: number;
  averageRating?: number;
  agency?: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CarFilters {
  agencyId?: string;
  city?: string;
  category?: string;
  available?: boolean;
  limit?: number;
}

// Get all cars with optional filters
export async function getCars(filters?: CarFilters): Promise<Car[]> {
  try {
    const params = new URLSearchParams();
    
    if (filters?.agencyId) params.append('agencyId', filters.agencyId);
    if (filters?.city) params.append('city', filters.city);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.available !== undefined) params.append('available', filters.available.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`/api/cars?${params.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to fetch cars');
    }

    const cars = await response.json();
    
    // Convert date strings to Date objects
    return cars.map((car: any) => ({
      ...car,
      createdAt: new Date(car.createdAt),
      updatedAt: new Date(car.updatedAt)
    }));
  } catch (error) {
    console.error('Get cars error:', error);
    return [];
  }
}

// Get car by ID
export async function getCarById(carId: string): Promise<Car | null> {
  try {
    const response = await fetch(`/api/cars/${carId}`);

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch car');
    }

    const car = await response.json();
    
    return {
      ...car,
      createdAt: new Date(car.createdAt),
      updatedAt: new Date(car.updatedAt)
    };
  } catch (error) {
    console.error('Get car by ID error:', error);
    return null;
  }
}

// Create new car (agency only)
export async function createCar(token: string, carData: CarData): Promise<{ success: boolean; car?: Car; error?: string }> {
  try {
    const response = await fetch('/api/cars', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(carData)
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to create car' };
    }

    return { 
      success: true, 
      car: {
        ...data.car,
        createdAt: new Date(data.car.createdAt),
        updatedAt: new Date(data.car.updatedAt)
      }
    };
  } catch (error) {
    console.error('Create car error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

// Update car (agency only)
export async function updateCar(
  token: string, 
  carId: string, 
  carData: Partial<CarData>
): Promise<{ success: boolean; car?: Car; error?: string }> {
  try {
    const response = await fetch(`/api/cars/${carId}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(carData)
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to update car' };
    }

    return { 
      success: true, 
      car: {
        ...data.car,
        createdAt: new Date(data.car.createdAt),
        updatedAt: new Date(data.car.updatedAt)
      }
    };
  } catch (error) {
    console.error('Update car error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

// Delete car (agency only)
export async function deleteCar(token: string, carId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/cars/${carId}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.error || 'Failed to delete car' };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete car error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

// Toggle car active status
export async function toggleCarStatus(token: string, carId: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/cars/${carId}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ isActive })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to update car status' };
    }

    return { success: true };
  } catch (error) {
    console.error('Toggle car status error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

// Update car availability status
export async function updateCarStatus(
  token: string, 
  carId: string, 
  status: 'available' | 'rented' | 'maintenance'
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/cars/${carId}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to update car status' };
    }

    return { success: true };
  } catch (error) {
    console.error('Update car status error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

// Car categories for form dropdown
export const CAR_CATEGORIES = [
  { value: 'economy', label: 'Economy' },
  { value: 'compact', label: 'Compact' },
  { value: 'midsize', label: 'Midsize' },
  { value: 'fullsize', label: 'Full Size' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'suv', label: 'SUV' },
  { value: 'minivan', label: 'Minivan' },
  { value: 'convertible', label: 'Convertible' },
  { value: 'sports', label: 'Sports Car' }
];

// Car makes for form dropdown
export const CAR_MAKES = [
  'Audi', 'BMW', 'Chevrolet', 'Citroen', 'Dacia', 'Fiat', 
  'Ford', 'Honda', 'Hyundai', 'Kia', 'Mazda', 'Mercedes-Benz', 
  'Nissan', 'Peugeot', 'Renault', 'Seat', 'Skoda', 'Toyota', 
  'Volkswagen', 'Volvo', 'Other'
];

// Common car features
export const CAR_FEATURES = [
  'Air Conditioning', 'Heating', 'Bluetooth', 'USB Charging',
  'GPS Navigation', 'Backup Camera', 'Parking Sensors', 'Cruise Control',
  'Keyless Entry', 'Push Start', 'Sunroof', 'Leather Seats',
  'Power Windows', 'Power Steering', 'ABS Brakes', 'Airbags',
  'Child Safety Locks', 'ISOFIX', '4WD/AWD', 'Manual Transmission',
  'Automatic Transmission', 'Hybrid', 'Electric'
];
