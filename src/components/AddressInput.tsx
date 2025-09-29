'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Input } from "@/components/ui/input";
import { Plane, Target, MapPin, Building } from 'lucide-react';
import { cn } from "@/lib/utils";

interface AddressInputProps {
  value: string;
  onChange: (address: string) => void;
  placeholder: string;
  icon: 'pickup' | 'destination';
  className?: string;
}

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
}

export default function AddressInput({ value, onChange, placeholder, icon, className = '' }: AddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    const initGooglePlaces = () => {
      if (typeof window !== 'undefined' && 
          window.google && 
          window.google.maps && 
          window.google.maps.places) {
        
        try {
          // Initialize Google Places services for programmatic use
          const autoService = new google.maps.places.AutocompleteService();
          const map = new google.maps.Map(document.createElement('div'));
          const placesServiceInstance = new google.maps.places.PlacesService(map);
          
          setAutocompleteService(autoService);
          setPlacesService(placesServiceInstance);
          
          console.log('✅ Google Places API initialized successfully');
          
        } catch (error) {
          console.error('❌ Failed to initialize Google Places:', error);
        }
      }
    };

    // Wait for Google Maps to load
    const checkGoogleMaps = () => {
      if (typeof window !== 'undefined' && 
          window.google && 
          window.google.maps && 
          window.google.maps.places) {
        initGooglePlaces();
      } else {
        // Retry every 100ms for up to 10 seconds
        const currentRetryCount = retryCountRef.current || 0;
        if (currentRetryCount < 100) {
          retryCountRef.current = currentRetryCount + 1;
          setTimeout(checkGoogleMaps, 100);
        } else {
          console.error('❌ Google Maps API failed to load after 10 seconds');
        }
      }
    };

    // Only initialize if API key exists
    if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      checkGoogleMaps();
    } else {
      console.error('❌ No Google Maps API key found');
    }

    // Cleanup timeout on unmount
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const calculateDropdownPosition = useCallback(() => {
    if (!inputRef.current) return null;
    
    const rect = inputRef.current.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    
    return {
      top: rect.bottom + scrollY + 4, // 4px gap
      left: rect.left + scrollX,
      width: rect.width
    };
  }, []);

  // Update dropdown position on scroll/resize
  useEffect(() => {
    if (!showSuggestions) return;

    const updatePosition = () => {
      const position = calculateDropdownPosition();
      if (position) {
        setDropdownPosition(position);
      }
    };

    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [showSuggestions, calculateDropdownPosition]);

  const fetchSuggestions = useCallback(async (input: string) => {
    if (!autocompleteService || !input.trim() || input.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setDropdownPosition(null);
      return;
    }

    setIsLoading(true);
    
    try {
      const request: google.maps.places.AutocompletionRequest = {
        input: input.trim(),
        componentRestrictions: { country: 'ma' }, // Morocco only
        types: ['establishment', 'geocode'],
      };

      autocompleteService.getPlacePredictions(request, (predictions, status) => {
        setIsLoading(false);
        
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions);
          setShowSuggestions(true);
          setHighlightedIndex(-1);
          
          // Update dropdown position when showing suggestions
          const position = calculateDropdownPosition();
          if (position) {
            setDropdownPosition(position);
          }
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
          setDropdownPosition(null);
        }
      });
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setIsLoading(false);
      setSuggestions([]);
      setShowSuggestions(false);
      setDropdownPosition(null);
    }
  }, [autocompleteService, calculateDropdownPosition]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Debounce the API call
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(inputValue);
    }, 300);
  };

  const handleSuggestionSelect = useCallback((prediction: PlacePrediction) => {
    if (!placesService) return;

    // Get detailed place information
    const request: google.maps.places.PlaceDetailsRequest = {
      placeId: prediction.place_id,
      fields: ['formatted_address', 'name', 'geometry']
    };

    placesService.getDetails(request, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        onChange(place.formatted_address || prediction.description);
      } else {
        onChange(prediction.description);
      }
    });

    setShowSuggestions(false);
    setSuggestions([]);
    setDropdownPosition(null);
  }, [placesService, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSuggestionSelect(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSuggestions([]);
        setHighlightedIndex(-1);
        setDropdownPosition(null);
        break;
    }
  };

  const getPlaceIcon = (types: string[]) => {
    if (types.includes('airport')) return <Plane className="w-4 h-4 text-blue-500" />;
    if (types.includes('lodging') || types.includes('establishment')) return <Building className="w-4 h-4 text-green-500" />;
    return <MapPin className="w-4 h-4 text-gray-500" />;
  };

  const IconComponent = icon === 'pickup' ? Target : icon === 'destination' ? Target : Plane;

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-20 pointer-events-none">
        <IconComponent className="w-4 h-4 text-gray-500" />
      </div>
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn("pl-10", className)}
        onFocus={() => {
          const position = calculateDropdownPosition();
          if (position) {
            setDropdownPosition(position);
          }
          if (value.trim().length >= 2) {
            fetchSuggestions(value);
          }
        }}
        onBlur={() => {
          // Delay hiding to allow clicks on suggestions
          setTimeout(() => {
            setShowSuggestions(false);
            setSuggestions([]);
            setDropdownPosition(null);
          }, 150);
        }}
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-20">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Portaled dropdown - renders outside stacking context! */}
      {showSuggestions && suggestions.length > 0 && dropdownPosition && typeof window !== 'undefined' &&
        createPortal(
          <div 
            className="fixed z-[99999] pointer-events-auto"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              zIndex: 100000 // Ensure it's above all modals
            }}
          >
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              <div className="max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.place_id}
                    className={cn(
                      "px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center gap-3 transition-colors",
                      index === highlightedIndex && "bg-gray-100"
                    )}
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent input blur
                      handleSuggestionSelect(suggestion);
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    {getPlaceIcon(suggestion.types)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {suggestion.structured_formatting.main_text}
                      </div>
                      {suggestion.structured_formatting.secondary_text && (
                        <div className="text-xs text-gray-500 truncate">
                          {suggestion.structured_formatting.secondary_text}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                Powered by Google Places
              </div>
            </div>
          </div>,
          document.body
        )
      }
    </div>
  );
}