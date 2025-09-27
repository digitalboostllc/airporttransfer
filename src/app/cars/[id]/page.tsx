'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import {
  Car,
  Users,
  Luggage,
  Snowflake,
  Fuel,
  Settings,
  Star,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  ArrowLeft,
  Heart,
  Share2,
  Info,
  Zap,
  Wifi,
  Navigation,
  Key
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Link from 'next/link';
import Image from 'next/image';
//import { getCarById as getCarByIdFromDB } from '@/lib/prisma';
import { getCarById } from '@/lib/car-client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Car type for component state
type CarType = {
  id: string;
  make: string;
  model: string;
  year: number;
  category: string;
  pricePerDay: number;
  images: string[];
  description: string;
  features: string[];
  included?: string[];
  optional?: { name: string; price: number }[];
  agency?: {
    name: string;
    rating: number;
    reviews: number;
    address: string;
    phone: string;
    email: string;
  };
  specifications: {
    engine: string;
    transmission: string;
    fuelType: string;
    seats: number;
    luggage: string;
    doors: string;
    airConditioning: string;
    insurance: string;
    mileage: string;
    minimumAge: string;
    drivingLicense: string;
    deposit: string;
  };
};

// Sample car data structure for typing  
/* const sampleCars = [
  {
    id: '1',
    make: 'Renault',
    model: 'Clio',
    year: 2023,
    category: 'economy',
    images: ['/renault-clio-1.jpg'],
    pricePerDay: 180,
    seats: 5,
    doors: 4,
    luggage: 2,
    transmission: 'Manual',
    fuelType: 'Petrol',
    fuelCapacity: '45L',
    engineSize: '1.0L',
    airConditioning: true,
    agency: {
      name: 'EuroCar Morocco',
      rating: 4.5,
      reviews: 234,
      location: 'Mohammed V Airport',
      phone: '+212 5 22 33 44 55',
      email: 'info@eurocar-morocco.ma',
      address: 'Mohammed V International Airport, Terminal 1, Casablanca'
    },
    features: ['GPS Navigation'],
    included: ['Basic Insurance'],
    optional: [{ name: 'Additional Driver', price: 50 }],
    available: true,
    description: 'Sample car description',
    specifications: {
      bodyType: 'Hatchback',
      drivetrain: 'Front-wheel drive',
      minimumAge: '23 years',
      drivingLicense: 'Valid for 2+ years',
      deposit: '2000 MAD'
    }
  }
];

// Sample car data (this would come from a database in a real app)
const getCarById = (id: string) => {
  const cars = {
    '1': {
      id: '1',
      make: 'Renault',
      model: 'Clio',
      year: 2023,
      category: 'economy',
      images: [
        '/renault-clio-1.jpg',
        '/renault-clio-2.jpg',
        '/renault-clio-3.jpg',
        '/renault-clio-interior.jpg'
      ],
      pricePerDay: 180,
      seats: 5,
      doors: 4,
      luggage: 2,
      transmission: 'Manual',
      fuelType: 'Petrol',
      fuelCapacity: '45L',
      engineSize: '1.0L',
      airConditioning: true,
      agency: {
        name: 'EuroCar Morocco',
        rating: 4.5,
        reviews: 234,
        location: 'Mohammed V Airport',
        phone: '+212 5 22 33 44 55',
        email: 'info@eurocar-morocco.ma',
        address: 'Mohammed V International Airport, Terminal 1, Casablanca'
      },
      features: [
        'GPS Navigation',
        'Bluetooth',
        'USB Charging',
        'Power Steering',
        'Central Locking',
        'Electric Windows',
        'Radio/CD Player',
        'Safety Airbags'
      ],
      included: [
        'Basic Insurance',
        '300km Free',
        '24/7 Roadside Assistance',
        'Airport Pickup',
        'Free Cancellation (24h)'
      ],
      optional: [
        { name: 'Additional Driver', price: 50 },
        { name: 'GPS Device', price: 30 },
        { name: 'Child Seat', price: 25 },
        { name: 'Full Insurance', price: 80 },
        { name: 'WiFi Hotspot', price: 40 }
      ],
      available: true,
      description: 'The Renault Clio is perfect for city driving and economical travel around Morocco. This compact car offers excellent fuel economy and comfortable seating for up to 5 passengers. Ideal for couples or small families exploring Morocco.',
      specifications: {
        bodyType: 'Hatchback',
        drivetrain: 'Front-wheel drive',
        minimumAge: '23 years',
        drivingLicense: 'Valid for 2+ years',
        deposit: '2000 MAD'
      }
    },
    // Add more cars as needed
  }; 

const getCarById = (id: string) => {
  // This function would be replaced with database call
  return cars[id as keyof typeof cars] || null;
}; */

// This function is replaced by the useEffect in the component

function CarDetailsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const carId = params?.id as string;
  
  const [car, setCar] = useState<CarType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    pickupDate: '',
    returnDate: '',
    pickupTime: '',
    returnTime: '',
    additionalRequests: ''
  });
  
  // Get search params from URL
  const pickupDate = searchParams?.get('pickupDate') || '';
  const returnDate = searchParams?.get('returnDate') || '';
  const pickupLocation = searchParams?.get('location') || 'Mohammed V Airport';

  useEffect(() => {
    const loadCarData = async () => {
      if (!carId) return;
      
      setLoading(true);
      setError('');
      
      try {
        const carData = await getCarById(carId);
        
        if (carData) {
          // Convert Car type to CarType for component compatibility
          const convertedCar: CarType = {
            id: carData.id,
            make: carData.make,
            model: carData.model,
            year: carData.year,
            category: carData.category,
            pricePerDay: carData.pricePerDay,
            images: carData.images || [],
            description: carData.description || 'No description available.',
            features: carData.features || [],
            included: ['Basic insurance', '24/7 support', 'Roadside assistance'],
            optional: [
              { name: 'Additional driver', price: 50 },
              { name: 'GPS navigation', price: 30 },
              { name: 'Child seat', price: 25 },
              { name: 'Full coverage insurance', price: 80 }
            ],
            agency: {
              name: carData.agency?.name || 'Car Rental Agency',
              rating: carData.averageRating || 4.0,
              reviews: carData.totalBookings || 0,
              address: carData.location || 'Morocco',
              phone: '+212 6 00 00 00 00',
              email: 'contact@agency.com'
            },
            specifications: {
              engine: carData.specifications?.engine || '1.6L',
              transmission: carData.specifications?.transmission || 'Manual',
              fuelType: carData.specifications?.fuelType || 'Petrol',
              seats: carData.specifications?.seats || 5,
              luggage: `${carData.specifications?.luggage || 2} Large`,
              doors: `${carData.specifications?.doors || 4} Doors`,
              airConditioning: carData.features?.includes('Air Conditioning') ? 'Yes' : 'No',
              insurance: 'Basic insurance included',
              mileage: '300km free per day',
              minimumAge: '21 years',
              drivingLicense: 'Valid for 1+ years',
              deposit: `${carData.pricePerDay * 2} MAD`
            }
          };
          
          setCar(convertedCar);
        } else {
          setError('Car not found');
        }
      } catch (error) {
        console.error('Error loading car:', error);
        setError('Failed to load car details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadCarData();
  }, [carId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build the booking URL with search params
    const bookingParams = new URLSearchParams();
    if (pickupDate) bookingParams.set('pickup_date', pickupDate);
    if (returnDate) bookingParams.set('return_date', returnDate);
    if (pickupLocation) bookingParams.set('location', pickupLocation);
    
    // Navigate to the comprehensive booking page
    router.push(`/cars/${params.id}/book?${bookingParams.toString()}`);
  };

  const calculateTotalPrice = () => {
    if (!car || !pickupDate || !returnDate) return car?.pricePerDay || 0;
    
    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);
    const days = Math.max(1, Math.ceil((returnD.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24)));
    
    return car.pricePerDay * days;
  };

  const getDays = () => {
    if (!pickupDate || !returnDate) return 1;
    
    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);
    return Math.max(1, Math.ceil((returnD.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24)));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading car details...</h2>
          <p className="text-gray-600">Please wait while we fetch the car information.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-red-900 mb-2">Failed to load car</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="space-x-4">
            <Button 
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700"
            >
              Try Again
            </Button>
            <Link href="/cars">
              <Button variant="outline">Back to Car Listings</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Car not found state (after loading completes)
  if (!car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Car not found</h2>
          <p className="text-gray-600 mb-4">The car you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/cars">
            <Button>Back to Car Listings</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getFeatureIcon = (feature: string) => {
    if (feature.toLowerCase().includes('gps')) return <Navigation className="w-4 h-4" />;
    if (feature.toLowerCase().includes('bluetooth')) return <Zap className="w-4 h-4" />;
    if (feature.toLowerCase().includes('wifi')) return <Wifi className="w-4 h-4" />;
    if (feature.toLowerCase().includes('key')) return <Key className="w-4 h-4" />;
    if (feature.toLowerCase().includes('ac') || feature.toLowerCase().includes('air')) return <Snowflake className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header variant="page" />
      
      {/* Breadcrumb & Actions Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-[72px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                Home
              </Link>
              <span className="text-gray-300">/</span>
              <Link href="/cars" className="text-gray-500 hover:text-gray-700">
                Car Rental
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-gray-900 font-medium">
                {car.make} {car.model}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link href="/cars">
                <Button variant="outline" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back to Results</span>
                </Button>
              </Link>
              
              <Button variant="outline" size="sm" className="p-2">
                <Heart className="w-4 h-4" />
              </Button>
              
              <Button variant="outline" size="sm" className="p-2">
                <Share2 className="w-4 h-4" />
              </Button>
              
              <a 
                href="tel:+212600000000" 
                className="w-9 h-9 bg-red-500 hover:bg-red-600 rounded-lg flex items-center justify-center transition-all duration-300"
                title="+212 6 00 00 00 00"
              >
                <Phone className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Car Images */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative h-80">
                <Image 
                  src={car.images[selectedImageIndex] || '/placeholder-car.png'} 
                  alt={`${car.make} ${car.model}`}
                  fill
                  className="object-cover bg-gray-100"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+i"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-semibold capitalize">
                  {car.category}
                </div>
              </div>
              <div className="p-4">
                <div className="flex space-x-2 overflow-x-auto">
                  {car.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={cn(
                        "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2",
                        selectedImageIndex === index ? "border-red-500" : "border-gray-200"
                      )}
                    >
                      <Image 
                        src={image} 
                        alt={`${car.make} ${car.model} ${index + 1}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Car Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {car.make} {car.model} {car.year}
                </h1>
                <p className="text-gray-600 leading-relaxed">
                  {car.description}
                </p>
              </div>

              {/* Car Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-red-500" />
                  <div>
                    <div className="font-semibold text-gray-900">{car.specifications.seats}</div>
                    <div className="text-sm text-gray-600">Seats</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Luggage className="w-5 h-5 text-red-500" />
                  <div>
                    <div className="font-semibold text-gray-900">{car.specifications.luggage}</div>
                    <div className="text-sm text-gray-600">Bags</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Settings className="w-5 h-5 text-red-500" />
                  <div>
                    <div className="font-semibold text-gray-900">{car.specifications.transmission}</div>
                    <div className="text-sm text-gray-600">Transmission</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Fuel className="w-5 h-5 text-red-500" />
                  <div>
                    <div className="font-semibold text-gray-900">{car.specifications.fuelType}</div>
                    <div className="text-sm text-gray-600">Fuel</div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Features & Equipment</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {car.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2 text-gray-700">
                      {getFeatureIcon(feature)}
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* What's Included */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">What&apos;s Included</h3>
                <div className="space-y-2">
                  {car.included?.map((item: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2 text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      <span>{item}</span>
                    </div>
                  )) || <div className="text-gray-600 text-sm">No included items listed</div>}
                </div>
              </div>

              {/* Optional Extras */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Optional Extras</h3>
                <div className="space-y-2">
                  {car.optional?.map((extra: { name: string; price: number }, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-900">{extra.name}</span>
                      <span className="font-semibold text-gray-900">+{extra.price} MAD</span>
                    </div>
                  )) || <div className="text-gray-600 text-sm">No optional extras available</div>}
                </div>
              </div>
            </div>

            {/* Agency Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Rental Agency</h3>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-semibold">{car.agency?.rating || 'N/A'}</span>
                  <span className="text-gray-600">({car.agency?.reviews || 0} reviews)</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{car.agency?.name || 'Agency Information'}</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{car.agency?.address || 'Address not available'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${car.agency?.phone || ''}`} className="text-red-600 hover:text-red-700">
                        {car.agency?.phone || 'Phone not available'}
                      </a>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${car.agency?.email || ''}`} className="text-red-600 hover:text-red-700">
                        {car.agency?.email || 'Email not available'}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <div className="mb-6">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-3xl font-bold text-gray-900">{car.pricePerDay} MAD</span>
                  <span className="text-gray-600">per day</span>
                </div>
                
                {pickupDate && returnDate && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-sm font-semibold text-green-800">
                      Total for {getDays()} days: {calculateTotalPrice()} MAD
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      {format(new Date(pickupDate), 'MMM dd')} - {format(new Date(returnDate), 'MMM dd')}
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <Input
                    name="name"
                    value={bookingData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input
                    name="email"
                    type="email"
                    value={bookingData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <Input
                    name="phone"
                    type="tel"
                    value={bookingData.phone}
                    onChange={handleInputChange}
                    placeholder="+212 6XX XX XX XX"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Requests</label>
                  <Textarea
                    name="additionalRequests"
                    value={bookingData.additionalRequests}
                    onChange={handleInputChange}
                    placeholder="Any special requests or requirements..."
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold py-3"
                >
                  Book This Car
                </Button>

                <div className="text-center text-xs text-gray-500 space-y-1">
                  <div>✓ Free cancellation within 24 hours</div>
                  <div>✓ Best price guarantee</div>
                  <div>✓ Instant confirmation</div>
                </div>
              </form>

              {/* Important Information */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Important Information</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Minimum age: {car.specifications.minimumAge}</li>
                      <li>• Driving license: {car.specifications.drivingLicense}</li>
                      <li>• Security deposit: {car.specifications.deposit}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function CarDetails() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading car details...</p>
        </div>
      </div>
    }>
      <CarDetailsContent />
    </Suspense>
  );
}
