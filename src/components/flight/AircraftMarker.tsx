
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

  // Updated filter styles for purple airborne and light gray ground aircraft
  const filterStyles = useMemo(() => ({
    onGroundNormal: 'brightness(0) saturate(0) invert(0.8) drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
    airborneNormal: 'brightness(0) saturate(0) invert(0.4) sepia(1) hue-rotate(240deg) saturate(2) drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
    onGroundSelected: 'brightness(0) saturate(0) invert(0.8) drop-shadow(0 0 8px rgba(255,255,255,0.8))',
    airborneSelected: 'brightness(0) saturate(0) invert(0.4) sepia(1) hue-rotate(240deg) saturate(2) drop-shadow(0 0 8px rgba(255,255,255,0.8))'
  }), []);

  // SVG Template für Flugzeug-Icon - zeigt standardmäßig nach Norden (0°)
  const createSvgElement = useCallback((flight: Flight): SVGSVGElement => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    
    // SVG Grundkonfiguration - optimiert für 28x28px
    svg.setAttribute('width', '28');
    svg.setAttribute('height', '28');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('version', '1.1');
    
    // Erstelle die Flugzeug-Path mit einem sauberen, vollständigen SVG-Pfad
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M12 2L13.09 8.26L22 9L15 12L16 21L12 18L8 21L9 12L2 9L10.91 8.26L12 2Z');
    path.setAttribute('fill', 'currentColor');
    
    // Füge den Pfad zum SVG hinzu
    svg.appendChild(path);
    
    // Bestimme Farbe basierend auf Flugstatus (Boden oder Luft)
    const onGround = isOnGround(flight);
    const isSelected = selectedMarkerIdRef.current === flight.flightId;
    
    // Setze die entsprechende Farbe und den Filter
    if (onGround) {
      svg.style.filter = isSelected ? filterStyles.onGroundSelected : filterStyles.onGroundNormal;
    } else {
      svg.style.filter = isSelected ? filterStyles.airborneSelected : filterStyles.airborneNormal;
    }
    
    // Rotiere das SVG basierend auf dem Heading
    // Das Icon zeigt standardmäßig nach oben (Norden), daher verwenden wir das Heading direkt
    svg.style.transform = `rotate(${flight.heading}deg)`;
    svg.style.transformOrigin = 'center';
    
    console.log(`✈️ Aircraft ${flight.flightId}: heading=${flight.heading}°, onGround=${onGround}, altitude=${flight.altitude}ft, speed=${flight.speed}kts`);
    
    return svg;
  }, [isOnGround, filterStyles]);

  // Optimized marker creation function
  const createMarker = useCallback((flight: Flight): mapboxgl.Marker => {
    const markerElement = document.createElement('div');
    markerElement.className = 'aircraft-marker';
    markerElement.style.cursor = 'pointer';
    
    // Create SVG element
    const svgElement = createSvgElement(flight);
    markerElement.appendChild(svgElement);
    
    // Store marker element reference
    markerElementsRef.current[flight.flightId] = markerElement;
    
    // Create marker with optimized settings
    const marker = new mapboxgl.Marker({
      element: markerElement,
      anchor: 'center'
    })
    .setLngLat([flight.longitude, flight.latitude]);
    
    // Add click handler
    markerElement.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log(`🎯 Aircraft clicked: ${flight.flightId} (${flight.callsign})`);
      onFlightSelect(flight);
      
      // Update selected marker reference
      selectedMarkerIdRef.current = flight.flightId;
      
      // Update all marker styles to reflect selection
      updateAllMarkerStyles();
    });
    
    return marker;
  }, [createSvgElement, onFlightSelect]);

  // Function to update all marker styles (for selection state)
  const updateAllMarkerStyles = useCallback(() => {
    Object.keys(markerElementsRef.current).forEach(flightId => {
      const markerElement = markerElementsRef.current[flightId];
      const flight = flightLookup[flightId];
      
      if (markerElement && flight) {
        const svgElement = markerElement.querySelector('svg');
        if (svgElement) {
          const onGround = isOnGround(flight);
          const isSelected = selectedMarkerIdRef.current === flightId;
          
          // Update filter based on selection state
          if (onGround) {
            svgElement.style.filter = isSelected ? filterStyles.onGroundSelected : filterStyles.onGroundNormal;
          } else {
            svgElement.style.filter = isSelected ? filterStyles.airborneSelected : filterStyles.airborneNormal;
          }
          
          // Update z-index for selected marker
          if (isSelected) {
            markerElement.classList.add('aircraft-marker-selected');
          } else {
            markerElement.classList.remove('aircraft-marker-selected');
          }
        }
      }
    });
  }, [flightLookup, isOnGround, filterStyles]);

  // Main effect to manage markers
  useEffect(() => {
    if (!map) return;

    console.log(`🔄 Updating ${flights.length} aircraft markers`);
    
    // Remove markers for flights that no longer exist
    Object.keys(markersRef.current).forEach(flightId => {
      if (!currentFlightIds.has(flightId)) {
        console.log(`🗑️ Removing marker for flight ${flightId}`);
        markersRef.current[flightId].remove();
        delete markersRef.current[flightId];
        delete markerElementsRef.current[flightId];
        
        // Clear selection if this flight was selected
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
        
        // Update the SVG element for this marker
        const markerElement = markerElementsRef.current[flight.flightId];
        if (markerElement) {
          const svgElement = markerElement.querySelector('svg');
          if (svgElement) {
            // Update rotation based on current heading
            svgElement.style.transform = `rotate(${flight.heading}deg)`;
            
            // Update color based on current status
            const onGround = isOnGround(flight);
            const isSelected = selectedMarkerIdRef.current === flight.flightId;
            
            if (onGround) {
              svgElement.style.filter = isSelected ? filterStyles.onGroundSelected : filterStyles.onGroundNormal;
            } else {
              svgElement.style.filter = isSelected ? filterStyles.airborneSelected : filterStyles.airborneNormal;
            }
          }
        }
      } else {
        // Create new marker
        console.log(`➕ Creating new marker for flight ${flight.flightId} (${flight.callsign})`);
        const newMarker = createMarker(flight);
        newMarker.addTo(map);
        markersRef.current[flight.flightId] = newMarker;
      }
    });

    console.log(`📊 Active markers: ${Object.keys(markersRef.current).length}`);
  }, [map, flights, currentFlightIds, createMarker, isOnGround, filterStyles]);

  // Cleanup effect
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
