'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Phone, Building2, ArrowRight, CheckCircle } from 'lucide-react';
import TransferLogo from '@/components/TransferLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { registerUser } from '@/lib/auth-client';
import { createPendingAgency } from '@/lib/agency-client';
import { cn } from '@/lib/utils';

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const [accountType, setAccountType] = useState<'user' | 'agency'>('user');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    // Agency-specific fields
    address: '',
    city: '',
    licenseNumber: '',
    description: '',
    websiteUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check URL params for account type
  useEffect(() => {
    const type = searchParams?.get('type');
    if (type === 'agency') {
      setAccountType('agency');
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? e.target.checked : false;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.phone.trim()) return 'Phone number is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!formData.agreeToTerms) return 'You must agree to the terms and conditions';
    
    // Agency-specific validations
    if (accountType === 'agency') {
      if (!formData.address.trim()) return 'Address is required for agencies';
      if (!formData.city.trim()) return 'City is required for agencies';
      if (!formData.description.trim()) return 'Description is required for agencies';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'Please enter a valid email address';
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const result = await registerUser({
        email: formData.email.trim(),
        password: formData.password,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        role: accountType === 'agency' ? 'agency_owner' : 'customer'
      });
      
      if (result) {
        // If registering as agency, create the agency
        if (accountType === 'agency') {
          const agencyResult = await createPendingAgency(result.user.id, {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            licenseNumber: formData.licenseNumber.trim() || undefined,
            description: formData.description.trim(),
            websiteUrl: formData.websiteUrl.trim() || undefined
          });
          
          if (!agencyResult.success) {
            setError(agencyResult.error || 'Failed to create agency');
            setLoading(false);
            return;
          }
        }

        login(result.user, result.token);
        
        // Redirect based on account type
        if (accountType === 'agency') {
          router.push('/agency/dashboard?registered=true');
        } else {
          router.push('/profile');
        }
      } else {
        setError('Registration failed. Email may already be in use.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-orange-600">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{backgroundImage: 'url(/morocco-hero-bg.jpg)'}}
      ></div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-lg w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center text-white hover:text-orange-200 transition-colors">
              <TransferLogo 
                size={40} 
                showText={true}
                textClassName="text-2xl text-white"
                iconClassName="shadow-xl"
              />
            </Link>
            <h1 className="mt-6 text-3xl font-bold text-white">
              Create your account
            </h1>
            <p className="mt-2 text-white/80">
              Join thousands of users finding their perfect car
            </p>
          </div>

          {/* Account Type Selection */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Account Type</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setAccountType('user')}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all duration-200 text-center",
                    accountType === 'user'
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  )}
                >
                  <User className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-medium">Customer</div>
                  <div className="text-xs text-gray-500">Rent cars</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setAccountType('agency')}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all duration-200 text-center",
                    accountType === 'agency'
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  )}
                >
                  <Building2 className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-medium">Agency</div>
                  <div className="text-xs text-gray-500">List cars</div>
                </button>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  {accountType === 'agency' ? 'Agency Name' : 'Full Name'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {accountType === 'agency' ? (
                      <Building2 className="h-5 w-5 text-gray-400" />
                    ) : (
                      <User className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10 h-11 border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder={accountType === 'agency' ? 'Enter agency name' : 'Enter your full name'}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 h-11 border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-10 h-11 border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="+212 6XX XX XX XX"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10 h-11 border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Create a password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 pr-10 h-11 border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Confirm your password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Agency-Specific Fields */}
              {accountType === 'agency' && (
                <>
                  <div className="border-t border-gray-200 pt-5 mt-5">
                    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                      <Building2 className="w-5 h-5 mr-2 text-orange-600" />
                      Agency Information
                    </h4>
                  </div>

                  {/* Address Field */}
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Business Address *
                    </label>
                    <Input
                      id="address"
                      name="address"
                      type="text"
                      required={accountType === 'agency'}
                      value={formData.address}
                      onChange={handleChange}
                      className="h-11 border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter your business address"
                    />
                  </div>

                  {/* City Field */}
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      required={accountType === 'agency'}
                      value={formData.city}
                      onChange={handleChange}
                      className="h-11 border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter your city"
                    />
                  </div>

                  {/* License Number Field */}
                  <div>
                    <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Business License Number (Optional)
                    </label>
                    <Input
                      id="licenseNumber"
                      name="licenseNumber"
                      type="text"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="h-11 border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter your license number"
                    />
                  </div>

                  {/* Website URL Field */}
                  <div>
                    <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-2">
                      Website URL (Optional)
                    </label>
                    <Input
                      id="websiteUrl"
                      name="websiteUrl"
                      type="url"
                      value={formData.websiteUrl}
                      onChange={handleChange}
                      className="h-11 border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="https://your-agency-website.com"
                    />
                  </div>

                  {/* Description Field */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Agency Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      required={accountType === 'agency'}
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Describe your agency, services, and what makes you unique..."
                    />
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex">
                      <Building2 className="w-5 h-5 text-orange-500 mr-2 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-orange-800">Agency Registration</p>
                        <p className="text-orange-700 mt-1">
                          Your agency registration will be reviewed by our team. You&apos;ll receive an email notification once it&apos;s approved.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                    required
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agreeToTerms" className="text-gray-700">
                    I agree to the{' '}
                    <Link href="/terms" className="font-medium text-red-600 hover:text-red-500">
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="font-medium text-red-600 hover:text-red-500">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold text-base"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Create {accountType === 'agency' ? 'Agency' : ''} Account
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </div>
                )}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-red-600 hover:text-red-500">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-white/60 text-xs">
              © 2024 CarRental. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
