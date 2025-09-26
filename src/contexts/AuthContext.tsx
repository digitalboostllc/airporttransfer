'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, verifyToken } from '@/lib/auth-client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount and verify token
  useEffect(() => {
    const loadUser = async () => {
      const savedToken = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('auth_user');

      if (savedToken && savedUser) {
        try {
          // Verify token with server
          const verifiedUser = await verifyToken(savedToken);
          
          if (verifiedUser) {
            setUser(verifiedUser);
            setToken(savedToken);
            // Update localStorage with fresh user data
            localStorage.setItem('auth_user', JSON.stringify(verifiedUser));
          } else {
            // Token is invalid, clear localStorage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
          }
        } catch (error) {
          console.error('Error verifying token:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      }
      
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = (userData: User, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    
    // Save to localStorage
    localStorage.setItem('auth_token', userToken);
    localStorage.setItem('auth_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    
    // Remove from localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      // Redirect to login
      window.location.href = '/login';
      return null;
    }

    return <Component {...props} />;
  };
}

// Hook for role-based access
export function useRequireAuth(requiredRole?: 'customer' | 'agency_owner' | 'admin') {
  const { user } = useAuth();

  if (!user) {
    return { hasAccess: false, user: null, message: 'Authentication required' };
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return { 
      hasAccess: false, 
      user, 
      message: `${requiredRole} role required` 
    };
  }

  return { hasAccess: true, user, message: '' };
}
