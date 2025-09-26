'use client';

import React from 'react';
import { Phone, User, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import VenbooLogo from '@/components/VenbooLogo';

interface HeaderProps {
  variant?: 'hero' | 'page';
  className?: string;
}

export default function Header({ variant = 'page', className = '' }: HeaderProps) {
  const { user, logout } = useAuth();

  const headerClasses = variant === 'hero' 
    ? "relative z-50 pt-4 pb-4"
    : "relative z-50 py-4 bg-white border-b border-gray-200";

  const containerClasses = variant === 'hero'
    ? "bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg px-6 py-3"
    : "bg-white px-6 py-3";

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <header className={`${headerClasses} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={containerClasses}>
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity group">
              <VenbooLogo size={32} className="group-hover:scale-105 transition-transform duration-300" />
              <div>
                <div className="text-lg font-bold text-gray-800 tracking-tight">Venboo</div>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-4">
              <Link href="/" className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-red-500 transition-all duration-300 text-sm font-medium">
                Home
              </Link>
              <Link href="/cars" className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-red-500 transition-all duration-300 text-sm font-medium">
                Car Rental
              </Link>
              <Link href="/#services" className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-red-500 transition-all duration-300 text-sm font-medium">
                Services
              </Link>
              <Link href="/#about" className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-red-500 transition-all duration-300 text-sm font-medium">
                About
              </Link>
              <Link href="/#contact" className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-red-500 transition-all duration-300 text-sm font-medium">
                Contact
              </Link>
            </nav>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Mobile menu links - visible only on small screens */}
              <div className="md:hidden flex items-center space-x-1">
                <Link href="/" className="px-2 py-1 text-xs font-medium text-gray-700 hover:text-red-500 transition-colors">
                  Home
                </Link>
                <span className="text-gray-300">•</span>
                <Link href="/cars" className="px-2 py-1 text-xs font-medium text-gray-700 hover:text-red-500 transition-colors">
                  Cars
                </Link>
                <span className="text-gray-300">•</span>
                <Link href="/#services" className="px-2 py-1 text-xs font-medium text-gray-700 hover:text-red-500 transition-colors">
                  Services
                </Link>
                <span className="text-gray-300">•</span>
                <Link href="/#about" className="px-2 py-1 text-xs font-medium text-gray-700 hover:text-red-500 transition-colors">
                  About
                </Link>
              </div>
              
              {/* Authentication Section */}
              {user ? (
                <div className="flex items-center space-x-2">
                  {/* User Info */}
                  <div className="hidden sm:flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700 text-xs font-medium">
                      Welcome, {user.name?.split(' ')[0]}
                    </span>
                  </div>

                  {/* Profile Button */}
                  <Link 
                    href="/profile"
                    className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all duration-300 border border-gray-200"
                    title="Profile"
                  >
                    <User className="w-4 h-4 text-gray-600" />
                  </Link>

                  {/* Admin Dashboard Link (if admin) */}
                  {user.role === 'admin' && (
                    <Link
                      href="/admin/dashboard"
                      className="hidden sm:block px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-medium rounded-lg transition-all duration-300"
                    >
                      Admin Panel
                    </Link>
                  )}

                  {/* Agency Dashboard Link (if agency) */}
                  {user.role === 'agency_owner' && (
                    <Link
                      href="/agency/dashboard"
                      className="hidden sm:block px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-700 text-xs font-medium rounded-lg transition-all duration-300"
                    >
                      Dashboard
                    </Link>
                  )}

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-9 h-9 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition-all duration-300 border border-red-200"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  {/* Contact Info */}
                  <div className="hidden sm:flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-700 text-xs font-semibold">Available 24/7</span>
                  </div>
                  
                  {/* Phone Button */}
                  <a 
                    href="tel:+212600000000" 
                    className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all duration-300 border border-gray-200"
                    title="+212 6 00 00 00 00"
                  >
                    <Phone className="w-4 h-4 text-gray-600" />
                  </a>

                  {/* Login Button */}
                  <Link href="/login">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 px-3 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      <span className="hidden sm:inline">Sign In</span>
                      <User className="w-4 h-4 sm:hidden" />
                    </Button>
                  </Link>

                  {/* Register Button */}
                  <Link href="/register">
                    <Button
                      size="sm"
                      className="h-9 px-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                    >
                      <span className="hidden sm:inline">Sign Up</span>
                      <Settings className="w-4 h-4 sm:hidden" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
