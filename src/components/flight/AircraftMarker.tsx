
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
    return flight.altitude < 100 && flight.speed < 50;
  };

  // Function to get aircraft color filter based on status
  const getAircraftFilter = (flight: Flight, isSelected: boolean = false): string => {
    const onGround = isOnGround(flight);
    
    if (isSelected) {
      return onGround 
        ? 'brightness(0) saturate(0) invert(0.8) contrast(2) drop-shadow(0 0 8px rgba(255,255,255,0.8))'
        : 'brightness(0) saturate(0) invert(0.7) sepia(1) hue-rotate(180deg) saturate(3) drop-shadow(0 0 8px rgba(91,173,236,0.8))';
    }
    
    return onGround 
      ? 'brightness(0) saturate(0) invert(0.4) contrast(1.5) drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
      : 'brightness(0) saturate(0) invert(0.6) sepia(1) hue-rotate(180deg) saturate(2) drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
  };

  useEffect(() => {
    console.log(`🛩️ AircraftMarker effect - ${flights.length} flights, map loaded: ${map?.loaded()}`);
    console.log(`📍 Current markers: ${Object.keys(markersRef.current).length}`);
    
    if (!map || !map.loaded()) {
      console.log("🔄 Map not loaded, waiting...");
      const onMapLoad = () => {
        console.log("✅ Map loaded, updating markers");
        updateMarkers();
        map.off('load', onMapLoad);
      };
      map.on('load', onMapLoad);
      return;
    }
    
    updateMarkers();
    
    function updateMarkers() {
      console.log(`🔄 Updating ${flights.length} flight markers`);
      
      const currentFlightIds = new Set(flights.map(f => f.flightId));
      const existingMarkerIds = Object.keys(markersRef.current);
      
      // Only remove markers for flights that no longer exist
      existingMarkerIds.forEach(flightId => {
        if (!currentFlightIds.has(flightId)) {
          console.log(`🗑️ Removing marker for departed flight ${flightId}`);
          markersRef.current[flightId].remove();
          delete markersRef.current[flightId];
          if (selectedMarkerIdRef.current === flightId) {
            selectedMarkerIdRef.current = null;
          }
        }
      });
      
      let updatedCount = 0;
      let createdCount = 0;
      
      // Update existing markers or create new ones
      flights.forEach(flight => {
        const existingMarker = markersRef.current[flight.flightId];
        const isSelected = selectedMarkerIdRef.current === flight.flightId;
        
        if (existingMarker) {
          // Update existing marker
          existingMarker.setLngLat([flight.longitude, flight.latitude]);
          const el = existingMarker.getElement();
          el.style.filter = getAircraftFilter(flight, isSelected);
          el.style.transform = `rotate(${flight.heading}deg)${isSelected ? ' scale(1.2)' : ''}`;
          updatedCount++;
        } else {
          // Create new marker
          console.log(`➕ Creating marker for flight ${flight.flightId}`);
          
          const el = document.createElement('div');
          el.className = 'aircraft-marker';
          el.style.width = '28px';
          el.style.height = '28px';
          el.style.backgroundImage = 'url("/lovable-uploads/d61f4489-f69c-490b-a66b-6ed9139df944.png")';
          el.style.backgroundSize = 'contain';
          el.style.backgroundRepeat = 'no-repeat';
          el.style.backgroundPosition = 'center';
          el.style.filter = getAircraftFilter(flight, isSelected);
          el.style.transform = `rotate(${flight.heading}deg)${isSelected ? ' scale(1.2)' : ''}`;
          el.style.transformOrigin = 'center';
          el.style.cursor = 'pointer';
          el.style.pointerEvents = 'auto';
          
          const marker = new mapboxgl.Marker({
            element: el,
            anchor: 'center',
            draggable: false,
            rotationAlignment: 'viewport',
            pitchAlignment: 'viewport',
          });
          
          marker.setLngLat([flight.longitude, flight.latitude]);
          
          if (map && map.getCanvas()) {
            marker.addTo(map);
            markersRef.current[flight.flightId] = marker;
            createdCount++;
            
            // Add click handler
            el.addEventListener('click', (e) => {
              e.stopPropagation();
              console.log(`🎯 Flight clicked: ${flight.flightId}`);
              
              // Remove highlight from previously selected marker
              if (selectedMarkerIdRef.current && markersRef.current[selectedMarkerIdRef.current]) {
                const prevMarker = markersRef.current[selectedMarkerIdRef.current];
                const prevEl = prevMarker.getElement();
                const prevFlight = flights.find(f => f.flightId === selectedMarkerIdRef.current);
                if (prevFlight) {
                  console.log(`🔄 Removing highlight from ${selectedMarkerIdRef.current}`);
                  prevEl.style.zIndex = '0';
                  prevEl.style.filter = getAircraftFilter(prevFlight);
                  prevEl.style.transform = `rotate(${prevFlight.heading}deg)`;
                  prevEl.classList.remove('aircraft-marker-selected');
                }
              }
              
              // Highlight selected marker
              el.style.zIndex = '1000';
              el.style.filter = getAircraftFilter(flight, true);
              el.style.transform = `rotate(${flight.heading}deg) scale(1.2)`;
              el.classList.add('aircraft-marker-selected');
              
              selectedMarkerIdRef.current = flight.flightId;
              console.log(`✅ Selected: ${flight.flightId}`);
              
              onFlightSelect(flight);
            });
          }
        }
      });
      
      console.log(`✅ Markers updated - Updated: ${updatedCount}, Created: ${createdCount}, Total: ${Object.keys(markersRef.current).length}`);
    }
  }, [flights, map, onFlightSelect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log(`🧹 Cleaning up ${Object.keys(markersRef.current).length} markers`);
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};
    };
  }, []);

  console.log(`🔄 AircraftMarker render - ${flights.length} flights, selected: ${selectedMarkerIdRef.current}`);

  return null;
};

export default AircraftMarker;
