
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Flight } from '@/services/flightApi';

interface AircraftMarkerProps {
  map: mapboxgl.Map;
  flights: Flight[];
  onFlightSelect: (flight: Flight) => void;
}

const AircraftMarker: React.FC<AircraftMarkerProps> = ({ map, flights, onFlightSelect }) => {
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});

  useEffect(() => {
    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};
    
    // Create new markers for all flights
    flights.forEach(flight => {
      // Create a custom HTML element for the marker
      const el = document.createElement('div');
      el.className = 'aircraft-marker';
      el.style.width = '32px';
      el.style.height = '32px';
      
      // Use the uploaded plane icon image
      el.style.backgroundImage = 'url("/lovable-uploads/d61f4489-f69c-490b-a66b-6ed9139df944.png")';
      el.style.backgroundSize = 'contain';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.backgroundPosition = 'center';
      el.style.transform = `rotate(${flight.heading}deg)`;
      el.style.transformOrigin = 'center';
      el.style.cursor = 'pointer';
      el.classList.add('animate-pulse-subtle');
      
      // Create and add the marker to the map
      const marker = new mapboxgl.Marker({
        element: el,
        rotation: flight.heading,
        anchor: 'center'
      })
        .setLngLat([flight.longitude, flight.latitude])
        .addTo(map);
      
      // Store reference to marker
      markersRef.current[flight.flightId] = marker;
      
      // Add click handler
      marker.getElement().addEventListener('click', () => {
        onFlightSelect(flight);
      });
    });
    
    return () => {
      // Clean up markers on unmount
      Object.values(markersRef.current).forEach(marker => marker.remove());
    };
  }, [flights, map, onFlightSelect]);

  return null; // This component doesn't render anything itself
};

export default AircraftMarker;
