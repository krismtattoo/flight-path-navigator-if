
import React, { useEffect, useRef, useMemo, useCallback } from 'react';
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
  const markerElementsRef = useRef<{ [key: string]: HTMLDivElement }>({});

  // Memoize flight lookup for better performance
  const flightLookup = useMemo(() => {
    const lookup: { [key: string]: Flight } = {};
    flights.forEach(flight => {
      lookup[flight.flightId] = flight;
    });
    return lookup;
  }, [flights]);

  // Memoize current flight IDs set
  const currentFlightIds = useMemo(() => {
    return new Set(flights.map(f => f.flightId));
  }, [flights]);

  // Function to determine if aircraft is on ground
  const isOnGround = useCallback((flight: Flight): boolean => {
    return flight.altitude < 100 && flight.speed < 50;
  }, []);

  // Updated filter styles - pink for airborne, light gray for ground
  const filterStyles = useMemo(() => ({
    onGroundNormal: 'brightness(0) saturate(0) invert(0.8) drop-shadow(0 2px 4px rgba(0,0,0,0.3))', // Light gray
    airborneNormal: 'brightness(0) saturate(0) invert(0.6) sepia(1) hue-rotate(320deg) saturate(3) brightness(0.9) drop-shadow(0 2px 4px rgba(0,0,0,0.3))', // Pink
    onGroundSelected: 'brightness(0) saturate(0) invert(0.8) drop-shadow(0 0 8px rgba(255,255,255,0.8))', // Light gray with glow
    airborneSelected: 'brightness(0) saturate(0) invert(0.6) sepia(1) hue-rotate(320deg) saturate(3) brightness(0.9) drop-shadow(0 0 8px rgba(255,255,255,0.8))' // Pink with glow
  }), []);

  // SVG Template für Flugzeug-Icon - zeigt standardmäßig nach Norden (0°)
  const createSvgElement = useCallback((flight: Flight): SVGSVGElement => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    
    // SVG Grundkonfiguration - optimiert für 28x28px
    svg.setAttribute('width', '28');
    svg.setAttribute('height', '28');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('version', '1.1');
    
    // Erstelle die Flugzeug-Path mit einem sauberen SVG-Pfad
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z');
    
    svg.appendChild(path);
    
    return svg;
  }, []);

  // Create marker element with proper styling - fixed positioning
  const createMarkerElement = useCallback((flight: Flight): HTMLDivElement => {
    const el = document.createElement('div');
    el.className = 'aircraft-marker';
    el.style.cssText = `
      width: 28px;
      height: 28px;
      cursor: pointer;
      transform-origin: center;
      transition: none;
      position: relative;
      pointer-events: auto;
    `;
    
    // Create SVG and append to marker element
    const svg = createSvgElement(flight);
    el.appendChild(svg);
    
    // Simplified event listeners - no hover effects that could interfere with positioning
    el.addEventListener('mouseenter', () => {
      if (!selectedMarkerIdRef.current || selectedMarkerIdRef.current !== flight.flightId) {
        el.style.transform = `rotate(${flight.heading}deg) scale(1.2)`;
      }
    });
    
    el.addEventListener('mouseleave', () => {
      if (!selectedMarkerIdRef.current || selectedMarkerIdRef.current !== flight.flightId) {
        el.style.transform = `rotate(${flight.heading}deg) scale(1)`;
      }
    });
    
    return el;
  }, [createSvgElement]);

  // Update marker styling based on flight state and selection
  const updateMarkerStyle = useCallback((element: HTMLDivElement, flight: Flight, isSelected: boolean) => {
    const svg = element.querySelector('svg');
    if (!svg) return;
    
    const onGround = isOnGround(flight);
    let filter: string;
    
    if (isSelected) {
      filter = onGround ? filterStyles.onGroundSelected : filterStyles.airborneSelected;
    } else {
      filter = onGround ? filterStyles.onGroundNormal : filterStyles.airborneNormal;
    }
    
    svg.style.filter = filter;
    // Fixed transform that doesn't interfere with map positioning
    element.style.transform = `rotate(${flight.heading}deg) scale(${isSelected ? 1.3 : 1})`;
  }, [isOnGround, filterStyles]);

  // Update markers when flights change
  useEffect(() => {
    console.log(`🎯 AircraftMarker - Processing ${flights.length} flights`);
    
    // Remove markers for flights that no longer exist
    Object.keys(markersRef.current).forEach(flightId => {
      if (!currentFlightIds.has(flightId)) {
        console.log(`🗑️ Removing marker for flight ${flightId}`);
        markersRef.current[flightId].remove();
        delete markersRef.current[flightId];
        delete markerElementsRef.current[flightId];
      }
    });

    // Update existing markers and create new ones
    flights.forEach(flight => {
      const existingMarker = markersRef.current[flight.flightId];
      
      if (existingMarker) {
        // Update position - this properly fixes the marker to map coordinates
        existingMarker.setLngLat([flight.longitude, flight.latitude]);
        
        // Update styling
        const element = markerElementsRef.current[flight.flightId];
        if (element) {
          const isSelected = selectedMarkerIdRef.current === flight.flightId;
          updateMarkerStyle(element, flight, isSelected);
        }
      } else {
        // Create new marker
        const element = createMarkerElement(flight);
        markerElementsRef.current[flight.flightId] = element;
        
        // Apply initial styling
        updateMarkerStyle(element, flight, false);
        
        // Add click handler
        element.addEventListener('click', (e) => {
          e.stopPropagation();
          console.log(`✈️ Aircraft clicked: ${flight.flightId}`);
          
          // Update selection state
          const previousSelected = selectedMarkerIdRef.current;
          selectedMarkerIdRef.current = flight.flightId;
          
          // Update previous marker styling
          if (previousSelected && markerElementsRef.current[previousSelected] && flightLookup[previousSelected]) {
            updateMarkerStyle(markerElementsRef.current[previousSelected], flightLookup[previousSelected], false);
          }
          
          // Update current marker styling
          updateMarkerStyle(element, flight, true);
          
          onFlightSelect(flight);
        });
        
        // Create and add marker to map with proper options for fixed positioning
        const marker = new mapboxgl.Marker({ 
          element,
          anchor: 'center', // Center the marker on the coordinates
          pitchAlignment: 'map', // Keep marker aligned with map
          rotationAlignment: 'map' // Keep marker rotation aligned with map
        })
          .setLngLat([flight.longitude, flight.latitude])
          .addTo(map);
        
        markersRef.current[flight.flightId] = marker;
      }
    });
  }, [flights, currentFlightIds, flightLookup, map, onFlightSelect, createMarkerElement, updateMarkerStyle]);

  // Cleanup markers when component unmounts
  useEffect(() => {
    return () => {
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};
      markerElementsRef.current = {};
    };
  }, []);

  return null;
};

export default AircraftMarker;
