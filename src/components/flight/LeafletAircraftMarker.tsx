import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import L from 'leaflet';
import { Flight } from '@/services/flight';

interface LeafletAircraftMarkerProps {
  map: L.Map;
  flights: Flight[];
  onFlightSelect: (flight: Flight) => void;
  selectedFlightId?: string | null;
}

const LeafletAircraftMarker: React.FC<LeafletAircraftMarkerProps> = ({ 
  map, 
  flights, 
  onFlightSelect,
  selectedFlightId 
}) => {
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const selectedMarkerIdRef = useRef<string | null>(null);
  const lastKnownFlightDataRef = useRef<{ [key: string]: Flight }>({});

  // Memoize flight lookup for better performance
  const flightLookup = useMemo(() => {
    const lookup: { [key: string]: Flight } = {};
    flights.forEach(flight => {
      lookup[flight.flightId] = flight;
      // Store last known data for all flights
      lastKnownFlightDataRef.current[flight.flightId] = flight;
    });
    return lookup;
  }, [flights]);

  // Memoize current flight IDs set
  const currentFlightIds = useMemo(() => {
    return new Set(flights.map(f => f.flightId));
  }, [flights]);

  // Update selected marker reference when prop changes
  useEffect(() => {
    selectedMarkerIdRef.current = selectedFlightId || null;
  }, [selectedFlightId]);

  // Function to determine if aircraft is on ground
  const isOnGround = useCallback((flight: Flight): boolean => {
    return flight.altitude < 100 && flight.speed < 50;
  }, []);

  // Create SVG icon for aircraft with improved quality and glow effect
  const createAircraftIcon = useCallback((flight: Flight, isSelected: boolean = false): L.DivIcon => {
    const onGround = isOnGround(flight);
    
    // Slate color scheme to match FlightDetails panel
    const baseColor = onGround ? '#64748b' : '#475569'; // Slate-500 for ground, slate-600 for airborne
    const selectedColor = '#334155'; // Slate-700 for selected
    const color = isSelected ? selectedColor : baseColor;
    
    // Glow effect for selected aircraft instead of stroke
    const glowEffect = isSelected 
      ? 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.8)) drop-shadow(0 0 20px rgba(59, 130, 246, 0.4))' 
      : 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))';
    
    const svgIcon = `
      <svg width="32" height="32" viewBox="0 0 512 512" style="transform: rotate(${flight.heading}deg); filter: ${glowEffect};" class="aircraft-svg">
        <path d="M256 64c-32 0-64 32-64 64v128l-128 64v32l128-32v96l-32 32v32l64-16 64 16v-32l-32-32v-96l128 32v-32l-128-64V128c0-32-32-64-64-64z" 
              fill="${color}" 
              stroke="none"
              vector-effect="non-scaling-stroke"/>
      </svg>
    `;

    return L.divIcon({
      html: svgIcon,
      className: `aircraft-marker ${isSelected ? 'aircraft-marker-selected aircraft-marker-glow' : ''}`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  }, [isOnGround]);

  // Update marker style
  const updateMarkerStyle = useCallback((marker: L.Marker, flight: Flight, isSelected: boolean) => {
    const newIcon = createAircraftIcon(flight, isSelected);
    marker.setIcon(newIcon);
  }, [createAircraftIcon]);

  // Update all marker styles
  const updateAllMarkerStyles = useCallback(() => {
    Object.keys(markersRef.current).forEach(flightId => {
      const marker = markersRef.current[flightId];
      const flight = flightLookup[flightId] || lastKnownFlightDataRef.current[flightId];
      
      if (marker && flight) {
        const isSelected = selectedMarkerIdRef.current === flight.flightId;
        updateMarkerStyle(marker, flight, isSelected);
      }
    });
  }, [flightLookup, updateMarkerStyle]);

  // Create marker for flight
  const createMarker = useCallback((flight: Flight): L.Marker => {
    const icon = createAircraftIcon(flight, false);
    
    const marker = L.marker([flight.latitude, flight.longitude], { icon })
      .on('click', () => {
        console.log(`🎯 Aircraft clicked: ${flight.flightId} (${flight.callsign})`);
        onFlightSelect(flight);
        
        // Update selected marker reference
        selectedMarkerIdRef.current = flight.flightId;
        
        // Update all marker styles to reflect selection
        updateAllMarkerStyles();
      });

    return marker;
  }, [createAircraftIcon, onFlightSelect, updateAllMarkerStyles]);

  // Main effect to manage markers
  useEffect(() => {
    if (!map) return;

    console.log(`🔄 Updating ${flights.length} aircraft markers`);
    
    // Remove markers for flights that no longer exist, BUT protect selected flight
    Object.keys(markersRef.current).forEach(flightId => {
      if (!currentFlightIds.has(flightId)) {
        // Don't remove the selected flight marker even if it's not in current data
        if (selectedMarkerIdRef.current === flightId) {
          console.log(`🛡️ Protecting selected flight marker ${flightId} from removal`);
          
          // Update marker with last known data but keep it visible
          const lastKnownFlight = lastKnownFlightDataRef.current[flightId];
          if (lastKnownFlight) {
            updateMarkerStyle(markersRef.current[flightId], lastKnownFlight, true);
          }
          return; // Skip removal for selected flight
        }
        
        console.log(`🗑️ Removing marker for flight ${flightId}`);
        map.removeLayer(markersRef.current[flightId]);
        delete markersRef.current[flightId];
      }
    });

    // Update or create markers for current flights
    flights.forEach(flight => {
      const existingMarker = markersRef.current[flight.flightId];
      
      if (existingMarker) {
        // Update existing marker position and icon
        existingMarker.setLatLng([flight.latitude, flight.longitude]);
        
        // Update icon with current flight data
        const isSelected = selectedMarkerIdRef.current === flight.flightId;
        updateMarkerStyle(existingMarker, flight, isSelected);
      } else {
        // Create new marker
        console.log(`➕ Creating new marker for flight ${flight.flightId} (${flight.callsign})`);
        const newMarker = createMarker(flight);
        newMarker.addTo(map);
        markersRef.current[flight.flightId] = newMarker;
      }
    });

    console.log(`📊 Active markers: ${Object.keys(markersRef.current).length}`);
  }, [map, flights, currentFlightIds, createMarker, updateMarkerStyle]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      Object.values(markersRef.current).forEach(marker => {
        if (map) {
          map.removeLayer(marker);
        }
      });
      markersRef.current = {};
    };
  }, [map]);

  return null;
};

export default LeafletAircraftMarker;
