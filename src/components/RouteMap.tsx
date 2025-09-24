'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface RouteMapProps {
  pickup: string;
  destination: string;
  className?: string;
  onRouteCalculated?: (routeInfo: {
    distance: string;
    duration: string;
    distanceValue: number;
  }) => void;
}

export default function RouteMap({ pickup, destination, className = '', onRouteCalculated }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'demo',
        version: 'weekly',
        libraries: ['places', 'geometry']
      });

      try {
        await loader.load();
        
        if (mapRef.current) {
          // Center on Morocco (Casablanca area)
          const moroccoCenter = { lat: 33.5731, lng: -7.5898 };
          
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: moroccoCenter,
            zoom: 7,
            styles: [
              {
                "featureType": "all",
                "elementType": "geometry.fill",
                "stylers": [{"weight": "2.00"}]
              },
              {
                "featureType": "all",
                "elementType": "geometry.stroke",
                "stylers": [{"color": "#9c9c9c"}]
              },
              {
                "featureType": "all",
                "elementType": "labels.text",
                "stylers": [{"visibility": "on"}]
              },
              {
                "featureType": "landscape",
                "elementType": "all",
                "stylers": [{"color": "#f2f2f2"}]
              },
              {
                "featureType": "landscape",
                "elementType": "geometry.fill",
                "stylers": [{"color": "#ffffff"}]
              },
              {
                "featureType": "landscape.man_made",
                "elementType": "geometry.fill",
                "stylers": [{"color": "#ffffff"}]
              },
              {
                "featureType": "poi",
                "elementType": "all",
                "stylers": [{"visibility": "off"}]
              },
              {
                "featureType": "road",
                "elementType": "all",
                "stylers": [{"saturation": -100}, {"lightness": 45}]
              },
              {
                "featureType": "road",
                "elementType": "geometry.fill",
                "stylers": [{"color": "#eeeeee"}]
              },
              {
                "featureType": "road",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#7b7b7b"}]
              },
              {
                "featureType": "road",
                "elementType": "labels.text.stroke",
                "stylers": [{"color": "#ffffff"}]
              },
              {
                "featureType": "road.highway",
                "elementType": "all",
                "stylers": [{"visibility": "simplified"}]
              },
              {
                "featureType": "road.arterial",
                "elementType": "labels.icon",
                "stylers": [{"visibility": "off"}]
              },
              {
                "featureType": "transit",
                "elementType": "all",
                "stylers": [{"visibility": "off"}]
              },
              {
                "featureType": "water",
                "elementType": "all",
                "stylers": [{"color": "#46bcec"}, {"visibility": "on"}]
              },
              {
                "featureType": "water",
                "elementType": "geometry.fill",
                "stylers": [{"color": "#c8d7d4"}]
              },
              {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#070707"}]
              },
              {
                "featureType": "water",
                "elementType": "labels.text.stroke",
                "stylers": [{"color": "#ffffff"}]
              }
            ],
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: false
          });

          const dirService = new google.maps.DirectionsService();
          const dirRenderer = new google.maps.DirectionsRenderer({
            suppressMarkers: false,
            polylineOptions: {
              strokeColor: '#FF5A5F',
              strokeWeight: 4,
              strokeOpacity: 0.8
            }
          });

          dirRenderer.setMap(mapInstance);

          setMap(mapInstance);
          setDirectionsService(dirService);
          setDirectionsRenderer(dirRenderer);
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initMap();
  }, []);

  useEffect(() => {
    if (map && directionsService && directionsRenderer && pickup && destination) {
      // Only calculate route if both addresses are reasonably complete (avoid API errors for partial input)
      if (pickup.length < 10 || destination.length < 10) {
        // Clear any existing route for partial addresses
        directionsRenderer.setDirections({ routes: [] });
        return;
      }
      
      // Calculate and display route
      directionsService.route(
        {
          origin: pickup,
          destination: destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK' && result) {
            directionsRenderer.setDirections(result);
            
            // Extract route information for pricing
            const route = result.routes[0];
            if (route && route.legs[0] && onRouteCalculated) {
              const leg = route.legs[0];
              onRouteCalculated({
                distance: leg.distance?.text || '',
                duration: leg.duration?.text || '',
                distanceValue: leg.distance?.value || 0
              });
            }
            
            // Fit map to route bounds
            const bounds = new google.maps.LatLngBounds();
            route.legs.forEach(leg => {
              bounds.extend(leg.start_location);
              bounds.extend(leg.end_location);
            });
            map.fitBounds(bounds, { padding: 50 });
          } else {
            console.warn(`Directions request failed: ${status}. This is normal for incomplete addresses.`);
            // Clear any existing route on error
            directionsRenderer.setDirections({ routes: [] });
          }
        }
      );
    }
  }, [pickup, destination, map, directionsService, directionsRenderer]);

  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-xl ${className}`}>
      <div ref={mapRef} className="w-full h-full min-h-[400px]" />
      {(!pickup || !destination) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur-sm">
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Route Preview</h3>
            <p className="text-white/80 text-sm">Select pickup and destination to see your route</p>
          </div>
        </div>
      )}
    </div>
  );
}
