'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircle,
  Plane,
  Building2,
  Clock,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Car,
  Truck,
  Bus,
  Check,
  DollarSign,
  Calendar as CalendarIcon,
  Target,
  Users,
  X,
  Star,
  RotateCcw,
  Luggage,
  Snowflake,
  MessageSquare,
  UserCheck,
  ArrowRight,
  Shield
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Image from "next/image";
import dynamic from 'next/dynamic';
import AddressInput from '@/components/AddressInput';
import Header from '@/components/Header';

// Dynamically import RouteMap to avoid SSR issues
const RouteMap = dynamic(() => import('@/components/RouteMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-white/80 text-sm">Loading map...</p>
      </div>
    </div>
  )
});

export default function Home() {
  // Service selection state
  const [activeService, setActiveService] = useState<'transfer' | 'rental'>('transfer');

  const [formData, setFormData] = useState({
    pickup: 'Mohammed V International Airport, Casablanca',
    destination: '',
    date: undefined as Date | undefined,
    time: '',
    passengers: '1',
    vehicle: '',
    name: '',
    phone: '',
    email: ''
  });

  // Car rental specific state
  const [rentalFormData, setRentalFormData] = useState({
    location: 'Mohammed V International Airport, Casablanca',
    pickupDate: undefined as Date | undefined,
    returnDate: undefined as Date | undefined,
    pickupTime: '',
    returnTime: '',
    carCategory: '',
    name: '',
    phone: '',
    email: ''
  });

  // Track which input is for airport vs general location
  const [pickupIsAirport, setPickupIsAirport] = useState(true);

  // Testimonials carousel state
  const [currentTestimonialSlide, setCurrentTestimonialSlide] = useState(0);

  // Airport options for transfers
  const airports = [
    'Mohammed V International Airport, Casablanca',
    'Marrakech Menara Airport',
    'Tangier Ibn Battuta Airport',
    'Agadir Al Massira Airport',
    'Rabat-Salé Airport',
    'Fez-Saiss Airport'
  ];


  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
    distanceValue: number; // in meters
  } | null>(null);

  const [estimatedPrices, setEstimatedPrices] = useState({
    sedan: 250,
    suv: 350,
    van: 500
  });

  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  // Calculate dynamic pricing based on distance
  const calculatePricing = (distanceInKm: number) => {
    // Base prices (minimum charge)
    const basePrices = {
      sedan: 150,   // Minimum 150 MAD
      suv: 200,     // Minimum 200 MAD  
      van: 300      // Minimum 300 MAD
    };

    // Per kilometer rates
    const kmRates = {
      sedan: 8,     // 8 MAD per km
      suv: 12,      // 12 MAD per km
      van: 18       // 18 MAD per km  
    };

    const newPrices = {
      sedan: Math.max(basePrices.sedan, Math.round(basePrices.sedan + (distanceInKm * kmRates.sedan))),
      suv: Math.max(basePrices.suv, Math.round(basePrices.suv + (distanceInKm * kmRates.suv))),
      van: Math.max(basePrices.van, Math.round(basePrices.van + (distanceInKm * kmRates.van)))
    };

    setEstimatedPrices(newPrices);
  };

  const [contactFormData, setContactFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    date: undefined as Date | undefined,
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (name: string, address: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: address
    }));
  };

  const handleSwapLocations = () => {
    if (formData.destination) {
      setFormData(prev => ({
        ...prev,
        pickup: prev.destination,
        destination: prev.pickup
      }));
      // Swap the input types (airport vs general location)
      setPickupIsAirport(prev => !prev);
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setFormData(prev => ({
      ...prev,
      date: date
    }));
  };

  const handleTimeChange = (time: string) => {
    setFormData(prev => ({
      ...prev,
      time: time
    }));
    setIsTimePickerOpen(false);
  };

  // Generate time options
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01 ${timeString}`).toLocaleString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        times.push({ value: timeString, label: displayTime });
      }
    }
    return times;
  };

  const handleContactInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactSelectChange = (value: string) => {
    setContactFormData(prev => ({
      ...prev,
      service: value
    }));
  };

  const handleContactDateChange = (date: Date | undefined) => {
    setContactFormData(prev => ({
      ...prev,
      date: date
    }));
  };

  // Car rental form handlers
  const handleRentalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRentalFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRentalSelectChange = (name: string, value: string) => {
    setRentalFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRentalDateChange = (name: string, date: Date | undefined) => {
    setRentalFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const handleRentalTimeChange = (name: string, time: string) => {
    setRentalFormData(prev => ({
      ...prev,
      [name]: time
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Booking request:', formData);
    alert('Thank you for your booking request! We will contact you shortly.');
  };

  const handleRentalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Car rental request:', rentalFormData);
    
    // Build search params for car listing page
    const searchParams = new URLSearchParams({
      location: rentalFormData.location,
      ...(rentalFormData.pickupDate && { pickupDate: rentalFormData.pickupDate.toISOString() }),
      ...(rentalFormData.returnDate && { returnDate: rentalFormData.returnDate.toISOString() }),
      ...(rentalFormData.pickupTime && { pickupTime: rentalFormData.pickupTime }),
      ...(rentalFormData.returnTime && { returnTime: rentalFormData.returnTime }),
      ...(rentalFormData.carCategory && { category: rentalFormData.carCategory }),
    });

    // Navigate to car listing page
    window.location.href = `/cars?${searchParams.toString()}`;
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', contactFormData);
    alert('Thank you for your message! We will get back to you soon.');
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">
      {/* Hero Section */}
      <section className="text-white relative min-h-screen flex flex-col bg-gradient-to-br from-red-500 via-orange-500 to-red-600">
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
          priority
        />
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        {/* Header inside Hero */}
        <Header variant="hero" />
        
        {/* Hero Content */}
        <div className="flex-1 flex items-center py-8 lg:py-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Mobile-Only: Title, Description, Stats & Features (shown before form) */}
          <div className="lg:hidden mb-6 text-center">
            <div className="inline-flex items-center bg-white/20 backdrop-filter backdrop-blur-sm px-3 py-1 rounded-full mb-3 border border-white/30">
              {activeService === 'transfer' ? (
                <>
                  <Plane className="w-4 h-4 mr-2 text-white" />
                  <span className="text-xs font-medium text-white">Mohammed V Airport Transfer</span>
                </>
              ) : (
                <>
                  <Car className="w-4 h-4 mr-2 text-white" />
                  <span className="text-xs font-medium text-white">Car Rental Marketplace</span>
                </>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-white">
              {activeService === 'transfer' ? 'Airport Transfer' : 'Car Rental'}
            </h1>
            
            <p className="text-sm mb-4 text-white/90 max-w-md mx-auto leading-relaxed">
              {activeService === 'transfer' 
                ? 'Professional airport transfer service with smart location suggestions. Use the swap button to switch pickup and destination effortlessly.'
                : 'Find and rent cars from trusted agencies across Morocco. Compare prices, choose your perfect vehicle, and book instantly.'
              }
            </p>

            {/* Trust Indicators - Mobile */}
            <div className="flex items-center justify-center gap-4 mb-4 text-xs text-white/80">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span>50+ Partner Agencies</span>
              </div>
              <div className="w-px h-3 bg-white/30"></div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400" />
                <span>10K+ Happy Customers</span>
              </div>
              <div className="w-px h-3 bg-white/30"></div>
              <div className="flex items-center gap-1">
                <Building2 className="w-3 h-3 text-blue-400" />
                <span>Licensed Platform</span>
              </div>
            </div>
        
            {/* Features Grid - Mobile */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
              {activeService === 'transfer' ? (
                <>
                  <div className="flex flex-col items-center text-xs text-white">
                    <div className="w-8 h-8 bg-gradient-to-br from-white/30 to-white/10 rounded-full mb-2 flex items-center justify-center border border-white/20">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold">24/7 Available</span>
                  </div>
                  <div className="flex flex-col items-center text-xs text-white">
                    <div className="w-8 h-8 bg-gradient-to-br from-white/30 to-white/10 rounded-full mb-2 flex items-center justify-center border border-white/20">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold">Licensed Drivers</span>
                  </div>
                  <div className="flex flex-col items-center text-xs text-white">
                    <div className="w-8 h-8 bg-gradient-to-br from-white/30 to-white/10 rounded-full mb-2 flex items-center justify-center border border-white/20">
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold">Smart Pricing</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col items-center text-xs text-white">
                    <div className="w-8 h-8 bg-gradient-to-br from-white/30 to-white/10 rounded-full mb-2 flex items-center justify-center border border-white/20">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold">Top Agencies</span>
                  </div>
                  <div className="flex flex-col items-center text-xs text-white">
                    <div className="w-8 h-8 bg-gradient-to-br from-white/30 to-white/10 rounded-full mb-2 flex items-center justify-center border border-white/20">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold">Best Prices</span>
                  </div>
                  <div className="flex flex-col items-center text-xs text-white">
                    <div className="w-8 h-8 bg-gradient-to-br from-white/30 to-white/10 rounded-full mb-2 flex items-center justify-center border border-white/20">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold">Instant Booking</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center lg:items-end">
            {/* Left: Compact Premium Booking Form */}
            <div className="compact-form rounded-2xl p-3 sm:p-4">
              {/* Service Selector */}
              <div className="mb-3 sm:mb-4">
                <div className="flex bg-gray-100 rounded-lg p-0.5 mx-auto max-w-xs">
                  <button
                    type="button"
                    onClick={() => setActiveService('transfer')}
                    className={cn(
                      "flex-1 py-1.5 px-2 rounded-md text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1.5",
                      activeService === 'transfer' 
                        ? "bg-white text-red-600 shadow-sm" 
                        : "text-gray-600 hover:text-red-500"
                    )}
                  >
                    <Plane className="w-3 h-3" />
                    Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveService('rental')}
                    className={cn(
                      "flex-1 py-1.5 px-2 rounded-md text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1.5",
                      activeService === 'rental' 
                        ? "bg-white text-red-600 shadow-sm" 
                        : "text-gray-600 hover:text-red-500"
                    )}
                  >
                    <Car className="w-3 h-3" />
                    Car Rental
                  </button>
        </div>
              </div>

              <div className="text-center mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg font-bold mb-0.5 text-gray-800">
                  {activeService === 'transfer' ? 'Book Your Transfer' : 'Rent a Car'}
                </h2>
                <p className="text-gray-600 text-xs">
                  {activeService === 'transfer' ? 'Quick & easy booking' : 'Find your perfect car'}
                </p>
              </div>

              {/* Transfer Form */}
              {activeService === 'transfer' && (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {/* Step 1: Route & Time */}
                <div className="form-step space-y-3 bg-gray-50/50 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-red-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-800">Where & When</h3>
                  </div>
                  {/* Integrated Layout: Inputs with Swap Button Between */}
                  <div className="space-y-2">
                    <div className="flex items-stretch gap-1.5">
                      {/* First Input - Dynamic based on pickupIsAirport */}
                      <div className="relative flex-1 min-w-0">
                        {pickupIsAirport ? (
                          <>
                            <Plane className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-500 z-20 pointer-events-none" />
                            <Select onValueChange={(value) => handleAddressChange('pickup', value)} value={formData.pickup}>
                              <SelectTrigger className="w-full pl-8 h-12 sm:h-11 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white hover:border-red-300 shadow-sm text-gray-800 text-sm">
                                <SelectValue placeholder="From airport" />
                              </SelectTrigger>
                              <SelectContent>
                                {airports.map((airport) => (
                                  <SelectItem key={airport} value={airport}>
                                    {airport}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </>
                        ) : (
                          <AddressInput
                            value={formData.pickup}
                            onChange={(address) => handleAddressChange('pickup', address)}
                            placeholder="From location"
                            icon="pickup"
                            className="w-full pl-8 h-12 sm:h-11 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white hover:border-red-300 shadow-sm text-gray-800 text-sm"
                          />
                        )}
                      </div>

                      {/* Swap Button - Between Inputs */}
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={handleSwapLocations}
                          disabled={!formData.destination}
                          className="w-10 h-10 bg-white border-2 border-gray-200 hover:border-red-300 rounded-full shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group"
                          title="Swap pickup and destination"
                        >
                          <RotateCcw className="w-4 h-4 text-gray-600 group-hover:text-red-500 transition-colors duration-200 group-hover:rotate-180" />
                        </button>
        </div>

                      {/* Second Input - Dynamic based on pickupIsAirport */}
                      <div className="relative flex-1 min-w-0">
                        {!pickupIsAirport ? (
                          <>
                            <Plane className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-500 z-20 pointer-events-none" />
                            <Select onValueChange={(value) => handleAddressChange('destination', value)} value={formData.destination}>
                              <SelectTrigger className="w-full pl-8 h-12 sm:h-11 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white hover:border-red-300 shadow-sm text-gray-800 text-sm">
                                <SelectValue placeholder="To airport" />
                              </SelectTrigger>
                              <SelectContent>
                                {airports.map((airport) => (
                                  <SelectItem key={airport} value={airport}>
                                    {airport}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </>
                        ) : (
                          <AddressInput
                            value={formData.destination}
                            onChange={(address) => handleAddressChange('destination', address)}
                            placeholder="To location"
                            icon="destination"
                            className="w-full pl-8 h-12 sm:h-11 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white hover:border-red-300 shadow-sm text-gray-800 text-sm"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-12 sm:h-11 px-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white hover:border-red-300 shadow-sm text-gray-800 justify-start text-left font-normal text-sm",
                            !formData.date && "text-gray-500"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.date ? format(formData.date, "MMM dd, yyyy") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.date}
                          onSelect={handleDateChange}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <Popover open={isTimePickerOpen} onOpenChange={setIsTimePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-12 px-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white hover:border-red-300 shadow-sm text-gray-800 justify-start text-left font-normal",
                            !formData.time && "text-gray-500"
                          )}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          {formData.time ? new Date(`2000-01-01 ${formData.time}`).toLocaleString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          }) : "Time"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0">
                        <Command>
                          <CommandInput placeholder="Search time..." />
                          <CommandList>
                            <CommandEmpty>No time found.</CommandEmpty>
                            <CommandGroup>
                              {generateTimeOptions().map((time) => (
                                <CommandItem
                                  key={time.value}
                                  onSelect={() => handleTimeChange(time.value)}
                                  className="cursor-pointer"
                                >
                                  {time.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    <div className="relative sm:hidden">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 z-20 pointer-events-none" />
                      <Select onValueChange={(value) => handleSelectChange('passengers', value)} defaultValue="1">
                        <SelectTrigger className="w-full pl-10 h-12 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white hover:border-red-300 shadow-sm text-gray-800 text-sm">
                          <SelectValue placeholder="Passengers" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5,6,7,8].map(num => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} guest{num > 1 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Step 2: Choose Your Ride */}
                <div className="form-step space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Car className="w-4 h-4 text-red-500" />
                        <h3 className="text-sm font-semibold text-gray-800">Choose Your Ride</h3>
                        {!routeInfo && formData.pickup && formData.destination && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            Calculating route...
                          </span>
                        )}
                        {!formData.destination && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            Select destination
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'sedan', icon: Car, name: 'Sedan', passengers: '3', color: 'bg-red-50 border-red-200' },
                          { id: 'suv', icon: Truck, name: 'SUV', passengers: '6', color: 'bg-teal-50 border-teal-200' },
                          { id: 'van', icon: Bus, name: 'Van', passengers: '8', color: 'bg-orange-50 border-orange-200' }
                        ].map((vehicle) => (
                        <div
                          key={vehicle.id}
                          className={cn(
                            "car-3d-card p-2 rounded-lg text-center cursor-pointer",
                            formData.vehicle === vehicle.id ? "selected" : "",
                            vehicle.color
                          )}
                          onClick={() => handleSelectChange('vehicle', vehicle.id)}
                        >
                          <div className="car-3d-icon w-6 h-6 mx-auto mb-1 flex items-center justify-center">
                            <vehicle.icon className="w-5 h-5 text-gray-700" />
                          </div>
                            <h4 className="font-semibold text-gray-800 text-xs mb-1">{vehicle.name}</h4>
                            <p className="text-xs text-gray-600 mb-1">{vehicle.passengers} guests</p>
                            <p className="font-bold text-red-500 text-xs">
                              {estimatedPrices[vehicle.id as keyof typeof estimatedPrices]} MAD
                              {routeInfo && (
                                <span className="block text-xs text-gray-500 font-normal">
                                  ~{routeInfo.distance}
                                </span>
                              )}
                            </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 3: Contact Info */}
                <div className="form-step space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-red-500" />
                    <h3 className="text-sm font-semibold text-gray-800">Contact Details</h3>
                  </div>
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Full Name"
                          className="w-full border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white hover:border-red-300 shadow-sm text-gray-800 placeholder-gray-500"
                          required
                        />
                        <Input
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+212 6XX XX XX XX"
                          className="w-full border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white hover:border-red-300 shadow-sm text-gray-800 placeholder-gray-500"
                          required
                        />
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your@email.com"
                          className="w-full border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white hover:border-red-300 shadow-sm text-gray-800 placeholder-gray-500"
                          required
                        />
                      </div>
                </div>

                <div className="form-step pt-2">
                  <button
                    type="submit"
                    className="w-full premium-button text-white font-bold px-6 py-4 sm:py-3 rounded-xl text-sm sm:text-base tracking-wide transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Plane className="w-4 h-4" />
                    Book My Transfer Now
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-500 mt-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <Check className="w-3 h-3 text-green-500" />
                      <span>Instant confirmation</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5">
                      <X className="w-3 h-3 text-red-500" />
                      <span>No hidden fees</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span>Professional drivers</span>
                    </div>
                  </div>
                </div>
              </form>
              )}

              {/* Car Rental Form */}
              {activeService === 'rental' && (
                <form onSubmit={handleRentalSubmit} className="space-y-4 sm:space-y-5">
                  {/* Step 1: Location & Dates */}
                  <div className="form-step space-y-3 bg-gray-50/50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-800">Pickup Location & Dates</h3>
                    </div>
                    
                    {/* Location */}
                    <div className="space-y-1.5">
                      <div className="relative">
                        <AddressInput
                          value={rentalFormData.location}
                          onChange={(address) => setRentalFormData(prev => ({ ...prev, location: address }))}
                          placeholder="Pickup location"
                          icon="pickup"
                          className="w-full pl-8 h-12 sm:h-11 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white hover:border-red-300 shadow-sm text-gray-800 text-sm"
                        />
                      </div>
                    </div>

                    {/* Pickup and Return Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-12 sm:h-11 px-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white hover:border-red-300 shadow-sm text-gray-800 justify-start text-left font-normal text-sm",
                              !rentalFormData.pickupDate && "text-gray-500"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {rentalFormData.pickupDate ? format(rentalFormData.pickupDate, "MMM dd, yyyy") : "Pickup date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={rentalFormData.pickupDate}
                            onSelect={(date) => handleRentalDateChange('pickupDate', date)}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-12 sm:h-11 px-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white hover:border-red-300 shadow-sm text-gray-800 justify-start text-left font-normal text-sm",
                              !rentalFormData.returnDate && "text-gray-500"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {rentalFormData.returnDate ? format(rentalFormData.returnDate, "MMM dd, yyyy") : "Return date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={rentalFormData.returnDate}
                            onSelect={(date) => handleRentalDateChange('returnDate', date)}
                            disabled={(date) => {
                              const today = new Date(new Date().setHours(0, 0, 0, 0));
                              if (date < today) return true;
                              if (rentalFormData.pickupDate && date <= rentalFormData.pickupDate) return true;
                              return false;
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Pickup and Return Times */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="relative">
                        <Clock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-500 z-20 pointer-events-none" />
                        <Select onValueChange={(value) => handleRentalTimeChange('pickupTime', value)} value={rentalFormData.pickupTime}>
                          <SelectTrigger className="w-full pl-8 h-9 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white hover:border-red-300 shadow-sm text-gray-800 text-xs">
                            <SelectValue placeholder="Pickup time" />
                          </SelectTrigger>
                          <SelectContent>
                            {generateTimeOptions().slice(0, 48).map((time) => (
                              <SelectItem key={time.value} value={time.value}>
                                {time.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="relative">
                        <Clock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-500 z-20 pointer-events-none" />
                        <Select onValueChange={(value) => handleRentalTimeChange('returnTime', value)} value={rentalFormData.returnTime}>
                          <SelectTrigger className="w-full pl-8 h-9 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white hover:border-red-300 shadow-sm text-gray-800 text-xs">
                            <SelectValue placeholder="Return time" />
                          </SelectTrigger>
                          <SelectContent>
                            {generateTimeOptions().slice(0, 48).map((time) => (
                              <SelectItem key={time.value} value={time.value}>
                                {time.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Choose Car Category */}
                  <div className="form-step space-y-3 bg-gray-50/50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Car className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-800">Car Category</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'economy', name: 'Economy', color: 'bg-blue-50 border-blue-200' },
                        { id: 'compact', name: 'Compact', color: 'bg-green-50 border-green-200' },
                        { id: 'midsize', name: 'Midsize', color: 'bg-orange-50 border-orange-200' },
                        { id: 'luxury', name: 'Luxury', color: 'bg-purple-50 border-purple-200' },
                        { id: 'suv', name: 'SUV', color: 'bg-red-50 border-red-200' },
                        { id: 'van', name: 'Van', color: 'bg-indigo-50 border-indigo-200' }
                      ].slice(0, 4).map((category) => (
                        <div
                          key={category.id}
                          className={cn(
                            "car-3d-card p-3 sm:p-2 rounded-lg text-center cursor-pointer border-2 transition-all duration-300 min-h-[80px] flex flex-col justify-center",
                            rentalFormData.carCategory === category.id ? "ring-2 ring-red-500 border-red-300 shadow-md" : "hover:shadow-sm",
                            category.color
                          )}
                          onClick={() => handleRentalSelectChange('carCategory', category.id)}
                        >
                          <div className="car-3d-icon w-6 h-6 mx-auto mb-2 flex items-center justify-center">
                            <Car className="w-5 h-5 text-gray-700" />
                          </div>
                          <h4 className="font-semibold text-gray-800 text-sm mb-1">{category.name}</h4>
                          <p className="text-xs text-gray-600">From 200 MAD/day</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step 3: Contact Info */}
                  <div className="form-step space-y-3 bg-gray-50/50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Phone className="w-4 h-4 text-orange-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-800">Contact Details</h3>
                    </div>
                    <div className="space-y-3">
                      <Input
                        name="name"
                        value={rentalFormData.name}
                        onChange={handleRentalInputChange}
                        placeholder="Full Name"
                        className="w-full h-12 sm:h-11 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white hover:border-red-300 shadow-sm text-gray-800 placeholder-gray-500 text-sm"
                        required
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          name="phone"
                          type="tel"
                          value={rentalFormData.phone}
                          onChange={handleRentalInputChange}
                          placeholder="+212 6XX XX XX XX"
                          className="w-full h-12 sm:h-11 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white hover:border-red-300 shadow-sm text-gray-800 placeholder-gray-500 text-sm"
                          required
                        />
                        <Input
                          name="email"
                          type="email"
                          value={rentalFormData.email}
                          onChange={handleRentalInputChange}
                          placeholder="your@email.com"
                          className="w-full h-12 sm:h-11 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white hover:border-red-300 shadow-sm text-gray-800 placeholder-gray-500 text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-step pt-2">
                    <button
                      type="submit"
                      className="w-full premium-button text-white font-bold px-6 py-4 sm:py-3 rounded-xl text-sm sm:text-base tracking-wide transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Car className="w-4 h-4" />
                      Find Available Cars
                    </button>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-1.5">
                      <div className="flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5 text-green-500" />
                        <span>Best prices</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <X className="w-2.5 h-2.5 text-red-500" />
                        <span>No hidden fees</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 text-yellow-500" />
                        <span>Top agencies</span>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Right: Content + Interactive Map (Desktop Only) */}
            <div className="hidden lg:block">
              {/* Content Before Map */}
                  <div className="mb-4 text-center">
                    <div className="inline-flex items-center bg-white/20 backdrop-filter backdrop-blur-sm px-3 py-1 rounded-full mb-3 border border-white/30">
                      {activeService === 'transfer' ? (
                        <>
                          <Plane className="w-4 h-4 mr-2 text-white" />
                          <span className="text-xs font-medium text-white">Mohammed V Airport Transfer</span>
                        </>
                      ) : (
                        <>
                          <Car className="w-4 h-4 mr-2 text-white" />
                          <span className="text-xs font-medium text-white">Car Rental Marketplace</span>
                        </>
                      )}
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight text-white">
                      {activeService === 'transfer' ? 'Airport Transfer' : 'Car Rental'}
                    </h1>
                    
                    <p className="text-sm mb-3 text-white/90 max-w-md mx-auto leading-relaxed">
                      {activeService === 'transfer' 
                        ? 'Professional airport transfer service with smart location suggestions. Use the swap button to switch pickup and destination effortlessly.'
                        : 'Find and rent cars from trusted agencies across Morocco. Compare prices, choose your perfect vehicle, and book instantly.'
                      }
                    </p>

                    {/* Trust Indicators */}
                    <div className="flex items-center justify-center gap-4 mb-4 text-xs text-white/80">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span>50+ Partner Agencies</span>
                      </div>
                      <div className="w-px h-3 bg-white/30"></div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span>10K+ Happy Customers</span>
                      </div>
                      <div className="w-px h-3 bg-white/30"></div>
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-blue-400" />
                        <span>Licensed Platform</span>
                      </div>
                    </div>
                
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  {activeService === 'transfer' ? (
                    <>
                      <div className="flex flex-col items-center text-xs text-white">
                        <div className="w-8 h-8 bg-gradient-to-br from-white/30 to-white/10 rounded-full mb-2 flex items-center justify-center border border-white/20">
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold">24/7 Available</span>
                      </div>
                      <div className="flex flex-col items-center text-xs text-white">
                        <div className="w-8 h-8 bg-gradient-to-br from-white/30 to-white/10 rounded-full mb-2 flex items-center justify-center border border-white/20">
                          <Target className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold">Licensed Drivers</span>
                      </div>
                      <div className="flex flex-col items-center text-xs text-white">
                        <div className="w-8 h-8 bg-gradient-to-br from-white/30 to-white/10 rounded-full mb-2 flex items-center justify-center border border-white/20">
                          <DollarSign className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold">Smart Pricing</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col items-center text-xs text-white">
                        <div className="w-8 h-8 bg-gradient-to-br from-white/30 to-white/10 rounded-full mb-2 flex items-center justify-center border border-white/20">
                          <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold">Top Agencies</span>
                      </div>
                      <div className="flex flex-col items-center text-xs text-white">
                        <div className="w-8 h-8 bg-gradient-to-br from-white/30 to-white/10 rounded-full mb-2 flex items-center justify-center border border-white/20">
                          <Star className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold">Best Prices</span>
                      </div>
                      <div className="flex flex-col items-center text-xs text-white">
                        <div className="w-8 h-8 bg-gradient-to-br from-white/30 to-white/10 rounded-full mb-2 flex items-center justify-center border border-white/20">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold">Instant Booking</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {activeService === 'transfer' ? (
                <RouteMap 
                  pickup={formData.pickup} 
                  destination={formData.destination} 
                  className="h-[300px] w-full"
                  onRouteCalculated={(info) => {
                    if (info && info.distanceValue > 0) {
                      setRouteInfo(info);
                      const distanceInKm = info.distanceValue / 1000; // Convert meters to km
                      calculatePricing(distanceInKm);
                    } else {
                      // Reset to default pricing if route calculation fails
                      setRouteInfo(null);
                      setEstimatedPrices({
                        sedan: 250,
                        suv: 350,
                        van: 500
                      });
                    }
                  }}
                />
              ) : (
                /* Car Rental Preview - Placeholder for featured cars or agencies */
                <div className="h-[300px] w-full bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                      <Car className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-white text-lg font-semibold mb-2">Thousands of Cars Available</p>
                    <p className="text-white/80 text-sm">From economy to luxury, find your perfect rental</p>
                    <div className="grid grid-cols-3 gap-2 mt-4 text-xs text-white/90">
                      <div>Economy</div>
                      <div>Premium</div>
                      <div>Luxury</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
        </section>


        {/* Premium Fleet - Structured Asymmetrical Layout */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gray-50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Desktop: Integrated Grid Layout */}
          <div className="hidden lg:grid grid-cols-12 gap-4 h-[420px]">
            
            {/* Left Column - Hero Vehicle with Integrated Header */}
            <div className="col-span-7 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl overflow-hidden shadow-xl group relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"></div>
          <Image
                src="/mercedes-gle.webp" 
                alt="Mercedes-Benz GLE" 
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              
              {/* Integrated Header - Top Left */}
              <div className="absolute top-6 left-6 z-20">
                <div className="bg-black/60 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-sm">
                  <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                    Airport <span className="text-orange-300">Transfer</span> Options
                  </h2>
                  <p className="text-orange-200 text-sm mb-4 drop-shadow-md">
                    Professional chauffeur service to and from Mohammed V Airport
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white">
                      <CheckCircle className="w-3 h-3" />
                      Flight Tracking
                    </span>
                    <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white">
                      <Star className="w-3 h-3" />
                      Professional Chauffeur
                    </span>
                  </div>
                  <button className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 w-full">
                    Book Transfer Now
                  </button>
                </div>
              </div>

              <div className="absolute top-6 right-6 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold z-20 shadow-lg">
                FEATURED
              </div>
              <div className="absolute bottom-0 left-0 right-0 z-20">
                <div className="bg-gradient-to-t from-black/80 to-transparent p-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-3xl font-bold mb-2 text-white drop-shadow-lg">Mercedes GLE</h3>
                      <p className="text-orange-200 mb-4 drop-shadow-md">Premium Airport Transfer • Family & Business Groups</p>
                      <div className="flex gap-6 text-sm">
                        <span className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-white">
                          <Users className="w-4 h-4" />
                          6 passengers
                        </span>
                        <span className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-white">
                          <Luggage className="w-4 h-4" />
                          6 bags
                        </span>
                        <span className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-white">
                          <Snowflake className="w-4 h-4" />
                          Premium A/C
                        </span>
                      </div>
                    </div>
                    <div className="text-right bg-black/40 backdrop-blur-sm rounded-xl p-4">
                      <div className="text-sm text-orange-200 drop-shadow-md">Starting from</div>
                      <div className="text-4xl font-bold text-white drop-shadow-lg">350 MAD</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

             {/* Right Column - Split Layout */}
             <div className="col-span-5 space-y-4">
               
               {/* Top Right - Service Features */}
               <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-lg h-[130px]">
                 <h3 className="text-lg font-bold text-white mb-4">All Transfers Include</h3>
                 <div className="grid grid-cols-2 gap-3">
                   <div className="flex items-center gap-2">
                     <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                       <Snowflake className="w-4 h-4 text-blue-400" />
                     </div>
                     <span className="text-white text-sm">Climate Control</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                       <Building2 className="w-4 h-4 text-orange-400" />
                     </div>
                     <span className="text-white text-sm">Meet & Greet</span>
                   </div>
                 </div>
               </div>

               {/* Middle Right - Mercedes E-Class */}
               <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl overflow-hidden shadow-lg group relative h-[135px]">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"></div>
                <Image 
                  src="/mercedes-e-class.webp" 
                  alt="Mercedes-Benz E-Class" 
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold z-20 shadow-lg">
                  EXECUTIVE
                </div>
                <div className="absolute bottom-0 left-0 right-0 z-20">
                  <div className="bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex justify-between items-end">
                      <div>
                      <h4 className="text-xl font-bold mb-1 text-white drop-shadow-lg">Mercedes E-Class</h4>
                      <p className="text-blue-200 text-sm mb-2 drop-shadow-md">Executive Airport Transfer</p>
                        <div className="flex gap-2 text-xs">
                          <span className="bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full text-white">3 passengers</span>
                          <span className="bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full text-white">3 bags</span>
                          <span className="bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full text-white">Wi-Fi</span>
                        </div>
                      </div>
                      <div className="bg-black/40 backdrop-blur-sm rounded-lg p-2">
                        <div className="text-2xl font-bold text-white drop-shadow-lg">250 MAD</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

               {/* Bottom Right - Mercedes V-Class */}
               <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl overflow-hidden shadow-lg group relative h-[135px]">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"></div>
                <Image 
                  src="/mercedes-v-class.webp" 
                  alt="Mercedes-Benz V-Class" 
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold z-20 shadow-lg">
                  LUXURY
                </div>
                <div className="absolute bottom-0 left-0 right-0 z-20">
                  <div className="bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex justify-between items-end">
                      <div>
                      <h4 className="text-xl font-bold mb-1 text-white drop-shadow-lg">Mercedes V-Class</h4>
                      <p className="text-purple-200 text-sm mb-2 drop-shadow-md">VIP Airport Transfer</p>
                        <div className="flex gap-2 text-xs">
                          <span className="bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full text-white">8 passengers</span>
                          <span className="bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full text-white">8+ bags</span>
                          <span className="bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full text-white">Corporate</span>
                        </div>
                      </div>
                      <div className="bg-black/40 backdrop-blur-sm rounded-lg p-2">
                        <div className="text-2xl font-bold text-white drop-shadow-lg">500 MAD</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile & Tablet: Compact Header + Vehicle Stack */}
          <div className="lg:hidden">
            {/* Compact Mobile Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                Airport <span className="text-red-600">Transfer</span> Options
              </h2>
              <p className="text-sm text-gray-600 mb-4">Professional chauffeur service to Mohammed V Airport</p>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">Flight Tracking</span>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">Climate Control</span>
                <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-medium">Professional Chauffeur</span>
                <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">Meet & Greet</span>
              </div>
              <button className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-2 rounded-lg font-semibold text-sm shadow-lg">
                Book Transfer Now
              </button>
            </div>

            {/* Vehicle Cards */}
            <div className="space-y-4">
            {[
              { 
                name: "Mercedes GLE", 
                price: "350 MAD", 
                category: "FEATURED", 
                description: "Premium Airport Transfer • Family Groups", 
                color: "orange",
                gradient: "from-orange-500 to-red-600",
                passengers: 6, 
                bags: 6,
                features: ["Premium A/C", "Luxury Interior"]
              },
              { 
                name: "Mercedes E-Class", 
                price: "250 MAD", 
                category: "EXECUTIVE", 
                description: "Executive Airport Transfer • Business Travel", 
                color: "blue",
                gradient: "from-blue-500 to-indigo-600",
                passengers: 3, 
                bags: 3,
                features: ["Wi-Fi", "Climate Control"]
              },
              { 
                name: "Mercedes V-Class", 
                price: "500 MAD", 
                category: "LUXURY", 
                description: "VIP Airport Transfer • Large Groups", 
                color: "purple",
                gradient: "from-purple-500 to-pink-600",
                passengers: 8, 
                bags: "8+",
                features: ["Corporate", "Premium Service"]
              }
             ].map((vehicle, index) => (
               <div key={index} className={`bg-gradient-to-br ${vehicle.gradient} rounded-2xl overflow-hidden shadow-lg group relative h-[200px]`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"></div>
                <Image 
                  src={`/mercedes-${vehicle.name.toLowerCase().includes('gle') ? 'gle' : vehicle.name.toLowerCase().includes('e-class') ? 'e-class' : 'v-class'}.webp`}
                  alt={vehicle.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className={`absolute top-4 right-4 bg-${vehicle.color}-500 text-white px-3 py-1 rounded-full text-xs font-bold z-20 shadow-lg`}>
                  {vehicle.category}
                </div>
                <div className="absolute bottom-0 left-0 right-0 z-20">
                  <div className="bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <h3 className="text-2xl font-bold mb-1 text-white drop-shadow-lg">{vehicle.name}</h3>
                        <p className="text-white/90 text-sm mb-3 drop-shadow-md">{vehicle.description}</p>
                        <div className="flex gap-3 text-sm">
                          <span className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-white">
                            <Users className="w-4 h-4" />
                            {vehicle.passengers} passengers
                          </span>
                          <span className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-white">
                            <Luggage className="w-4 h-4" />
                            {vehicle.bags} bags
                          </span>
                        </div>
                      </div>
                      <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3">
                        <div className="text-3xl font-bold text-white drop-shadow-lg">{vehicle.price}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>

        </div>
      </section>

      {/* How It Works - Horizontal Layout */}
      <section id="services" className="py-8 sm:py-12 lg:py-16 bg-blue-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Main Horizontal Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            
            {/* Left Side - Process Steps in 2x2 Grid */}
            <div className="relative order-2 lg:order-1">
              
              {/* Process Steps Grid */}
              <div className="grid grid-cols-2 gap-4 lg:gap-6">
                
                {/* Step 1 - Book Online */}
                <div className="group relative">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-lg border border-white/20 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:bg-white/90">
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      1
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                      <CalendarIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Book Online</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      Select pickup, destination, and preferred time
                    </p>
                    <div className="flex items-center text-orange-600 font-semibold text-xs">
                      <span className="mr-1">Quick & Easy</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                {/* Step 2 - Get Confirmation */}
                <div className="group relative">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-lg border border-white/20 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:bg-white/90">
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      2
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Get Confirmation</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      Instant confirmation with trip details via SMS & email
                    </p>
                    <div className="flex items-center text-blue-600 font-semibold text-xs">
                      <span className="mr-1">Instant Updates</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                {/* Step 3 - Meet Driver */}
                <div className="group relative">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-lg border border-white/20 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:bg-white/90">
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      3
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                      <UserCheck className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Meet Driver</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      Professional chauffeur waits at pickup with name sign
                    </p>
                    <div className="flex items-center text-green-600 font-semibold text-xs">
                      <span className="mr-1">On Time</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                {/* Step 4 - Arrive Safely */}
                <div className="group relative">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-lg border border-white/20 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:bg-white/90">
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      4
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Arrive Safely</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      Comfortable journey with premium service guaranteed
                    </p>
                    <div className="flex items-center text-purple-600 font-semibold text-xs">
                      <span className="mr-1">Comfort First</span>
                      <CheckCircle className="w-3 h-3" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Connecting Flow Lines for Steps */}
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                  <defs>
                    <linearGradient id="stepFlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="25%" stopColor="#3b82f6" />
                      <stop offset="50%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  {/* Horizontal connection top */}
                  <path d="M 50 20 Q 75 20 75 20" stroke="url(#stepFlowGradient)" strokeWidth="1" strokeDasharray="3,2" opacity="0.3" />
                  {/* Vertical connection right */}
                  <path d="M 75 20 Q 75 45 75 50" stroke="url(#stepFlowGradient)" strokeWidth="1" strokeDasharray="3,2" opacity="0.3" />
                  {/* Horizontal connection bottom */}
                  <path d="M 75 50 Q 50 50 25 50" stroke="url(#stepFlowGradient)" strokeWidth="1" strokeDasharray="3,2" opacity="0.3" />
                </svg>
              </div>
            </div>
            
            {/* Right Side - Content */}
            <div className="space-y-6 order-1 lg:order-2">
              <div>
                <div className="inline-block mb-4">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-sm font-semibold tracking-wide uppercase">
                    Simple Process
                  </span>
                </div>
                <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  Airport transfers made 
                  <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent block">easy</span>
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  Follow our streamlined booking process for seamless travel experience from door to destination
                </p>
              </div>

              {/* Horizontal Benefits */}
              <div className="flex flex-wrap gap-6 lg:gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">4</div>
                    <div className="text-sm text-gray-600">Simple Steps</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">24/7</div>
                    <div className="text-sm text-gray-600">Instant Support</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">100%</div>
                    <div className="text-sm text-gray-600">Guaranteed</div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-4">
                <button className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  Start Booking Now
                </button>
                <p className="text-sm text-gray-500 mt-3">No hidden fees • Cancel anytime • Professional service</p>
              </div>
            </div>
            
          </div>

        </div>

        {/* Subtle Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-5 w-20 h-20 bg-gradient-to-br from-orange-500/8 to-red-600/8 rounded-full blur-2xl"></div>
          <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-blue-500/8 to-indigo-600/8 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-24 h-24 bg-gradient-to-br from-green-500/8 to-emerald-600/8 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-5 w-28 h-28 bg-gradient-to-br from-purple-500/8 to-pink-600/8 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Partner Network Showcase - Horizontal Layout */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gray-100 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Horizontal Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            
            {/* Left Side - Content */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-800 mb-4 leading-tight">
                  Trusted by Leading 
                  <span className="text-red-600 block">Agencies</span>
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  We partner with verified, professional agencies across Morocco to ensure the highest quality service for our customers
                </p>
              </div>

              {/* Horizontal Stats */}
              <div className="flex flex-wrap gap-6 lg:gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">50+</div>
                    <div className="text-sm text-gray-600">Verified Agencies</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <Car className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">500+</div>
                    <div className="text-sm text-gray-600">Premium Vehicles</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">24/7</div>
                    <div className="text-sm text-gray-600">Support Available</div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-red-600 hover:to-orange-600 transition-all duration-300 shadow-lg">
                  Become a Partner
                </button>
                <button className="border-2 border-red-500 text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-red-500 hover:text-white transition-all duration-300">
                  Learn More
                </button>
              </div>
            </div>

            {/* Right Side - Flowing Agencies */}
            <div className="relative">
              {/* Background Design Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-100/50 to-orange-100/50 rounded-3xl transform rotate-3"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/30 to-purple-100/30 rounded-3xl transform -rotate-2"></div>
              
              {/* Agencies Container */}
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-xl">
                <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Featured Partners</h3>
                
                {/* Flowing Agency Cards */}
                <div className="space-y-4">
                  {/* Row 1 - 3 agencies */}
                  <div className="flex gap-3 justify-center">
                    {[
                      { name: "Atlas Premium", rating: "4.9", color: "from-blue-500 to-blue-600" },
                      { name: "Morocco Elite", rating: "4.8", color: "from-green-500 to-green-600" },
                      { name: "Royal Transport", rating: "5.0", color: "from-purple-500 to-purple-600" }
                    ].map((agency, index) => (
                      <div key={index} className="flex-1 bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center transform hover:scale-105 transition-transform duration-200">
                        <div className={`w-8 h-8 bg-gradient-to-br ${agency.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                          <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="font-semibold text-gray-800 text-xs mb-1">{agency.name}</h4>
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-gray-600">{agency.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Row 2 - 2 agencies (offset) */}
                  <div className="flex gap-3 justify-center px-8">
                    {[
                      { name: "Desert Luxury", rating: "4.9", color: "from-orange-500 to-red-500" },
                      { name: "Casablanca Cars", rating: "4.7", color: "from-indigo-500 to-blue-500" }
                    ].map((agency, index) => (
                      <div key={index} className="flex-1 bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center transform hover:scale-105 transition-transform duration-200">
                        <div className={`w-8 h-8 bg-gradient-to-br ${agency.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                          <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="font-semibold text-gray-800 text-xs mb-1">{agency.name}</h4>
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-gray-600">{agency.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Trust Badge */}
                  <div className="text-center pt-4">
                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      <CheckCircle className="w-3 h-3" />
                      All agencies verified & licensed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Flow - Mobile-friendly agency showcase */}
          <div className="mt-16 lg:hidden">
            <div className="overflow-hidden">
              <div className="flex gap-4 pb-4 animate-pulse">
                {[
                  "Atlas Premium", "Morocco Elite", "Royal Transport", 
                  "Desert Luxury", "Casablanca Cars", "Premium Maroc"
                ].map((name, index) => (
                  <div key={index} className="flex-shrink-0 bg-white rounded-lg p-3 shadow-sm border border-gray-200 text-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xs font-semibold text-gray-800">{name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-6 sm:py-8 lg:py-10 bg-gray-50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center mb-3 sm:mb-4 lg:mb-6">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">Why Choose Venboo Platform?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Experience the future of transportation booking - connecting customers with premium agencies across Morocco</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            
            {/* Feature 1 - Multi-Platform Value */}
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-1 sm:mb-2">Verified Network</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-tight">50+ licensed agencies with verified credentials and insurance</p>
            </div>

            {/* Feature 2 - Smart Technology */}
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-1 sm:mb-2">Smart Matching</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-tight">AI-powered matching connects you with the best available service</p>
            </div>

            {/* Feature 3 - Competitive Pricing */}
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-1 sm:mb-2">Best Prices</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-tight">Compare rates across agencies for guaranteed competitive pricing</p>
            </div>

            {/* Feature 4 - 24/7 Support */}
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-1 sm:mb-2">Full Support</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-tight">24/7 customer support with real-time booking assistance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">What Our Community Says</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Trusted by customers and partners across Morocco
            </p>
          </div>

          {(() => {
            // Testimonials data
            const testimonials = [
              {
                id: 1,
                name: "Ahmed Hassan",
                role: "Business Traveler",
                avatar: "A",
                bgGradient: "from-blue-50 to-blue-100",
                borderColor: "border-blue-200",
                avatarBg: "bg-blue-500",
                testimonial: "Excellent service from Casablanca to Marrakech. Professional driver, clean vehicle, and competitive pricing. Will definitely use Venboo again!",
                isAgency: false
              },
              {
                id: 2,
                name: "Atlas Premium Cars",
                role: "Partner Agency",
                avatar: "building",
                bgGradient: "from-green-50 to-emerald-100",
                borderColor: "border-green-200",
                avatarBg: "bg-green-500",
                testimonial: "Venboo has transformed our business. 40% increase in bookings and excellent support team. The platform makes everything easy for both us and customers.",
                isAgency: true
              },
              {
                id: 3,
                name: "Sarah Mitchell",
                role: "Tourist",
                avatar: "S",
                bgGradient: "from-purple-50 to-purple-100",
                borderColor: "border-purple-200",
                avatarBg: "bg-purple-500",
                testimonial: "Amazing experience exploring Morocco! The Mercedes V-Class was perfect for our group, and the driver was very knowledgeable about local attractions.",
                isAgency: false
              },
              {
                id: 4,
                name: "Mohamed Alami",
                role: "Corporate Client",
                avatar: "M",
                bgGradient: "from-orange-50 to-red-100",
                borderColor: "border-orange-200",
                avatarBg: "bg-orange-500",
                testimonial: "We use Venboo for all our corporate transfers. Reliable, professional, and the booking platform is incredibly user-friendly.",
                isAgency: false
              },
              {
                id: 5,
                name: "Royal Transport",
                role: "Partner Agency",
                avatar: "building",
                bgGradient: "from-indigo-50 to-blue-100",
                borderColor: "border-indigo-200",
                avatarBg: "bg-indigo-500",
                testimonial: "Outstanding partnership with Venboo. Their platform helps us reach more customers while maintaining our service quality standards.",
                isAgency: true
              },
              {
                id: 6,
                name: "Lisa Johnson",
                role: "Family Traveler",
                avatar: "L",
                bgGradient: "from-pink-50 to-rose-100",
                borderColor: "border-pink-200",
                avatarBg: "bg-pink-500",
                testimonial: "Perfect family vacation in Morocco! The booking process was smooth, and our driver took great care of us throughout the trip.",
                isAgency: false
              }
            ];

            // Auto-slide functionality
            const totalSlides = Math.ceil(testimonials.length / 2); // Show 2 testimonials per slide

            /* eslint-disable react-hooks/rules-of-hooks */
            useEffect(() => {
              const interval = setInterval(() => {
                setCurrentTestimonialSlide(prev => 
                  prev === totalSlides - 1 ? 0 : prev + 1
                );
              }, 5000); // Change slide every 5 seconds

              return () => clearInterval(interval);
            }, [totalSlides]);
            /* eslint-enable react-hooks/rules-of-hooks */

            const handleSlideChange = (slideIndex: number) => {
              setCurrentTestimonialSlide(slideIndex);
            };

            return (
              <>
                {/* Carousel Container */}
                <div className="relative overflow-hidden">
                  <div 
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{
                      transform: `translateX(-${currentTestimonialSlide * 100}%)`
                    }}
                  >
                    {Array.from({ length: totalSlides }, (_, slideIndex) => (
                      <div key={slideIndex} className="w-full flex-shrink-0">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                          {testimonials
                            .slice(slideIndex * 2, slideIndex * 2 + 2)
                            .map((testimonial) => (
                              <div 
                                key={testimonial.id}
                                className={`bg-gradient-to-br ${testimonial.bgGradient} rounded-2xl p-6 ${testimonial.borderColor} border`}
                              >
                                <div className="flex items-center mb-4">
                                  <div className={`w-12 h-12 ${testimonial.avatarBg} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                                    {testimonial.isAgency ? (
                                      <Building2 className="w-6 h-6 text-white" />
                                    ) : (
                                      testimonial.avatar
                                    )}
                                  </div>
                                  <div className="ml-3">
                                    <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                                  </div>
                                  <div className="ml-auto flex">
                                    {[1,2,3,4,5].map(i => (
                                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-gray-700 italic">
                                  &ldquo;{testimonial.testimonial}&rdquo;
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Dots */}
                <div className="flex justify-center mt-8 space-x-2">
                  {Array.from({ length: totalSlides }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => handleSlideChange(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        currentTestimonialSlide === index
                          ? 'bg-red-500 scale-110'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            );
          })()}

          {/* Trust Statistics */}
          <div className="mt-12 bg-gray-50 rounded-2xl p-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-gray-800 mb-2">4.8/5</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-800 mb-2">10K+</div>
                <div className="text-sm text-gray-600">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-800 mb-2">99%</div>
                <div className="text-sm text-gray-600">On-Time Performance</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-800 mb-2">50+</div>
                <div className="text-sm text-gray-600">Partner Agencies</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-6 sm:py-8 lg:py-10 bg-gray-50 relative z-10 text-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-3 sm:mb-4 lg:mb-5">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 text-gray-800">Contact Us</h2>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
            
            {/* Quick Contact Cards */}
            <div className="bg-gray-50 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <h3 className="text-xs sm:text-sm lg:text-base font-bold text-gray-900 mb-1">Call Us</h3>
              <a href="tel:+212600000000" className="text-xs sm:text-sm lg:text-base font-bold text-red-500 hover:text-red-600 block leading-tight">
                +212 6 00 00 00 00
              </a>
            </div>

            <div className="bg-gray-50 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <h3 className="text-xs sm:text-sm lg:text-base font-bold text-gray-900 mb-1">WhatsApp</h3>
              <a href="https://wa.me/212600000000" className="text-xs sm:text-sm lg:text-base font-bold text-green-600 hover:text-green-700">
                Message Us
              </a>
            </div>

            <div className="bg-gray-50 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <h3 className="text-xs sm:text-sm lg:text-base font-bold text-gray-900 mb-1">Email</h3>
              <a href="mailto:booking@venboo.com" className="text-xs sm:text-sm lg:text-base font-bold text-blue-600 hover:text-blue-700 break-all leading-tight">
                booking@venboo.com
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="mt-3 sm:mt-4 lg:mt-6 bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5">
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-800 text-center">Send us a message</h3>
            <form onSubmit={handleContactSubmit} className="space-y-3 sm:space-y-4 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Name</label>
                  <Input
                    name="name"
                    value={contactFormData.name}
                    onChange={handleContactInputChange}
                    placeholder="Your full name"
                    className="w-full border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white shadow-sm text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Phone</label>
                  <Input
                    name="phone"
                    type="tel"
                    value={contactFormData.phone}
                    onChange={handleContactInputChange}
                    placeholder="+212 6XX XX XX XX"
                    className="w-full border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white shadow-sm text-gray-800"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Email</label>
                <Input
                  name="email"
                  type="email"
                  value={contactFormData.email}
                  onChange={handleContactInputChange}
                  placeholder="your@email.com"
                  className="w-full border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white shadow-sm text-gray-800"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Service</label>
                  <Select onValueChange={handleContactSelectChange}>
                    <SelectTrigger className="w-full px-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white shadow-sm text-gray-800">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="airport-transfer">Airport Transfer</SelectItem>
                      <SelectItem value="city-transfer">City Transfer</SelectItem>
                      <SelectItem value="hourly-service">Hourly Service</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white shadow-sm text-gray-800 justify-start text-left font-normal",
                          !contactFormData.date && "text-gray-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {contactFormData.date ? format(contactFormData.date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={contactFormData.date}
                        onSelect={handleContactDateChange}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Message</label>
                <Textarea
                  name="message"
                  value={contactFormData.message}
                  onChange={handleContactInputChange}
                  rows={2}
                  placeholder="Tell us about your transfer needs..."
                  className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white shadow-sm text-gray-800"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full premium-button text-white font-bold px-6 rounded-lg text-lg flex items-center justify-center max-w-md mx-auto"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-800 text-white border-t border-gray-200 py-6 sm:py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
            <div className="mb-4 sm:mb-0">
              <div className="text-xl sm:text-2xl font-bold text-white">Venboo</div>
              <p className="text-sm text-gray-300">Premium Transportation & Car Rental</p>
            </div>
            <div className="text-sm text-center sm:text-right text-gray-300">
              <p>&copy; 2025 Venboo. All rights reserved.</p>
              <p>Licensed & Insured Transportation Service</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
