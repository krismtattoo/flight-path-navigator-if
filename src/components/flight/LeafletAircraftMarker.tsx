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
  const markerMissCountRef = useRef<{ [key: string]: number }>({});
  const isUpdatingRef = useRef(false);
  const selectedProtectionTimeRef = useRef<{ [key: string]: number }>({});

  // Constants for marker protection
  const MAX_MISS_COUNT = 3; // Allow 3 missing updates before removal
  const SELECTED_PROTECTION_TIME = 60000; // 60 seconds protection for selected aircraft

  // Memoize flight lookup for better performance
  const flightLookup = useMemo(() => {
    const lookup: { [key: string]: Flight } = {};
    flights.forEach(flight => {
      lookup[flight.flightId] = flight;
      // Store last known data for all flights
      lastKnownFlightDataRef.current[flight.flightId] = flight;
      // Reset miss count for existing flights
      markerMissCountRef.current[flight.flightId] = 0;
    });
    return lookup;
  }, [flights]);

  // Memoize current flight IDs set
  const currentFlightIds = useMemo(() => {
    return new Set(flights.map(f => f.flightId));
  }, [flights]);

  // Update selected marker reference when prop changes
  useEffect(() => {
    const prevSelected = selectedMarkerIdRef.current;
    const newSelected = selectedFlightId || null;
    
    console.log(`🔄 selectedFlightId changed from ${prevSelected} to ${newSelected}`);
    selectedMarkerIdRef.current = newSelected;
    
    // Set protection time for newly selected aircraft
    if (newSelected && newSelected !== prevSelected) {
      selectedProtectionTimeRef.current[newSelected] = Date.now();
      console.log(`🛡️ Setting protection for selected flight ${newSelected}`);
    }
    
    // Update all marker styles when selection changes
    if (!isUpdatingRef.current) {
      updateAllMarkerStyles();
    }
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

  // Update marker style with DOM safety check
  const updateMarkerStyle = useCallback((marker: L.Marker, flight: Flight, isSelected: boolean) => {
    try {
      if (!marker || !flight) return;
      
      const newIcon = createAircraftIcon(flight, isSelected);
      marker.setIcon(newIcon);
    } catch (error) {
      console.warn(`⚠️ Failed to update marker style for flight ${flight?.flightId}:`, error);
    }
  }, [createAircraftIcon]);

  // Update all marker styles
  const updateAllMarkerStyles = useCallback(() => {
    if (isUpdatingRef.current) return;
    
    console.log(`🎨 Updating all marker styles, selected: ${selectedMarkerIdRef.current}`);
    
    Object.keys(markersRef.current).forEach(flightId => {
      const marker = markersRef.current[flightId];
      const flight = flightLookup[flightId] || lastKnownFlightDataRef.current[flightId];
      
      if (marker && flight) {
        const isSelected = selectedMarkerIdRef.current === flight.flightId;
        updateMarkerStyle(marker, flight, isSelected);
      }
    });
  }, [flightLookup, updateMarkerStyle]);

  // Check if marker should be protected from removal
  const isMarkerProtected = useCallback((flightId: string): boolean => {
    // Always protect selected marker
    if (selectedMarkerIdRef.current === flightId) {
      console.log(`🛡️ Protecting selected marker ${flightId}`);
      return true;
    }
    
    // Protect recently selected markers for a time period
    const protectionTime = selectedProtectionTimeRef.current[flightId];
    if (protectionTime && (Date.now() - protectionTime) < SELECTED_PROTECTION_TIME) {
      console.log(`🛡️ Protecting recently selected marker ${flightId} (${Math.round((SELECTED_PROTECTION_TIME - (Date.now() - protectionTime)) / 1000)}s remaining)`);
      return true;
    }
    
    return false;
  }, []);

  // Create marker for flight with DOM safety check
  const createMarker = useCallback((flight: Flight): L.Marker | null => {
    try {
      if (!map || !flight) return null;
      
      const icon = createAircraftIcon(flight, false);
      
      const marker = L.marker([flight.latitude, flight.longitude], { icon })
        .on('click', () => {
          console.log(`🎯 Aircraft clicked: ${flight.flightId} (${flight.callsign})`);
          onFlightSelect(flight);
          
          // Update selected marker reference immediately
          selectedMarkerIdRef.current = flight.flightId;
          selectedProtectionTimeRef.current[flight.flightId] = Date.now();
          
          // Update all marker styles to reflect selection
          setTimeout(() => updateAllMarkerStyles(), 50);
        });

      return marker;
    } catch (error) {
      console.error(`❌ Failed to create marker for flight ${flight.flightId}:`, error);
      return null;
    }
  }, [createAircraftIcon, onFlightSelect, updateAllMarkerStyles, map]);

  // Main effect to manage markers
  useEffect(() => {
    if (!map) return;

    isUpdatingRef.current = true;
    console.log(`🔄 Updating ${flights.length} aircraft markers`);
    
    // Update miss counts and handle marker removal with protection
    Object.keys(markersRef.current).forEach(flightId => {
      if (!currentFlightIds.has(flightId)) {
        // Increment miss count
        markerMissCountRef.current[flightId] = (markerMissCountRef.current[flightId] || 0) + 1;
        const missCount = markerMissCountRef.current[flightId];
        
        console.log(`📊 Flight ${flightId} missing (count: ${missCount}/${MAX_MISS_COUNT})`);
        
        // Check if marker should be protected
        if (isMarkerProtected(flightId)) {
          // Update marker with last known data but keep it visible
          const lastKnownFlight = lastKnownFlightDataRef.current[flightId];
          if (lastKnownFlight) {
            const isSelected = selectedMarkerIdRef.current === flightId;
            updateMarkerStyle(markersRef.current[flightId], lastKnownFlight, isSelected);
          }
          return; // Skip removal for protected marker
        }
        
        // Only remove after MAX_MISS_COUNT consecutive misses
        if (missCount >= MAX_MISS_COUNT) {
          console.log(`🗑️ Removing marker for flight ${flightId} after ${missCount} misses`);
          try {
            if (markersRef.current[flightId]) {
              map.removeLayer(markersRef.current[flightId]);
              delete markersRef.current[flightId];
              delete markerMissCountRef.current[flightId];
              delete selectedProtectionTimeRef.current[flightId];
            }
          } catch (error) {
            console.warn(`⚠️ Failed to remove marker for flight ${flightId}:`, error);
          }
        }
      } else {
        // Reset miss count for existing flights
        markerMissCountRef.current[flightId] = 0;
      }
    });

    // Update or create markers for current flights
    flights.forEach(flight => {
      const existingMarker = markersRef.current[flight.flightId];
      
      if (existingMarker) {
        // Update existing marker position and icon
        try {
          existingMarker.setLatLng([flight.latitude, flight.longitude]);
          
          // Update icon with current flight data
          const isSelected = selectedMarkerIdRef.current === flight.flightId;
          updateMarkerStyle(existingMarker, flight, isSelected);
        } catch (error) {
          console.warn(`⚠️ Failed to update existing marker for flight ${flight.flightId}:`, error);
        }
      } else {
        // Create new marker
        console.log(`➕ Creating new marker for flight ${flight.flightId} (${flight.callsign})`);
        const newMarker = createMarker(flight);
        
        if (newMarker) {
          try {
            newMarker.addTo(map);
            markersRef.current[flight.flightId] = newMarker;
            markerMissCountRef.current[flight.flightId] = 0;
          } catch (error) {
            console.error(`❌ Failed to add marker to map for flight ${flight.flightId}:`, error);
          }
        }
      }
    });

    console.log(`📊 Active markers: ${Object.keys(markersRef.current).length}`);
    console.log(`🛡️ Protected markers: ${Object.keys(selectedProtectionTimeRef.current).length}`);
    isUpdatingRef.current = false;
  }, [map, flights, currentFlightIds, createMarker, updateMarkerStyle, isMarkerProtected]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      try {
        Object.values(markersRef.current).forEach(marker => {
          if (map && marker) {
            map.removeLayer(marker);
          }
        });
        markersRef.current = {};
        markerMissCountRef.current = {};
        selectedProtectionTimeRef.current = {};
      } catch (error) {
        console.warn('⚠️ Error during marker cleanup:', error);
      }
    };
  }, [map]);

  return null;
};

export default LeafletAircraftMarker;
