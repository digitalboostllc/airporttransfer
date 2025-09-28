'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Car as CarIcon, 
  Calendar, 
  MapPin, 
  Clock, 
  CreditCard,
  Shield,
  Check,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { createBooking } from '@/lib/bookings';
import { sendBookingConfirmation } from '@/lib/notifications';
import { getCarById, type Car } from '@/lib/car-client';
import PaymentForm from '@/components/PaymentForm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface BookingExtras {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: string;
}

const availableExtras: BookingExtras[] = [
  { id: 'gps', name: 'GPS Navigation', price: 50, description: 'Per rental', icon: '🗺️' },
  { id: 'child_seat', name: 'Child Seat', price: 80, description: 'Per rental', icon: '👶' },
  { id: 'extra_driver', name: 'Additional Driver', price: 120, description: 'Per rental', icon: '👤' },
  { id: 'wifi', name: 'Mobile WiFi', price: 100, description: 'Per rental', icon: '📶' },
  { id: 'insurance_full', name: 'Full Insurance', price: 200, description: 'Per rental', icon: '🛡️' },
  { id: 'delivery', name: 'Car Delivery', price: 150, description: 'To your location', icon: '🚚' }
];

// Car data will be loaded from API

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, token } = useAuth();

  // Booking state
  const [step, setStep] = useState(1); // 1: Details, 2: Review, 3: Payment, 4: Confirmation
  const [loading, setLoading] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  
  // Car data state
  const [car, setCar] = useState<Car | null>(null);
  const [carLoading, setCarLoading] = useState(true);
  const [carError, setCarError] = useState('');
  
  // Get booking details from URL
  const pickup_date = searchParams?.get('pickup_date');
  const return_date = searchParams?.get('return_date');
  const pickup_location = searchParams?.get('location') || 'Mohammed V Airport';

  const pickupDate = pickup_date ? new Date(pickup_date) : new Date();
  const returnDate = return_date ? new Date(return_date) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const rentalDays = Math.max(1, differenceInDays(returnDate, pickupDate));

  // Contact details state
  const [contactDetails, setContactDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    drivingLicense: '',
    additionalRequests: ''
  });

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    agreeToTerms: false
  });
  
  // Stripe payment state
  const [bookingId, setBookingId] = useState<string>('');
  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string>('');

  // Load car data
  useEffect(() => {
    const loadCar = async () => {
      if (!params.id) return;
      
      setCarLoading(true);
      setCarError('');
      
      try {
        const carData = await getCarById(params.id as string);
        if (carData) {
          setCar(carData);
        } else {
          setCarError('Car not found');
        }
      } catch (error) {
        console.error('Error loading car:', error);
        setCarError('Failed to load car details');
      } finally {
        setCarLoading(false);
      }
    };
    
    loadCar();
  }, [params.id]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Calculate prices
  const basePrice = (car?.pricePerDay || 0) * rentalDays;
  const extrasTotal = selectedExtras.reduce((total, extraId) => {
    const extra = availableExtras.find(e => e.id === extraId);
    return total + (extra?.price || 0);
  }, 0);
  const tax = Math.round((basePrice + extrasTotal) * 0.20); // 20% VAT
  const totalPrice = basePrice + extrasTotal + tax;

  const handleExtraToggle = (extraId: string) => {
    setSelectedExtras(prev => 
      prev.includes(extraId) 
        ? prev.filter(id => id !== extraId)
        : [...prev, extraId]
    );
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNextStep = () => {
    if (step < 4) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBooking = async () => {
    if (!user || !car) return;

    setLoading(true);
    try {
      // Calculate pricing
      const basePrice = car.pricePerDay * rentalDays;
      const extrasPrice = selectedExtras.reduce((total, extraId) => {
        const extra = availableExtras.find(e => e.id === extraId);
        return total + (extra?.price || 0);
      }, 0);
      const insurancePrice = 0; // TODO: Calculate based on insurance selection
      const taxAmount = (basePrice + extrasPrice + insurancePrice) * 0.2; // 20% tax
      const securityDeposit = basePrice * 0.3; // 30% security deposit
      
      const bookingData = {
        userId: user.id,
        carId: params.id as string,
        pickupDate,
        returnDate,
        pickupLocation: pickup_location,
        contactDetails,
        selectedExtras,
        paymentMethod: paymentMethod as 'card' | 'cash',
        basePrice,
        extrasPrice,
        insurancePrice,
        taxAmount,
        totalAmount: totalPrice,
        securityDeposit,
        status: 'pending' as const // Start as pending until payment is confirmed
      };

      const bookingResult = await createBooking(bookingData);
      
      if (bookingResult.success && bookingResult.bookingId) {
        setBookingId(bookingResult.bookingId);

        // For credit card payments, create payment intent
        if (paymentMethod === 'card') {
          try {
            const paymentResponse = await fetch('/api/payments/create-intent', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                bookingId: bookingResult.bookingId,
                amount: totalPrice,
              }),
            });

            const paymentData = await paymentResponse.json();

            if (paymentResponse.ok) {
              setClientSecret(paymentData.clientSecret);
              setStep(3); // Go to payment step
            } else {
              throw new Error(paymentData.error || 'Failed to create payment intent');
            }
          } catch (paymentError) {
            console.error('Payment intent creation error:', paymentError);
            alert('Failed to initialize payment. Please try again.');
          }
        } else {
          // For cash payments, go directly to confirmation
          setStep(4); // Go to confirmation
        }
      } else {
        throw new Error(bookingResult.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    if (!user || !bookingId) return;
    
    setPaymentProcessing(true);
    try {
      // Confirm payment on server
      const response = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentIntentId: clientSecret.split('_secret_')[0], // Extract payment intent ID
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep(4); // Go to confirmation
      } else {
        setPaymentError(data.error || 'Payment confirmation failed');
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      setPaymentError('Payment confirmation failed');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <CarIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Sign In</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to book a car.</p>
          <Button 
            onClick={() => router.push('/login')}
            className="bg-red-600 hover:bg-red-700"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state while car data is being fetched
  if (carLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header variant="page" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading car details...</h2>
              <p className="text-gray-600">Please wait while we fetch the car information.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if car failed to load
  if (carError || !car) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header variant="page" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CarIcon className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-red-900 mb-2">
                {carError || 'Car not found'}
              </h2>
              <p className="text-red-700 mb-4">Unable to load car details for booking.</p>
              <div className="space-x-4">
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Try Again
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/cars')}
                >
                  Back to Cars
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="page" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Car Details
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium",
                  step >= num 
                    ? "bg-red-600 text-white" 
                    : "bg-gray-200 text-gray-600"
                )}>
                  {step > num ? <Check className="w-5 h-5" /> : num}
                </div>
                {num < 4 && (
                  <div className={cn(
                    "w-16 h-1 mx-2",
                    step > num ? "bg-red-600" : "bg-gray-200"
                  )} />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center space-x-6 mt-2">
            <span className="text-sm text-gray-600">Details</span>
            <span className="text-sm text-gray-600">Review</span>
            <span className="text-sm text-gray-600">Payment</span>
            <span className="text-sm text-gray-600">Confirmation</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Booking Details */}
            {step === 1 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Details</h2>

                {/* Contact Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <Input
                        name="name"
                        value={contactDetails.name}
                        onChange={handleContactChange}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <Input
                        type="email"
                        name="email"
                        value={contactDetails.email}
                        onChange={handleContactChange}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <Input
                        name="phone"
                        value={contactDetails.phone}
                        onChange={handleContactChange}
                        placeholder="+212 6XX XX XX XX"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Driving License Number</label>
                      <Input
                        name="drivingLicense"
                        value={contactDetails.drivingLicense}
                        onChange={handleContactChange}
                        placeholder="License number"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Optional Extras */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Optional Extras</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableExtras.map((extra) => (
                      <div key={extra.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{extra.icon}</span>
                            <div>
                              <h4 className="font-medium text-gray-900">{extra.name}</h4>
                              <p className="text-sm text-gray-600">{extra.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">+{extra.price} MAD</p>
                            <button
                              onClick={() => handleExtraToggle(extra.id)}
                              className={cn(
                                "mt-2 px-3 py-1 rounded text-sm font-medium transition-colors",
                                selectedExtras.includes(extra.id)
                                  ? "bg-red-600 text-white"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              )}
                            >
                              {selectedExtras.includes(extra.id) ? 'Remove' : 'Add'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Requests */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Requests</label>
                  <textarea
                    name="additionalRequests"
                    value={contactDetails.additionalRequests}
                    onChange={handleContactChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Any special requests or requirements..."
                  />
                </div>

                <Button 
                  onClick={handleNextStep}
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={!contactDetails.name || !contactDetails.email || !contactDetails.phone || !contactDetails.drivingLicense}
                >
                  Continue to Review
                </Button>
              </div>
            )}

            {/* Step 2: Review & Payment Method */}
            {step === 2 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Booking</h2>

                {/* Booking Summary */}
                <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Contact Name:</p>
                      <p className="font-medium">{contactDetails.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Email:</p>
                      <p className="font-medium">{contactDetails.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Phone:</p>
                      <p className="font-medium">{contactDetails.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">License:</p>
                      <p className="font-medium">{contactDetails.drivingLicense}</p>
                    </div>
                  </div>
                  {contactDetails.additionalRequests && (
                    <div className="mt-4">
                      <p className="text-gray-600 mb-1">Special Requests:</p>
                      <p className="text-sm bg-white p-2 rounded border">{contactDetails.additionalRequests}</p>
                    </div>
                  )}
                </div>

                {/* Payment Method Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={cn(
                        "p-4 border-2 rounded-lg text-left transition-colors",
                        paymentMethod === 'card'
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <CreditCard className="w-6 h-6 mb-2 text-gray-600" />
                      <h4 className="font-medium">Credit/Debit Card</h4>
                      <p className="text-sm text-gray-600">Pay securely with your card</p>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={cn(
                        "p-4 border-2 rounded-lg text-left transition-colors",
                        paymentMethod === 'cash'
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="w-6 h-6 mb-2 bg-green-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">$</span>
                      </div>
                      <h4 className="font-medium">Pay on Pickup</h4>
                      <p className="text-sm text-gray-600">Pay when you collect the car</p>
                    </button>
                  </div>
                </div>


                {/* Terms and Conditions */}
                <div className="mb-6">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={paymentDetails.agreeToTerms}
                      onChange={handlePaymentChange}
                      className="mt-1 mr-3 h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      required
                    />
                    <div className="text-sm text-gray-700">
                      <p>I agree to the <a href="#" className="text-red-600 hover:underline">Terms and Conditions</a> and <a href="#" className="text-red-600 hover:underline">Privacy Policy</a>.</p>
                      <p className="mt-1">I understand the rental policies and insurance coverage.</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleBooking}
                    disabled={loading || !paymentDetails.agreeToTerms}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Creating Booking...
                      </div>
                    ) : paymentMethod === 'card' ? (
                      'Continue to Payment'
                    ) : (
                      'Confirm Booking'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && paymentMethod === 'card' && clientSecret && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Secure Payment</h2>
                
                {paymentError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{paymentError}</p>
                  </div>
                )}

                <PaymentForm
                  clientSecret={clientSecret}
                  amount={totalPrice}
                  currency="MAD"
                  bookingReference={bookingId}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />

                {paymentProcessing && (
                  <div className="mt-6 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-500 mr-2" />
                      <span className="text-gray-600">Confirming payment...</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                  <p className="text-gray-600">Your car rental has been successfully booked.</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                  <h3 className="font-semibold text-gray-900 mb-3">Booking Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Booking ID:</span> CR-{Date.now()}</p>
                    <p><span className="font-medium">Car:</span> {car?.make} {car?.model} {car?.year}</p>
                    <p><span className="font-medium">Pickup:</span> {format(pickupDate, 'PPP')}</p>
                    <p><span className="font-medium">Return:</span> {format(returnDate, 'PPP')}</p>
                    <p><span className="font-medium">Location:</span> {pickup_location}</p>
                    <p><span className="font-medium">Total:</span> {totalPrice} MAD</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button 
                    onClick={() => router.push('/profile')}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    View My Bookings
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/cars')}
                    className="w-full"
                  >
                    Book Another Car
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
              
              {/* Car Info */}
              <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-gray-200">
                <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={car?.images?.[0] || '/placeholder-car.png'}
                    alt={`${car?.make} ${car?.model}`}
                    width={64}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{car?.make} {car?.model}</h4>
                  <p className="text-sm text-gray-600">{car?.year} • {car?.category}</p>
                </div>
              </div>

              {/* Rental Details */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{format(pickupDate, 'MMM dd')} - {format(returnDate, 'MMM dd')}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{pickup_location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{rentalDays} day{rentalDays !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Car rental ({rentalDays} days)</span>
                  <span className="text-gray-900">{basePrice.toLocaleString()} MAD</span>
                </div>
                
                {selectedExtras.length > 0 && (
                  <>
                    <div className="text-xs text-gray-500 font-medium mt-3 mb-2">Extras:</div>
                    {selectedExtras.map(extraId => {
                      const extra = availableExtras.find(e => e.id === extraId);
                      return extra ? (
                        <div key={extraId} className="flex justify-between">
                          <span className="text-gray-600">{extra.name}</span>
                          <span className="text-gray-900">+{extra.price} MAD</span>
                        </div>
                      ) : null;
                    })}
                  </>
                )}
                
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{(basePrice + extrasTotal).toLocaleString()} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">VAT (20%)</span>
                  <span className="text-gray-900">{tax.toLocaleString()} MAD</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold text-lg">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">{totalPrice.toLocaleString()} MAD</span>
                </div>
              </div>

              {/* Security Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center text-sm text-green-600">
                  <Shield className="w-4 h-4 mr-2" />
                  <span>Secure booking • Free cancellation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
