
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Flight } from '@/services/flight/types';

interface AircraftMarkerProps {
  map: mapboxgl.Map;
  flights: Flight[];
  onFlightSelect: (flight: Flight) => void;
}

const AircraftMarker: React.FC<AircraftMarkerProps> = ({ map, flights, onFlightSelect }) => {
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});

  useEffect(() => {
    // Make sure map is fully loaded before adding markers
    if (!map || !map.loaded()) {
      console.log("Map not fully loaded yet, waiting...");
      
      const onMapLoad = () => {
        updateMarkers();
        // Remove the load event listener after it's fired
        map.off('load', onMapLoad);
      };
      
      // Add a load event listener if the map isn't loaded yet
      map.on('load', onMapLoad);
      return;
    }
    
    // If map is already loaded, update markers immediately
    updateMarkers();
    
    function updateMarkers() {
      // Clear existing markers
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};
      
      // Create new markers for all flights
      flights.forEach(flight => {
        try {
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
          
          // Create the marker with fixed settings to prevent movement
          const marker = new mapboxgl.Marker({
            element: el,
            rotation: flight.heading,
            anchor: 'center',
            rotationAlignment: 'viewport',
            pitchAlignment: 'viewport',
          });
          
          // Add marker to map with safety check
          marker.setLngLat([flight.longitude, flight.latitude]);
          
          // Only add to map if the map is valid
          if (map && map.getCanvas()) {
            marker.addTo(map);
            
            // Store reference to marker
            markersRef.current[flight.flightId] = marker;
            
            // Add click handler
            marker.getElement().addEventListener('click', () => {
              onFlightSelect(flight);
            });
          }
        } catch (err) {
          console.error(`Error creating marker for flight ${flight.flightId}:`, err);
        }
      });
    }
    
    return () => {
      // Clean up markers on unmount
      Object.values(markersRef.current).forEach(marker => marker.remove());
    };
  }, [flights, map, onFlightSelect]);

  return null; // This component doesn't render anything itself
};

export default AircraftMarker;
