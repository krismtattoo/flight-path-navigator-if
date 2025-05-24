
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Flight } from '@/services/flight';

interface AircraftMarkerProps {
  map: mapboxgl.Map;
  flights: Flight[];
  onFlightSelect: (flight: Flight) => void;
}

const AircraftMarker: React.FC<AircraftMarkerProps> = ({ map, flights, onFlightSelect }) => {
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const selectedMarkerIdRef = useRef<string | null>(null);

  // Function to determine if aircraft is on ground
  const isOnGround = (flight: Flight): boolean => {
    // Aircraft is considered on ground if altitude is very low and speed is low
    return flight.altitude < 100 && flight.speed < 50;
  };

  // Function to get aircraft color filter based on status
  const getAircraftFilter = (flight: Flight, isSelected: boolean = false): string => {
    const onGround = isOnGround(flight);
    
    if (isSelected) {
      return onGround 
        ? 'brightness(0) saturate(0) invert(0.8) contrast(2) drop-shadow(0 0 8px rgba(255,255,255,0.8))' // Highlighted gray for selected ground aircraft
        : 'brightness(0) saturate(0) invert(0.7) sepia(1) hue-rotate(180deg) saturate(3) drop-shadow(0 0 8px rgba(91,173,236,0.8))'; // Highlighted light blue for selected airborne aircraft
    }
    
    return onGround 
      ? 'brightness(0) saturate(0) invert(0.4) contrast(1.5) drop-shadow(0 2px 4px rgba(0,0,0,0.3))' // Gray for ground aircraft with shadow
      : 'brightness(0) saturate(0) invert(0.6) sepia(1) hue-rotate(180deg) saturate(2) drop-shadow(0 2px 4px rgba(0,0,0,0.3))'; // Light blue for airborne aircraft with shadow
  };

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
      // Update existing markers or create new ones
      const currentFlightIds = new Set(flights.map(f => f.flightId));
      
      // Remove markers for flights that no longer exist
      Object.keys(markersRef.current).forEach(flightId => {
        if (!currentFlightIds.has(flightId)) {
          markersRef.current[flightId].remove();
          delete markersRef.current[flightId];
          if (selectedMarkerIdRef.current === flightId) {
            selectedMarkerIdRef.current = null;
          }
        }
      });
      
      // Update or create markers for current flights
      flights.forEach(flight => {
        const existingMarker = markersRef.current[flight.flightId];
        
        if (existingMarker) {
          // Update existing marker position and rotation
          existingMarker.setLngLat([flight.longitude, flight.latitude]);
          const el = existingMarker.getElement();
          const isSelected = selectedMarkerIdRef.current === flight.flightId;
          el.style.filter = getAircraftFilter(flight, isSelected);
          el.style.transform = isSelected 
            ? `rotate(${flight.heading}deg) scale(1.2)` 
            : `rotate(${flight.heading}deg)`;
        } else {
          // Create new marker
          try {
            // Create a custom HTML element for the marker
            const el = document.createElement('div');
            el.className = 'aircraft-marker';
            el.style.width = '28px';
            el.style.height = '28px';
            
            // Aircraft icon
            el.style.backgroundImage = 'url("/lovable-uploads/d61f4489-f69c-490b-a66b-6ed9139df944.png")';
            el.style.backgroundSize = 'contain';
            el.style.backgroundRepeat = 'no-repeat';
            el.style.backgroundPosition = 'center';
            el.style.filter = getAircraftFilter(flight);
            el.style.transform = `rotate(${flight.heading}deg)`;
            el.style.transformOrigin = 'center';
            el.style.cursor = 'pointer';
            el.style.transition = 'all 0.3s ease';
            
            // Create the marker with fixed settings to prevent movement during map interactions
            const marker = new mapboxgl.Marker({
              element: el,
              anchor: 'center',
              draggable: false,
              rotationAlignment: 'map',
              pitchAlignment: 'map',
            });
            
            // Set position and add to map
            marker.setLngLat([flight.longitude, flight.latitude]);
            
            // Only add to map if the map is valid
            if (map && map.getCanvas()) {
              marker.addTo(map);
              
              // Store reference to marker
              markersRef.current[flight.flightId] = marker;
              
              // Add click handler
              marker.getElement().addEventListener('click', () => {
                // Remove highlight from previously selected marker
                if (selectedMarkerIdRef.current && markersRef.current[selectedMarkerIdRef.current]) {
                  const prevMarker = markersRef.current[selectedMarkerIdRef.current];
                  const prevEl = prevMarker.getElement();
                  const prevFlight = flights.find(f => f.flightId === selectedMarkerIdRef.current);
                  if (prevFlight) {
                    prevEl.style.zIndex = '0';
                    prevEl.style.filter = getAircraftFilter(prevFlight);
                    prevEl.style.transform = `rotate(${prevFlight.heading}deg) scale(1)`;
                    prevEl.classList.remove('animate-pulse-subtle');
                  }
                }
                
                // Highlight the selected marker
                el.style.zIndex = '1000';
                el.style.filter = getAircraftFilter(flight, true);
                el.style.transform = `rotate(${flight.heading}deg) scale(1.2)`;
                el.classList.add('animate-pulse-subtle');
                
                // Track the selected marker
                selectedMarkerIdRef.current = flight.flightId;
                
                // Call the selection handler
                onFlightSelect(flight);
              });
            }
          } catch (err) {
            console.error(`Error creating marker for flight ${flight.flightId}:`, err);
          }
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
