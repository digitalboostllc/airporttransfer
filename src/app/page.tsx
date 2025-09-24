'use client';

import { useState } from 'react';
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
  Wifi
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
import dynamic from 'next/dynamic';
import AddressInput from '@/components/AddressInput';

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

  // Track which input is for airport vs general location
  const [pickupIsAirport, setPickupIsAirport] = useState(true);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Booking request:', formData);
    alert('Thank you for your booking request! We will contact you shortly.');
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', contactFormData);
    alert('Thank you for your message! We will get back to you soon.');
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">
      {/* Hero Section */}
      <section className="text-white relative min-h-screen lg:h-screen flex flex-col bg-gradient-to-br from-red-500 via-orange-500 to-red-600">
        {/* Background Image - Desktop */}
        <div 
          className="hidden md:block absolute inset-0 bg-cover bg-center bg-no-repeat" 
          style={{backgroundImage: 'url(/morocco-hero-bg.jpg)'}}
        ></div>
        
        {/* Background Image - Mobile (Optimized) */}
        <img 
          src="/morocco-hero-bg-mobile.jpg" 
          alt="Morocco Landscape" 
          className="md:hidden absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        {/* Header inside Hero */}
        <header className="relative z-50 pt-4 pb-4">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg px-6 py-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">R</span>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-800 tracking-tight">ride.ma</div>
                  </div>
                </div>
                <nav className="hidden md:flex items-center space-x-4">
                  <a href="#services" className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-red-500 transition-all duration-300 text-sm font-medium">Services</a>
                  <a href="#about" className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-red-500 transition-all duration-300 text-sm font-medium">About</a>
                  <a href="#contact" className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-red-500 transition-all duration-300 text-sm font-medium">Contact</a>
                </nav>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {/* Mobile menu links - visible only on small screens */}
                  <div className="md:hidden flex items-center space-x-1">
                    <a href="#services" className="px-2 py-1 text-xs font-medium text-gray-700 hover:text-red-500 transition-colors">Services</a>
                    <span className="text-gray-300">•</span>
                    <a href="#about" className="px-2 py-1 text-xs font-medium text-gray-700 hover:text-red-500 transition-colors">About</a>
                    <span className="text-gray-300">•</span>
                    <a href="#contact" className="px-2 py-1 text-xs font-medium text-gray-700 hover:text-red-500 transition-colors">Contact</a>
                  </div>
                  <div className="hidden sm:flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-700 text-xs font-semibold">Available 24/7</span>
                  </div>
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
        </header>
        
        {/* Hero Content */}
        <div className="flex-1 flex items-center py-8 lg:py-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center lg:items-end">
            {/* Left: Compact Premium Booking Form */}
            <div className="compact-form rounded-3xl p-4 sm:p-6">
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold mb-1 text-gray-800">Book Your Ride</h2>
                <p className="text-gray-600 text-xs sm:text-sm">Quick & easy booking</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Step 1: Route & Time */}
                <div className="form-step space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <h3 className="text-sm font-semibold text-gray-800">Where & When</h3>
                  </div>
                  {/* Integrated Layout: Inputs with Swap Button Between */}
                  <div className="space-y-3">
                    <div className="flex items-stretch gap-2">
                      {/* First Input - Dynamic based on pickupIsAirport */}
                      <div className="relative flex-1 min-w-0">
                        {pickupIsAirport ? (
                          <>
                            <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 z-20 pointer-events-none" />
                            <Select onValueChange={(value) => handleAddressChange('pickup', value)} value={formData.pickup}>
                              <SelectTrigger className="w-full pl-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white hover:border-red-300 shadow-sm text-gray-800">
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
                            className="w-full pl-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white hover:border-red-300 shadow-sm text-gray-800"
                          />
                        )}
                      </div>

                      {/* Swap Button - Between Inputs */}
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={handleSwapLocations}
                          disabled={!formData.destination}
                          className="w-12 h-12 bg-white border-2 border-gray-200 hover:border-red-300 rounded-full shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group"
                          title="Swap pickup and destination"
                        >
                          <RotateCcw className="w-4 h-4 text-gray-600 group-hover:text-red-500 transition-colors duration-200 group-hover:rotate-180" />
                        </button>
                      </div>

                      {/* Second Input - Dynamic based on pickupIsAirport */}
                      <div className="relative flex-1 min-w-0">
                        {!pickupIsAirport ? (
                          <>
                            <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 z-20 pointer-events-none" />
                            <Select onValueChange={(value) => handleAddressChange('destination', value)} value={formData.destination}>
                              <SelectTrigger className="w-full pl-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white hover:border-red-300 shadow-sm text-gray-800">
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
                            className="w-full pl-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white hover:border-red-300 shadow-sm text-gray-800"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-12 px-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white hover:border-red-300 shadow-sm text-gray-800 justify-start text-left font-normal",
                            !formData.date && "text-gray-500"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.date ? format(formData.date, "MMM dd") : "Date"}
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

                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 z-20 pointer-events-none" />
                      <Select onValueChange={(value) => handleSelectChange('passengers', value)} defaultValue="1">
                        <SelectTrigger className="w-full pl-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white hover:border-red-300 shadow-sm text-gray-800">
                          <SelectValue placeholder="Guests" />
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

                <div className="form-step pt-1">
                  <button
                    type="submit"
                    className="w-full premium-button text-white font-bold px-4 rounded-xl text-sm tracking-wide transition-all duration-300 flex items-center justify-center"
                  >
                    Book My Ride Now
                  </button>
                  <div className="flex items-center justify-center gap-3 text-xs text-gray-500 mt-2">
                    <div className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-green-500" />
                      <span>Instant confirmation</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <X className="w-3 h-3 text-red-500" />
                      <span>No hidden fees</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span>Professional drivers</span>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Right: Content + Interactive Map */}
            <div>
              {/* Content Before Map */}
                  <div className="mb-4 text-center">
                    <div className="inline-flex items-center bg-white/20 backdrop-filter backdrop-blur-sm px-3 py-1 rounded-full mb-3 border border-white/30">
                      <Plane className="w-4 h-4 mr-2 text-white" />
                      <span className="text-xs font-medium text-white">Mohammed V Airport Transfer</span>
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight text-white">
                      Airport Transfer
                    </h1>
                    
                    <p className="text-sm mb-4 text-white/90 max-w-md mx-auto leading-relaxed">
                      Professional airport transfer service with smart location suggestions. Use the swap button to switch pickup and destination effortlessly.
                    </p>
                
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
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
                </div>
              </div>

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
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* Premium Vehicle Gallery */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">Our Premium Fleet</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose from our carefully selected fleet of luxury vehicles, each maintained to the highest standards
            </p>
          </div>

          {/* Mobile: Horizontal Scroll Carousel */}
          <div className="md:hidden">
            <div className="flex overflow-x-auto gap-4 px-4 pb-4 pt-8 snap-x snap-mandatory scrollbar-hide" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
              <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {/* Mercedes E-Class - Mobile */}
              <div className="group bg-white rounded-3xl overflow-hidden shadow-lg transition-all duration-300 border border-gray-100 flex-shrink-0 w-[85vw] max-w-[320px] snap-start">
              <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden">
                <img 
                  src="/mercedes-e-class.webp" 
                  alt="Mercedes-Benz E-Class" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Economy
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-800">Mercedes E-Class</h3>
                  <div className="text-2xl font-bold text-blue-500">250 MAD</div>
                </div>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">Premium executive sedan with elegant interior. Perfect for business travelers and comfortable rides.</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-blue-500" />
                    3 passengers
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Luggage className="w-4 h-4 mr-2 text-blue-500" />
                    3 bags
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Snowflake className="w-4 h-4 mr-2 text-blue-500" />
                    A/C
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Wifi className="w-4 h-4 mr-2 text-blue-500" />
                    Wi-Fi
                  </div>
                </div>
              </div>
            </div>

              {/* Mercedes GLE - Mobile */}
              <div className="group bg-white rounded-3xl overflow-hidden shadow-lg transition-all duration-300 border border-gray-100 flex-shrink-0 w-[85vw] max-w-[320px] snap-start">
                <div className="relative h-48 bg-gradient-to-br from-orange-100 to-red-200 overflow-hidden">
                <img 
                  src="/mercedes-gle.webp" 
                  alt="Mercedes-Benz GLE" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Premium
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-800">Mercedes GLE</h3>
                  <div className="text-2xl font-bold text-orange-500">350 MAD</div>
                </div>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">Mercedes GLE AMG Line - Premium luxury SUV with sporty design. Ideal for families or groups seeking style and performance.</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-orange-500" />
                    6 passengers
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Luggage className="w-4 h-4 mr-2 text-orange-500" />
                    6 bags
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Snowflake className="w-4 h-4 mr-2 text-orange-500" />
                    Premium A/C
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Star className="w-4 h-4 mr-2 text-orange-500" />
                    Luxury
                  </div>
                </div>
              </div>
            </div>

              {/* Mercedes V-Class - Mobile */}
              <div className="group bg-white rounded-3xl overflow-hidden shadow-lg transition-all duration-300 border border-gray-100 flex-shrink-0 w-[85vw] max-w-[320px] snap-start">
              <div className="relative h-48 bg-gradient-to-br from-purple-100 to-indigo-200 overflow-hidden">
                <img 
                  src="/mercedes-v-class.webp" 
                  alt="Mercedes-Benz V-Class" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Luxury
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-800">Mercedes V-Class</h3>
                  <div className="text-2xl font-bold text-purple-500">500 MAD</div>
                </div>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">Luxury van perfect for large groups or VIP transfers. Premium comfort with executive class service.</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-purple-500" />
                    8 passengers
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Luggage className="w-4 h-4 mr-2 text-purple-500" />
                    8+ bags
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Building2 className="w-4 h-4 mr-2 text-purple-500" />
                    Corporate
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Star className="w-4 h-4 mr-2 text-purple-500" />
                    Premium
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Desktop: Grid Layout */}
          <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pt-8 sm:pt-10 lg:pt-12">
            {/* Mercedes E-Class - Desktop */}
            <div className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden">
                <img 
                  src="/mercedes-e-class.webp" 
                  alt="Mercedes-Benz E-Class" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Economy
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-800">Mercedes E-Class</h3>
                  <div className="text-2xl font-bold text-blue-500">250 MAD</div>
                </div>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">Premium executive sedan with elegant interior. Perfect for business travelers and comfortable rides.</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-blue-500" />
                    3 passengers
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Luggage className="w-4 h-4 mr-2 text-blue-500" />
                    3 bags
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Snowflake className="w-4 h-4 mr-2 text-blue-500" />
                    A/C
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Wifi className="w-4 h-4 mr-2 text-blue-500" />
                    Wi-Fi
                  </div>
                </div>
              </div>
            </div>

            {/* Mercedes GLE - Desktop */}
            <div className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="relative h-48 bg-gradient-to-br from-orange-100 to-red-200 overflow-hidden">
                <img 
                  src="/mercedes-gle.webp" 
                  alt="Mercedes-Benz GLE" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Premium
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-800">Mercedes GLE</h3>
                  <div className="text-2xl font-bold text-orange-500">350 MAD</div>
                </div>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">Mercedes GLE AMG Line - Premium luxury SUV with sporty design. Ideal for families or groups seeking style and performance.</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-orange-500" />
                    6 passengers
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Luggage className="w-4 h-4 mr-2 text-orange-500" />
                    6 bags
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Snowflake className="w-4 h-4 mr-2 text-orange-500" />
                    Premium A/C
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Star className="w-4 h-4 mr-2 text-orange-500" />
                    Luxury
                  </div>
                </div>
              </div>
            </div>

            {/* Mercedes V-Class - Desktop */}
            <div className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="relative h-48 bg-gradient-to-br from-purple-100 to-indigo-200 overflow-hidden">
                <img 
                  src="/mercedes-v-class.webp" 
                  alt="Mercedes-Benz V-Class" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Luxury
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-800">Mercedes V-Class</h3>
                  <div className="text-2xl font-bold text-purple-500">500 MAD</div>
                </div>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">Luxury van perfect for large groups or VIP transfers. Premium comfort with executive class service.</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-purple-500" />
                    8 passengers
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Luggage className="w-4 h-4 mr-2 text-purple-500" />
                    8+ bags
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Building2 className="w-4 h-4 mr-2 text-purple-500" />
                    Corporate
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Star className="w-4 h-4 mr-2 text-purple-500" />
                    Premium
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <div className="bg-white rounded-2xl p-6 shadow-lg inline-block">
              <p className="text-gray-700 font-medium mb-4">All vehicles include standard features</p>
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                  GPS Tracking
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                  Climate Control
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                  Professional Driver
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Airport Transfers Section */}
      <section id="services" className="py-12 sm:py-16 lg:py-24 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Airport transfers made easy</h2>
          </div>


           {/* How Does It Work Section - Snake Flow */}
           <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 overflow-hidden">
             <div className="text-center mb-4 sm:mb-6 lg:mb-8">
               <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4">How does it work?</h3>
               <p className="text-sm sm:text-base text-gray-600">Follow the simple steps to book your ride</p>
             </div>

             {/* Snake Flow Container */}
             <div className="relative max-w-6xl mx-auto">
               {/* Step Components */}
               <div className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 lg:pt-6 pb-3 sm:pb-4 lg:pb-6">
                 
                 {/* Connecting Path - only visible on large screens */}
                 <div className="hidden lg:block absolute top-[50px] left-0 right-0 pointer-events-none z-0">
                   <svg className="w-full h-12" viewBox="0 0 100 12" preserveAspectRatio="none">
                     <path
                       d="M 10 6 Q 18 2 25 6 Q 32 10 40 6 Q 48 1 55 6 Q 62 11 70 6 Q 78 2 85 6 Q 92 9 95 6"
                       stroke="url(#stepGradient)"
                       strokeWidth="1"
                       fill="none"
                       strokeDasharray="4,2"
                       opacity="0.4"
                     />
                     <defs>
                       <linearGradient id="stepGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                         <stop offset="0%" stopColor="#60A5FA" />
                         <stop offset="25%" stopColor="#A78BFA" />
                         <stop offset="50%" stopColor="#818CF8" />
                         <stop offset="75%" stopColor="#34D399" />
                         <stop offset="100%" stopColor="#22C55E" />
                       </linearGradient>
                     </defs>
                   </svg>
                 </div>
                 
                 {/* Step 1: Book Online */}
                 <div className="flex flex-col items-center text-center">
                   <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg flex items-center justify-center mb-1 sm:mb-2 lg:mb-4 relative">
                     <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-blue-700 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                     <svg className="w-5 h-5 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M20 3H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h1v2a1 1 0 0 0 1.707.707L9.414 17H20a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM8 11a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                     </svg>
                   </div>
                   <h4 className="text-xs sm:text-base font-bold text-gray-900 mb-1 sm:mb-2">Book online</h4>
                   <p className="text-xs sm:text-sm text-gray-600 leading-tight sm:leading-relaxed">Fill out form & confirm</p>
                 </div>

                 {/* Step 2: Receive Confirmation */}
                 <div className="flex flex-col items-center text-center">
                   <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg flex items-center justify-center mb-1 sm:mb-2 lg:mb-4 relative">
                     <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-purple-700 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                     <svg className="w-5 h-5 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M17 2H7a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3zm-5 15.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0-4a1 1 0 0 1-1-1v-5a1 1 0 0 1 2 0v5a1 1 0 0 1-1 1z"/>
                     </svg>
                   </div>
                   <h4 className="text-xs sm:text-base font-bold text-gray-900 mb-1 sm:mb-2">Get confirmation</h4>
                   <p className="text-xs sm:text-sm text-gray-600 leading-tight sm:leading-relaxed">SMS & email details</p>
                 </div>

                 {/* Step 3: Meet Your Driver */}
                 <div className="flex flex-col items-center text-center">
                   <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg flex items-center justify-center mb-1 sm:mb-2 lg:mb-4 relative">
                     <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-indigo-700 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                     <svg className="w-5 h-5 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                     </svg>
                   </div>
                   <h4 className="text-xs sm:text-base font-bold text-gray-900 mb-1 sm:mb-2">Meet driver</h4>
                   <p className="text-xs sm:text-sm text-gray-600 leading-tight sm:leading-relaxed">Driver waits for you</p>
                 </div>

                 {/* Step 4: Arrive at Destination */}
                 <div className="flex flex-col items-center text-center">
                   <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg flex items-center justify-center mb-1 sm:mb-2 lg:mb-4 relative">
                     <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-teal-700 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                     <svg className="w-5 h-5 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                     </svg>
                   </div>
                   <h4 className="text-xs sm:text-base font-bold text-gray-900 mb-1 sm:mb-2">Arrive safely</h4>
                   <p className="text-xs sm:text-sm text-gray-600 leading-tight sm:leading-relaxed">Quick & comfortable trip</p>
                 </div>

                 {/* Step 5: Enjoy Your Trip */}
                 <div className="flex flex-col items-center text-center">
                   <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg flex items-center justify-center mb-1 sm:mb-2 lg:mb-4 relative">
                     <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-green-700 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</div>
                     <svg className="w-5 h-5 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                     </svg>
                   </div>
                   <h4 className="text-xs sm:text-base font-bold text-green-700 mb-1 sm:mb-2">Enjoy trip!</h4>
                   <p className="text-xs sm:text-sm text-gray-600 leading-tight sm:leading-relaxed">Rate & book again</p>
                 </div>
               </div>

             </div>
           </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-8 sm:py-10 lg:py-12 bg-gray-50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center mb-4 sm:mb-6 lg:mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Why Choose Ride.ma?</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            
            {/* Feature 1 */}
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-1 sm:mb-2">Professional</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-tight">Licensed drivers, background-checked for your safety</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-1 sm:mb-2">On Time</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-tight">Flight tracking with automatic pickup adjustments</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-1 sm:mb-2">Fixed Pricing</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-tight">Transparent prices with no hidden fees</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-1 sm:mb-2">Premium Fleet</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-tight">Modern vehicles with comfort and safety features</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-8 sm:py-10 lg:py-12 bg-white relative z-10 text-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 sm:mb-5 lg:mb-6">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 text-gray-800">Contact Us</h2>
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
              <a href="mailto:booking@ride.ma" className="text-xs sm:text-sm lg:text-base font-bold text-blue-600 hover:text-blue-700 break-all leading-tight">
                booking@ride.ma
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="mt-4 sm:mt-6 lg:mt-8 bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800 text-center">Send us a message</h3>
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
      <footer className="relative z-10 bg-gray-800 text-white border-t border-gray-200 py-8 sm:py-10 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
            <div className="mb-4 sm:mb-0">
              <div className="text-xl sm:text-2xl font-bold text-white">ride.ma</div>
              <p className="text-sm text-gray-300">Premium Airport Transfer Service</p>
            </div>
            <div className="text-sm text-center sm:text-right text-gray-300">
              <p>&copy; 2025 Ride.ma. All rights reserved.</p>
              <p>Licensed & Insured Transportation Service</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
