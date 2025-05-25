import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import L from 'leaflet';
import { Flight } from '@/services/flight';

interface LeafletAircraftMarkerProps {
  map: L.Map;
  flights: Flight[];
  onFlightSelect: (flight: Flight) => void;
  selectedFlightId?: string | null;
  selectionInProgress?: string | null;
}

const LeafletAircraftMarker: React.FC<LeafletAircraftMarkerProps> = ({ 
  map, 
  flights, 
  onFlightSelect,
  selectedFlightId,
  selectionInProgress
}) => {
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const lastKnownFlightDataRef = useRef<{ [key: string]: Flight }>({});
  const markerMissCountRef = useRef<{ [key: string]: number }>({});
  const isUpdatingRef = useRef(false);
  const protectedMarkersRef = useRef<Set<string>>(new Set());

  // Constants for enhanced marker protection
  const MAX_MISS_COUNT = 5; // Increased from 3 to 5
  const CRITICAL_PROTECTION_TIME = 10000; // 10 seconds for critical operations

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

  // Enhanced protection check with multiple protection layers
  const isMarkerProtected = useCallback((flightId: string): boolean => {
    // CRITICAL PROTECTION: Selection in progress
    if (selectionInProgress === flightId) {
      console.log(`🛡️ CRITICAL PROTECTION: Selection in progress for ${flightId}`);
      return true;
    }
    
    // CRITICAL PROTECTION: Currently selected
    if (selectedFlightId === flightId) {
      console.log(`🛡️ CRITICAL PROTECTION: Currently selected ${flightId}`);
      return true;
    }
    
    // CRITICAL PROTECTION: Manually protected markers
    if (protectedMarkersRef.current.has(flightId)) {
      console.log(`🛡️ CRITICAL PROTECTION: Manually protected ${flightId}`);
      return true;
    }
    
    return false;
  }, [selectedFlightId, selectionInProgress]);

  // Enhanced marker protection when selection changes
  useEffect(() => {
    if (selectedFlightId) {
      console.log(`🛡️ Adding enhanced protection for selected flight: ${selectedFlightId}`);
      protectedMarkersRef.current.add(selectedFlightId);
      
      // Remove protection after a delay (but keep other protections active)
      setTimeout(() => {
        if (!selectionInProgress) {
          protectedMarkersRef.current.delete(selectedFlightId);
          console.log(`🔓 Removed manual protection for ${selectedFlightId}`);
        }
      }, CRITICAL_PROTECTION_TIME);
    }
  }, [selectedFlightId, selectionInProgress]);

  // Function to determine if aircraft is on ground
  const isOnGround = useCallback((flight: Flight): boolean => {
    return flight.altitude < 100 && flight.speed < 50;
  }, []);

  // Create SVG icon for aircraft with elegant minimalist design
  const createAircraftIcon = useCallback((flight: Flight, isSelected: boolean = false): L.DivIcon => {
    const onGround = isOnGround(flight);
    
    // Elegant colors for minimalist design
    const baseColor = onGround ? '#64748b' : '#93c5fd';
    const selectedColor = '#bfdbfe';
    const color = isSelected ? selectedColor : baseColor;
    
    const glowEffect = isSelected 
      ? 'drop-shadow(0 0 20px rgba(147, 197, 253, 0.8)) drop-shadow(0 0 40px rgba(147, 197, 253, 0.4))' 
      : 'drop-shadow(0 2px 8px rgba(10, 22, 40, 0.3))';
    
    const svgIcon = `
      <svg width="28" height="28" viewBox="0 0 512 512" style="transform: rotate(${flight.heading}deg); filter: ${glowEffect};" class="aircraft-svg">
        <path d="M256 64c-32 0-64 32-64 64v128l-128 64v32l128-32v96l-32 32v32l64-16 64 16v-32l-32-32v-96l128 32v-32l-128-64V128c0-32-32-64-64-64z" 
              fill="${color}" 
              stroke="rgba(147, 197, 253, 0.6)"
              stroke-width="1"
              vector-effect="non-scaling-stroke"/>
      </svg>
    `;

    return L.divIcon({
      html: svgIcon,
      className: `aircraft-marker ${isSelected ? 'aircraft-marker-selected aircraft-marker-glow' : ''}`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  }, [isOnGround]);

  // Update marker style with enhanced safety
  const updateMarkerStyle = useCallback((marker: L.Marker, flight: Flight, isSelected: boolean) => {
    try {
      if (!marker || !flight) return;
      
      const newIcon = createAircraftIcon(flight, isSelected);
      marker.setIcon(newIcon);
    } catch (error) {
      console.warn(`⚠️ Failed to update marker style for flight ${flight?.flightId}:`, error);
    }
  }, [createAircraftIcon]);

  // Create marker with enhanced click handling
  const createMarker = useCallback((flight: Flight): L.Marker | null => {
    try {
      if (!map || !flight) return null;
      
      const icon = createAircraftIcon(flight, false);
      
      const marker = L.marker([flight.latitude, flight.longitude], { icon })
        .on('click', () => {
          console.log(`🎯 Aircraft clicked: ${flight.flightId} (${flight.callsign})`);
          
          // CRITICAL: Add immediate protection before calling selection handler
          protectedMarkersRef.current.add(flight.flightId);
          console.log(`🛡️ IMMEDIATE PROTECTION activated for ${flight.flightId}`);
          
          // Call selection handler
          onFlightSelect(flight);
        });

      return marker;
    } catch (error) {
      console.error(`❌ Failed to create marker for flight ${flight.flightId}:`, error);
      return null;
    }
  }, [createAircraftIcon, onFlightSelect, map]);

  // Enhanced main effect to manage markers with better protection
  useEffect(() => {
    if (!map) return;

    isUpdatingRef.current = true;
    console.log(`🔄 Updating ${flights.length} aircraft markers (Protected: ${Array.from(protectedMarkersRef.current).join(', ')})`);
    
    // Enhanced marker removal logic with better protection
    Object.keys(markersRef.current).forEach(flightId => {
      if (!currentFlightIds.has(flightId)) {
        // Check protection FIRST before incrementing miss count
        if (isMarkerProtected(flightId)) {
          console.log(`🛡️ PROTECTED: Keeping marker ${flightId} despite missing from flight list`);
          
          // Update marker with last known data to keep it visible
          const lastKnownFlight = lastKnownFlightDataRef.current[flightId];
          if (lastKnownFlight && markersRef.current[flightId]) {
            const isSelected = selectedFlightId === flightId || selectionInProgress === flightId;
            updateMarkerStyle(markersRef.current[flightId], lastKnownFlight, isSelected);
          }
          return; // Skip miss count and removal logic
        }
        
        // Increment miss count only for unprotected markers
        markerMissCountRef.current[flightId] = (markerMissCountRef.current[flightId] || 0) + 1;
        const missCount = markerMissCountRef.current[flightId];
        
        console.log(`📊 Flight ${flightId} missing (count: ${missCount}/${MAX_MISS_COUNT})`);
        
        // Only remove after MAX_MISS_COUNT consecutive misses
        if (missCount >= MAX_MISS_COUNT) {
          console.log(`🗑️ Removing marker for flight ${flightId} after ${missCount} misses`);
          try {
            if (markersRef.current[flightId]) {
              map.removeLayer(markersRef.current[flightId]);
              delete markersRef.current[flightId];
              delete markerMissCountRef.current[flightId];
              protectedMarkersRef.current.delete(flightId);
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
          
          // Enhanced selection check - fix the variable scope issue
          const isSelected = selectedFlightId === flight.flightId || selectionInProgress === flightId;
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

    console.log(`📊 Active markers: ${Object.keys(markersRef.current).length}, Protected: ${protectedMarkersRef.current.size}`);
    isUpdatingRef.current = false;
  }, [map, flights, currentFlightIds, createMarker, updateMarkerStyle, isMarkerProtected, selectedFlightId, selectionInProgress]);

  // Enhanced cleanup effect
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
        protectedMarkersRef.current.clear();
      } catch (error) {
        console.warn('⚠️ Error during marker cleanup:', error);
      }
    };
  }, [map]);

  return null;
};

export default LeafletAircraftMarker;
