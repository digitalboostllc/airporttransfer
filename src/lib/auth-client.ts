// Client-side authentication utilities using API routes
// This replaces direct Prisma calls with API requests

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'customer' | 'agency_owner' | 'agency_staff' | 'admin';
  agencyId?: string;
  createdAt: Date;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: 'customer' | 'agency_owner';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Register user via API
export async function registerUser(data: RegisterData): Promise<{ user: User; token: string } | null> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Registration error:', error.error);
      return null;
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Registration error:', error);
    return null;
  }
}

// Login user via API
export async function loginUser(credentials: LoginCredentials): Promise<{ user: User; token: string } | null> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Login error:', error.error);
      return null;
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

// Get current user via API
export async function getCurrentUser(token: string): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

// Verify token and get user
export async function verifyToken(token: string): Promise<User | null> {
  return getCurrentUser(token);
}

// Update user profile via API
export async function updateUserProfile(
  token: string,
  profileData: {
    name: string;
    phone?: string;
    dateOfBirth?: string;
    drivingLicenseNumber?: string;
    drivingLicenseExpiry?: string;
  }
): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Update profile error:', error.error);
      return null;
    }

    const result = await response.json();
    return result.user;
  } catch (error) {
    console.error('Update profile error:', error);
    return null;
  }
}
