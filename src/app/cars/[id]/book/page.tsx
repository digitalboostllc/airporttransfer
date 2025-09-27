'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Car, 
  Calendar, 
  MapPin, 
  Clock, 
  CreditCard,
  Shield,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { createBooking } from '@/lib/bookings';
import { sendBookingConfirmation } from '@/lib/notifications';
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

// Mock car data - would come from database
const mockCar = {
  id: '1',
  make: 'Renault',
  model: 'Clio',
  year: 2023,
  category: 'economy',
  pricePerDay: 180,
  image: '/renault-clio.jpg',
  agency: {
    name: 'EuroCar Morocco',
    rating: 4.5,
    reviews: 234
  },
  specifications: {
    seats: 5,
    luggage: 2,
    transmission: 'Manual',
    fuelType: 'Petrol'
  },
  features: ['GPS', 'Bluetooth', 'USB', 'Air Conditioning'],
  insurance: 'Basic insurance included'
};

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Booking state
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation
  const [loading, setLoading] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  
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

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Calculate prices
  const basePrice = mockCar.pricePerDay * rentalDays;
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
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBooking = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Create the booking
      const basePrice = mockCar.pricePerDay * rentalDays;
      const extrasPrice = 0; // TODO: Calculate from selectedExtras
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
        status: 'confirmed' as const
      };

      const bookingResult = await createBooking(bookingData);
      
      if (bookingResult.success) {
        // Send confirmation email (don't wait for it to complete)
        sendBookingConfirmation({
          id: bookingResult.bookingId!,
          bookingReference: `VB-${Date.now()}`, // This will be generated properly in the booking function
          customerId: user.id,
          carId: params.id as string,
          customerName: contactDetails.name,
          customerEmail: contactDetails.email,
          customerPhone: contactDetails.phone,
          pickupDatetime: pickupDate,
          dropoffDatetime: returnDate,
          status: 'confirmed',
          basePrice,
          extrasPrice,
          insurancePrice,
          taxAmount,
          totalPrice: totalPrice,
          securityDeposit,
          paymentMethod,
          paymentStatus: 'completed',
          specialRequests: contactDetails.additionalRequests,
          createdAt: new Date(),
          updatedAt: new Date(),
          car: {
            id: mockCar.id,
            make: mockCar.make,
            model: mockCar.model,
            year: mockCar.year,
            category: mockCar.category,
            images: [mockCar.image],
            agency: {
              name: mockCar.agency.name
            }
          }
        }, user).catch(error => console.error('Email sending failed:', error));

        setStep(3); // Go to confirmation
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Car className="w-16 h-16 text-red-500 mx-auto mb-4" />
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
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium",
                  step >= num 
                    ? "bg-red-600 text-white" 
                    : "bg-gray-200 text-gray-600"
                )}>
                  {step > num ? <Check className="w-5 h-5" /> : num}
                </div>
                {num < 3 && (
                  <div className={cn(
                    "w-20 h-1 mx-2",
                    step > num ? "bg-red-600" : "bg-gray-200"
                  )} />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center space-x-8 mt-2">
            <span className="text-sm text-gray-600">Booking Details</span>
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
                  Continue to Payment
                </Button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Information</h2>

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

                {/* Card Details */}
                {paymentMethod === 'card' && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Card Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                        <Input
                          name="cardholderName"
                          value={paymentDetails.cardholderName}
                          onChange={handlePaymentChange}
                          placeholder="Name on card"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                        <Input
                          name="cardNumber"
                          value={paymentDetails.cardNumber}
                          onChange={handlePaymentChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                          <Input
                            name="expiryDate"
                            value={paymentDetails.expiryDate}
                            onChange={handlePaymentChange}
                            placeholder="MM/YY"
                            maxLength={5}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                          <Input
                            name="cvv"
                            value={paymentDetails.cvv}
                            onChange={handlePaymentChange}
                            placeholder="123"
                            maxLength={3}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
                    disabled={loading || !paymentDetails.agreeToTerms || (paymentMethod === 'card' && (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv))}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      'Complete Booking'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
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
                    <p><span className="font-medium">Car:</span> {mockCar.make} {mockCar.model} {mockCar.year}</p>
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
                    src={mockCar.image || '/placeholder-car.png'}
                    alt={`${mockCar.make} ${mockCar.model}`}
                    width={64}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{mockCar.make} {mockCar.model}</h4>
                  <p className="text-sm text-gray-600">{mockCar.year} • {mockCar.category}</p>
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
