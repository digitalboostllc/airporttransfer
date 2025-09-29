'use client';

import React, { useState } from 'react';
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TransferLogo from '@/components/TransferLogo';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-orange-600">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{backgroundImage: 'url(/morocco-hero-bg.jpg)'}}
        ></div>
        
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            {/* Header */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center text-white hover:text-orange-200 transition-colors">
                <TransferLogo 
                  size={48} 
                  showText={true}
                  textClassName="text-2xl font-bold text-white"
                  iconClassName="shadow-xl"
                />
              </Link>
              <h1 className="mt-6 text-3xl font-bold text-white">
                Check Your Email
              </h1>
              <p className="mt-2 text-white/80">
                We&apos;ve sent you a password reset link
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Reset Link Sent!
              </h2>
              
              <p className="text-gray-600 mb-6">
                If an account with <strong>{email}</strong> exists, you will receive a password reset link shortly.
              </p>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Didn&apos;t receive the email? Check your spam folder or try again.
                </p>
                
                <Button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  variant="outline"
                  className="w-full h-11 border-gray-300"
                >
                  Try Different Email
                </Button>
                
                <Link href="/login">
                  <Button className="w-full h-11 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-white/60 text-xs">
                © 2024 Venboo. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-orange-600">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{backgroundImage: 'url(/morocco-hero-bg.jpg)'}}
      ></div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center text-white hover:text-orange-200 transition-colors">
              <TransferLogo 
                size={48} 
                showText={true}
                textClassName="text-2xl font-bold text-white"
                iconClassName="shadow-xl"
              />
            </Link>
            <h1 className="mt-6 text-3xl font-bold text-white">
              Forgot Password?
            </h1>
            <p className="mt-2 text-white/80">
              No worries! Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          {/* Forgot Password Form */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-8">
            {/* Icon Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Reset Your Password
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter your email address"
                    className="pl-10 h-12 border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold text-base"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending Reset Link...
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link 
                href="/login"
                className="inline-flex items-center text-sm text-red-600 hover:text-red-500 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
              </Link>
            </div>

            {/* Help */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                Having trouble? Contact us at{' '}
                <a href="mailto:support@venboo.com" className="text-red-600 hover:text-red-500">
                  support@venboo.com
                </a>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-white/60 text-xs">
              © 2024 Venboo. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
