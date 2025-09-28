'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Car as CarIcon,
  Users,
  Luggage,
  Fuel,
  Settings,
  Star,
  SlidersHorizontal,
  MapPin,
  ChevronDown,
  Building2,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Link from 'next/link';
import Image from 'next/image';
import { getCars } from '@/lib/car-client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Car type for UI display
type CarDisplay = {
  id: string;
  make: string;
  model: string;
  year: number;
  category: string;
  basePricePerDay: number;
  features: string[];
  images: string[];
  mainImageUrl?: string;
  agency_name: string;
  agency_rating: number;
  agency_reviews: number;
  seats: number;
  transmission: string;
  fuelType: string;
  luggageCapacity: number;
  basicInsuranceIncluded: boolean;
  freeKmPerDay: number;
};

// Sample car data (kept for reference)
/* const sampleCars = [
  {
    id: '1',
    make: 'Renault',
    model: 'Clio',
    year: 2023,
    category: 'economy',
    image: '/renault-clio.jpg',
    pricePerDay: 180,
    seats: 5,
    doors: 4,
    luggage: 2,
    transmission: 'Manual',
    fuelType: 'Petrol',
    airConditioning: true,
    agency: {
      name: 'EuroCar Morocco',
      rating: 4.5,
      reviews: 234,
      location: 'Mohammed V Airport'
    },
    features: ['GPS', 'Bluetooth', 'USB'],
    available: true,
    totalPrice: 540, // 3 days example
    insurance: 'Basic included',
    freeKilometers: 300
  },
  {
    id: '2',
    make: 'Peugeot',
    model: '308',
    year: 2024,
    category: 'compact',
    image: '/peugeot-308.jpg',
    pricePerDay: 220,
    seats: 5,
    doors: 4,
    luggage: 3,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    airConditioning: true,
    agency: {
      name: 'Atlas Rent Car',
      rating: 4.7,
      reviews: 189,
      location: 'Mohammed V Airport'
    },
    features: ['GPS', 'Bluetooth', 'Cruise Control', 'Keyless'],
    available: true,
    totalPrice: 660,
    insurance: 'Full coverage',
    freeKilometers: 'Unlimited'
  },
  {
    id: '3',
    make: 'Mercedes-Benz',
    model: 'A-Class',
    year: 2024,
    category: 'luxury',
    image: '/mercedes-a-class.jpg',
    pricePerDay: 380,
    seats: 5,
    doors: 4,
    luggage: 3,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    airConditioning: true,
    agency: {
      name: 'Premium Car Rental',
      rating: 4.9,
      reviews: 156,
      location: 'Mohammed V Airport'
    },
    features: ['GPS', 'Bluetooth', 'Leather Seats', 'Premium Sound', 'Keyless', 'LED Lights'],
    available: true,
    totalPrice: 1140,
    insurance: 'Premium coverage',
    freeKilometers: 'Unlimited'
  },
  {
    id: '4',
    make: 'Dacia',
    model: 'Sandero',
    year: 2023,
    category: 'economy',
    image: '/dacia-sandero.jpg',
    pricePerDay: 150,
    seats: 5,
    doors: 4,
    luggage: 2,
    transmission: 'Manual',
    fuelType: 'Petrol',
    airConditioning: true,
    agency: {
      name: 'Budget Car Morocco',
      rating: 4.2,
      reviews: 298,
      location: 'Mohammed V Airport'
    },
    features: ['Radio', 'USB'],
    available: true,
    totalPrice: 450,
    insurance: 'Basic included',
    freeKilometers: 250
  },
  {
    id: '5',
    make: 'Toyota',
    model: 'RAV4',
    year: 2024,
    category: 'suv',
    image: '/toyota-rav4.jpg',
    pricePerDay: 320,
    seats: 5,
    doors: 5,
    luggage: 4,
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    airConditioning: true,
    agency: {
      name: 'Atlas Rent Car',
      rating: 4.7,
      reviews: 189,
      location: 'Mohammed V Airport'
    },
    features: ['GPS', 'Bluetooth', 'AWD', '360 Camera', 'Heated Seats'],
    available: true,
    totalPrice: 960,
    insurance: 'Full coverage',
    freeKilometers: 'Unlimited'
  },
  {
    id: '6',
    make: 'Ford',
    model: 'Transit',
    year: 2023,
    category: 'van',
    image: '/ford-transit.jpg',
    pricePerDay: 280,
    seats: 9,
    doors: 5,
    luggage: 6,
    transmission: 'Manual',
    fuelType: 'Diesel',
    airConditioning: true,
    agency: {
      name: 'Family Van Rental',
      rating: 4.4,
      reviews: 87,
      location: 'Mohammed V Airport'
    },
    features: ['GPS', 'Bluetooth', 'Large Cargo', 'Power Steering'],
    available: true,
    totalPrice: 840,
    insurance: 'Commercial coverage',
    freeKilometers: 'Unlimited'
  },
  {
    id: '7',
    make: 'Volkswagen',
    model: 'Golf',
    year: 2024,
    category: 'compact',
    image: '/volkswagen-golf.jpg',
    pricePerDay: 240,
    seats: 5,
    doors: 4,
    luggage: 3,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    airConditioning: true,
    agency: {
      name: 'EuroCar Morocco',
      rating: 4.5,
      reviews: 234,
      location: 'Mohammed V Airport'
    },
    features: ['GPS', 'Bluetooth', 'Cruise Control', 'Parking Sensors'],
    available: true,
    totalPrice: 720,
    insurance: 'Full coverage',
    freeKilometers: 'Unlimited'
  },
  {
    id: '8',
    make: 'BMW',
    model: '3 Series',
    year: 2024,
    category: 'luxury',
    image: '/bmw-3-series.jpg',
    pricePerDay: 450,
    seats: 5,
    doors: 4,
    luggage: 3,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    airConditioning: true,
    agency: {
      name: 'Premium Car Rental',
      rating: 4.9,
      reviews: 156,
      location: 'Mohammed V Airport'
    },
    features: ['GPS', 'Bluetooth', 'Leather Seats', 'Premium Sound', 'Keyless', 'LED Lights', 'Sunroof'],
    available: true,
    totalPrice: 1350,
    insurance: 'Premium coverage',
    freeKilometers: 'Unlimited'
  },
  {
    id: '9',
    make: 'Nissan',
    model: 'Qashqai',
    year: 2023,
    category: 'suv',
    image: '/nissan-qashqai.jpg',
    pricePerDay: 290,
    seats: 5,
    doors: 5,
    luggage: 4,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    airConditioning: true,
    agency: {
      name: 'Atlas Rent Car',
      rating: 4.7,
      reviews: 189,
      location: 'Mohammed V Airport'
    },
    features: ['GPS', 'Bluetooth', 'Reverse Camera', 'Keyless', 'Hill Assist'],
    available: true,
    totalPrice: 870,
    insurance: 'Full coverage',
    freeKilometers: 'Unlimited'
  },
  {
    id: '10',
    make: 'Hyundai',
    model: 'i20',
    year: 2023,
    category: 'economy',
    image: '/hyundai-i20.jpg',
    pricePerDay: 170,
    seats: 5,
    doors: 4,
    luggage: 2,
    transmission: 'Manual',
    fuelType: 'Petrol',
    airConditioning: true,
    agency: {
      name: 'Budget Car Morocco',
      rating: 4.2,
      reviews: 298,
      location: 'Mohammed V Airport'
    },
    features: ['Bluetooth', 'USB', 'Power Steering'],
    available: true,
    totalPrice: 510,
    insurance: 'Basic included',
    freeKilometers: 300
  },
  {
    id: '11',
    make: 'Audi',
    model: 'A4',
    year: 2024,
    category: 'luxury',
    image: '/audi-a4.jpg',
    pricePerDay: 420,
    seats: 5,
    doors: 4,
    luggage: 3,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    airConditioning: true,
    agency: {
      name: 'Premium Car Rental',
      rating: 4.9,
      reviews: 156,
      location: 'Mohammed V Airport'
    },
    features: ['GPS', 'Bluetooth', 'Leather Seats', 'Premium Sound', 'Matrix LED', 'Virtual Cockpit'],
    available: true,
    totalPrice: 1260,
    insurance: 'Premium coverage',
    freeKilometers: 'Unlimited'
  },
  {
    id: '12',
    make: 'Citroën',
    model: 'Berlingo',
    year: 2023,
    category: 'van',
    image: '/citroen-berlingo.jpg',
    pricePerDay: 250,
    seats: 7,
    doors: 5,
    luggage: 5,
    transmission: 'Manual',
    fuelType: 'Diesel',
    airConditioning: true,
    agency: {
      name: 'Family Van Rental',
      rating: 4.4,
      reviews: 87,
      location: 'Mohammed V Airport'
    },
    features: ['GPS', 'Bluetooth', 'Sliding Doors', 'Large Cargo'],
    available: true,
    totalPrice: 750,
    insurance: 'Commercial coverage',
    freeKilometers: 'Unlimited'
  }
]; */

function CarListingContent() {
  const searchParams = useSearchParams();
  const [cars, setCars] = useState<CarDisplay[]>([]);
  const [filteredCars, setFilteredCars] = useState<CarDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('price_low');
  
  // Filter states
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: [0, 1000],
    transmission: 'all',
    fuelType: 'all',
    seats: 'all',
    agency: 'all'
  });

  // Get search params from URL (from the rental form)
  const urlLocation = searchParams?.get('location') || 'Mohammed V Airport';
  const urlPickupDate = searchParams?.get('pickupDate') || '';
  const urlReturnDate = searchParams?.get('returnDate') || '';
  
  // Search form state
  const [searchFormData, setSearchFormData] = useState({
    location: urlLocation,
    pickupDate: urlPickupDate ? new Date(urlPickupDate) : undefined as Date | undefined,
    returnDate: urlReturnDate ? new Date(urlReturnDate) : undefined as Date | undefined,
    pickupTime: '10:00',
    returnTime: '10:00',
    carCategory: 'all'
  });

  // Popover states
  const [isPickupDateOpen, setIsPickupDateOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Location options
  const locations = [
    'Mohammed V International Airport, Casablanca',
    'Rabat-Salé Airport',
    'Marrakech Menara Airport',
    'Agadir Al Massira Airport',
    'Tangier Ibn Battuta Airport',
    'Casablanca City Center',
    'Rabat City Center',
    'Marrakech City Center'
  ];

  // Search form handlers
  const handleSearchFormChange = (field: string, value: string | Date | undefined) => {
    setSearchFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Sync category with filters
    if (field === 'carCategory' && typeof value === 'string') {
      setFilters(prev => ({
        ...prev,
        category: value
      }));
    }
  };


  // Load cars from database
  const loadCars = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get filter parameters
      const searchFilters = {
        category: filters.category !== 'all' ? filters.category : undefined,
        available: true, // Only show available cars
        limit: 50 // Limit results for performance
      };

      // Fetch cars from API
      const result = await getCars(searchFilters);
      
      // Convert Car type to CarDisplay type
      const displayCars: CarDisplay[] = result.map(car => ({
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        category: car.category,
        basePricePerDay: car.pricePerDay,
        features: car.features || [],
        images: car.images || [],
        mainImageUrl: car.images?.[0],
        agency_name: car.agency?.name || 'Unknown Agency',
        agency_rating: car.averageRating || 0,
        agency_reviews: car.totalBookings || 0,
        seats: Number(car.specifications?.seats) || 5,
        transmission: String(car.specifications?.transmission) || 'Manual',
        fuelType: String(car.specifications?.fuelType) || 'Petrol',
        luggageCapacity: Number(car.specifications?.luggage) || 2,
        basicInsuranceIncluded: car.features?.includes('Insurance') || false,
        freeKmPerDay: 300
      }));
      
      setCars(displayCars);
      setFilteredCars(displayCars);
    } catch (error) {
      console.error('Error loading cars:', error);
      setError('Failed to load cars. Please try again.');
      setCars([]);
      setFilteredCars([]);
    } finally {
      setLoading(false);
    }
  }, [filters.category]);

  useEffect(() => {
    loadCars();
  }, [loadCars]);

  // Get unique agencies for filter dropdown
  const uniqueAgencies = Array.from(new Set(cars.map(car => car.agency_name)));

  const handleFilterChange = (filterType: string, value: string | number | number[]) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'economy': return 'bg-blue-500';
      case 'compact': return 'bg-green-500';
      case 'luxury': return 'bg-purple-500';
      case 'suv': return 'bg-orange-500';
      case 'van': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Unified Hero + Search Section with Same Background */}
      <div className="relative bg-gradient-to-br from-red-600 to-orange-600">
        {/* Background Image - Desktop */}
        <div 
          className="hidden md:block absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{backgroundImage: 'url(/morocco-hero-bg.jpg)'}}
        ></div>
        
        {/* Background Image - Mobile (Optimized) */}
        <Image 
          src="/morocco-hero-bg-mobile.jpg" 
          alt="Morocco Landscape" 
          fill
          className="md:hidden object-cover"
        />
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        
        {/* Header inside Hero */}
        <Header variant="hero" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Hero Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight text-white">
              Find Your Perfect Car
            </h1>
            <p className="text-sm mb-4 text-white/90 max-w-md mx-auto leading-relaxed">
              Compare cars from top rental agencies across Morocco. Choose your perfect vehicle and book instantly.
            </p>
          </div>

          {/* Search Form - Part of Hero (Non-Sticky) */}
          <div id="hero-search-form" className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-2 items-center">
            
            {/* Pickup Location */}
            <div className="flex-1 min-w-0">
              <Popover open={isLocationOpen} onOpenChange={setIsLocationOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isLocationOpen}
                    className="w-full justify-between text-left h-12 bg-white hover:bg-gray-50 border-gray-300"
                  >
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-xs text-gray-500 font-medium">Pick-up</span>
                      <span className="font-medium text-gray-900 truncate">{searchFormData.location}</span>
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0">
                  <Command>
                    <CommandInput placeholder="Search locations..." />
                    <CommandEmpty>No location found.</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        {locations.map((location) => (
                          <CommandItem
                            key={location}
                            value={location}
                            onSelect={() => {
                              handleSearchFormChange('location', location);
                              setIsLocationOpen(false);
                            }}
                          >
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            {location}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Drop-off Location */}
            <div className="flex-1 min-w-0">
              <Button
                variant="outline"
                className="w-full justify-start text-left h-12 bg-white hover:bg-gray-50 border-gray-300"
                disabled
              >
                <div className="flex flex-col items-start">
                  <span className="text-xs text-gray-500 font-medium">Drop-off</span>
                  <span className="font-medium text-gray-600">Same place</span>
                </div>
              </Button>
            </div>

            {/* Rental Dates */}
            <div className="flex-1 min-w-0">
              <Popover open={isPickupDateOpen} onOpenChange={setIsPickupDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left h-12 bg-white hover:bg-gray-50 border-gray-300"
                  >
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-xs text-gray-500 font-medium">Rental dates</span>
                      <div className="font-medium text-gray-900 truncate">
                        {searchFormData.pickupDate && searchFormData.returnDate ? (
                          `${format(searchFormData.pickupDate, "MMM dd")} — ${format(searchFormData.returnDate, "MMM dd, yyyy")}`
                        ) : (
                          "Select dates"
                        )}
                      </div>
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[95vw] max-w-[700px] p-0" align="start">
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Date</label>
                        <Calendar
                          mode="single"
                          selected={searchFormData.pickupDate}
                          onSelect={(date) => handleSearchFormChange('pickupDate', date)}
                          disabled={(date) => date < new Date()}
                          className="rounded-md border"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Return Date</label>
                        <Calendar
                          mode="single"
                          selected={searchFormData.returnDate}
                          onSelect={(date) => handleSearchFormChange('returnDate', date)}
                          disabled={(date) => 
                            date < new Date() || (searchFormData.pickupDate ? date < searchFormData.pickupDate : false)
                          }
                          className="rounded-md border"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pickup time</label>
                        <Select value={searchFormData.pickupTime} onValueChange={(value) => handleSearchFormChange('pickupTime', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => {
                              const time = `${String(i).padStart(2, '0')}:00`;
                              return (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Drop-off time</label>
                        <Select value={searchFormData.returnTime} onValueChange={(value) => handleSearchFormChange('returnTime', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => {
                              const time = `${String(i).padStart(2, '0')}:00`;
                              return (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="text-sm text-gray-600">
                        Total: {searchFormData.pickupDate && searchFormData.returnDate ? 
                          Math.max(1, Math.ceil((searchFormData.returnDate.getTime() - searchFormData.pickupDate.getTime()) / (1000 * 60 * 60 * 24))) : 0
                        } days
                      </div>
                      <Button 
                        onClick={() => setIsPickupDateOpen(false)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CarIcon className="w-4 h-4 mr-2" />
                        Search Cars
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Filters Dropdown */}
            <div>
              <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-12 px-4 bg-white hover:bg-gray-50 border-gray-300"
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                    {(searchFormData.carCategory !== 'all' || 
                      filters.priceRange[0] > 0 || 
                      filters.priceRange[1] < 1000 ||
                      filters.transmission !== 'all' ||
                      filters.fuelType !== 'all' ||
                      filters.seats !== 'all' ||
                      filters.agency !== 'all') && (
                      <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {[
                          searchFormData.carCategory !== 'all',
                          filters.priceRange[0] > 0 || filters.priceRange[1] < 1000,
                          filters.transmission !== 'all',
                          filters.fuelType !== 'all',
                          filters.seats !== 'all',
                          filters.agency !== 'all'
                        ].filter(Boolean).length}
                      </span>
                    )}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[95vw] max-w-[600px] p-0" align="end">
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Filters</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFilters({
                            category: 'all',
                            priceRange: [0, 1000],
                            transmission: 'all',
                            fuelType: 'all',
                            seats: 'all',
                            agency: 'all'
                          });
                          handleSearchFormChange('carCategory', 'all');
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Clear all
                      </Button>
                    </div>

                    {/* Responsive Column Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      {/* Left Column */}
                      <div className="space-y-4">
                        {/* Price Range */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Price per day (MAD)</label>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              placeholder="Min"
                              value={filters.priceRange[0]}
                              onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value) || 0, filters.priceRange[1]])}
                              className="w-20 text-sm"
                            />
                            <span className="text-gray-400">-</span>
                            <Input
                              type="number"
                              placeholder="Max"
                              value={filters.priceRange[1]}
                              onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value) || 1000])}
                              className="w-20 text-sm"
                            />
                          </div>
                        </div>

                        {/* Transmission */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Transmission</label>
                          <Select value={filters.transmission} onValueChange={(value) => handleFilterChange('transmission', value)}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="manual">Manual</SelectItem>
                              <SelectItem value="automatic">Automatic</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Fuel Type */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Fuel Type</label>
                          <Select value={filters.fuelType} onValueChange={(value) => handleFilterChange('fuelType', value)}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="petrol">Petrol</SelectItem>
                              <SelectItem value="diesel">Diesel</SelectItem>
                              <SelectItem value="hybrid">Hybrid</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-4">
                        {/* Number of Seats */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Number of Seats</label>
                          <Select value={filters.seats} onValueChange={(value) => handleFilterChange('seats', value)}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="2">2 seats</SelectItem>
                              <SelectItem value="4">4 seats</SelectItem>
                              <SelectItem value="5">5 seats</SelectItem>
                              <SelectItem value="7">7+ seats</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Agency */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Rental Agency</label>
                          <Select value={filters.agency} onValueChange={(value) => handleFilterChange('agency', value)}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All agencies</SelectItem>
                              {uniqueAgencies.map((agency) => (
                                <SelectItem key={agency} value={agency}>{agency}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Apply Filters Button */}
                        <div className="pt-6">
                          <Button 
                            onClick={() => setIsFiltersOpen(false)}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            Apply Filters
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Results Count */}
            <div className="hidden lg:flex items-center text-sm text-gray-600 ml-2">
              <span className="font-medium">{filteredCars.length}</span>
              <span className="ml-1">cars available</span>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Sticky Search Section - Clean Minimal Version */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center gap-3 text-sm">
            {/* Location Summary */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-900">{searchFormData.location}</span>
            </div>
            
            {/* Dates Summary */}
            {searchFormData.pickupDate && searchFormData.returnDate && (
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  {format(searchFormData.pickupDate, 'MMM dd')} - {format(searchFormData.returnDate, 'MMM dd')}
                </span>
              </div>
            )}
            
            {/* Category Summary */}
            {searchFormData.carCategory !== 'all' && (
              <div className="flex items-center gap-2">
                <CarIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 capitalize">{searchFormData.carCategory}</span>
              </div>
            )}
            
            {/* Quick Modify Button */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => document.getElementById('hero-search-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="ml-auto"
            >
              Modify Search
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mobile Results Header */}
        <div className="lg:hidden mb-6">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{filteredCars.length}</span> cars available in {searchFormData.location}
            {searchFormData.pickupDate && searchFormData.returnDate && (
              <span className="block text-xs text-gray-500 mt-1">
                {format(searchFormData.pickupDate, 'MMM dd')} - {format(searchFormData.returnDate, 'MMM dd')}
              </span>
            )}
          </div>
        </div>

        {/* Compact view without large header */}
        <div className="hidden lg:block mb-6">
          <div className="text-sm text-gray-500">
            Showing results for {searchFormData.location}
          </div>
        </div>

        {/* Car Categories Row - Small Cards like Homepage */}
        <div className="mb-6">
          <div className="grid grid-cols-5 gap-2">
            {[
              { id: 'all', name: 'All Categories', color: 'bg-gray-50 border-gray-200' },
              { id: 'economy', name: 'Economy', color: 'bg-blue-50 border-blue-200' },
              { id: 'compact', name: 'Compact', color: 'bg-green-50 border-green-200' },
              { id: 'suv', name: 'SUV', color: 'bg-orange-50 border-orange-200' },
              { id: 'luxury', name: 'Luxury', color: 'bg-purple-50 border-purple-200' }
            ].map((category) => (
              <div
                key={category.id}
                className={cn(
                  "car-3d-card p-2 rounded-lg text-center cursor-pointer border-2 transition-all duration-300",
                  searchFormData.carCategory === category.id ? "ring-2 ring-red-500 border-red-300" : "",
                  category.color
                )}
                onClick={() => handleSearchFormChange('carCategory', category.id)}
              >
                <div className="car-3d-icon w-5 h-5 mx-auto mb-1 flex items-center justify-center">
                  <CarIcon className="w-4 h-4 text-gray-700" />
                </div>
                <h4 className="font-semibold text-gray-800 text-xs">{category.name}</h4>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="hidden">
            </div>

            <div className="flex items-center space-x-3">
              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Best Rated</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Car Results */}
        <div className="space-y-4">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CarIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to load cars</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <Button 
                onClick={loadCars}
                className="bg-red-600 hover:bg-red-700"
              >
                Try Again
              </Button>
            </div>
          ) : loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading cars...</h3>
              <p className="text-gray-600">Finding the best options for you.</p>
            </div>
          ) : filteredCars.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <CarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No cars found</h3>
              <p className="text-gray-600">Try adjusting your filters to see more options.</p>
            </div>
          ) : (
            filteredCars.map((car) => (
              <div key={car.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {/* Car Image & Basic Info */}
                      <div className="md:col-span-1">
                        <div className="relative">
                          <Image 
                            src={car.images?.[0] || car.mainImageUrl || '/placeholder-car.png'} 
                            alt={`${car.make} ${car.model}`}
                            width={400}
                            height={128}
                            className="w-full h-32 object-cover rounded-lg bg-gray-100"
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+i"
                          />
                          <div className={cn(
                            "absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold text-white capitalize",
                            getCategoryColor(car.category)
                          )}>
                            {car.category}
                          </div>
                        </div>
                      </div>

                      {/* Car Details */}
                      <div className="md:col-span-2">
                        <div className="mb-3">
                          <h3 className="text-xl font-bold text-gray-900">
                            {car.make} {car.model} {car.year}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center space-x-1">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{car.agency_name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600">{car.agency_rating} ({car.agency_reviews})</span>
                            </div>
                          </div>
                        </div>

                        {/* Car Specs */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>{car.seats} seats</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Settings className="w-4 h-4" />
                            <span>{car.transmission}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Fuel className="w-4 h-4" />
                            <span>{car.fuelType}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Luggage className="w-4 h-4" />
                            <span>{car.luggageCapacity || 2} bags</span>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(car.features) ? car.features : []).slice(0, 4).map((feature, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded-full">
                              {feature}
                            </span>
                          ))}
                          {(Array.isArray(car.features) ? car.features : []).length > 4 && (
                            <span className="px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded-full">
                              +{car.features.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Pricing & Action */}
                      <div className="md:col-span-1 flex flex-col justify-between">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{Math.round(car.basePricePerDay)} MAD</div>
                          <div className="text-sm text-gray-600">per day</div>
                          {searchFormData.pickupDate && searchFormData.returnDate && (
                            <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                              <div className="text-sm font-semibold text-green-800">Available</div>
                              <div className="text-xs text-green-600">For your dates</div>
                            </div>
                          )}
                          <div className="mt-2 text-xs text-gray-500">
                            <div>✓ {car.basicInsuranceIncluded ? 'Basic insurance included' : 'Insurance available'}</div>
                            <div>✓ {car.freeKmPerDay > 0 ? `${car.freeKmPerDay}km/day included` : 'Unlimited mileage'}</div>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          <Link href={`/cars/${car.id}`}>
                            <Button className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold">
                              Select Car
                            </Button>
                          </Link>
                          <Button variant="outline" className="w-full text-sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function CarListing() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cars...</p>
        </div>
      </div>
    }>
      <CarListingContent />
    </Suspense>
  );
}
