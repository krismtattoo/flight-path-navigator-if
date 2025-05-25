
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
  const MAX_MISS_COUNT = 5;

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

  // CRITICAL FIX: Enhanced currentFlightIds that ALWAYS includes protected flights
  const currentFlightIds = useMemo(() => {
    const baseFlightIds = new Set(flights.map(f => f.flightId));
    
    // ALWAYS include protected flights, even if they're not in the current flight list
    protectedMarkersRef.current.forEach(protectedId => {
      if (!baseFlightIds.has(protectedId)) {
        console.log(`🛡️ FORCE ADDING protected flight ${protectedId} to currentFlightIds`);
        baseFlightIds.add(protectedId);
      }
    });
    
    console.log(`📊 currentFlightIds: ${baseFlightIds.size} total (${flights.length} from API + ${baseFlightIds.size - flights.length} protected)`);
    return baseFlightIds;
  }, [flights]);

  // Enhanced protection check with better logging
  const isMarkerProtected = useCallback((flightId: string): boolean => {
    // CRITICAL PROTECTION: Selection in progress (highest priority)
    if (selectionInProgress === flightId) {
      console.log(`🛡️ CRITICAL PROTECTION: Selection in progress for ${flightId}`);
      return true;
    }
    
    // CRITICAL PROTECTION: Currently selected (second highest priority)
    if (selectedFlightId === flightId) {
      console.log(`🛡️ CRITICAL PROTECTION: Currently selected ${flightId}`);
      return true;
    }
    
    // CRITICAL PROTECTION: Manually protected markers (temporary protection)
    if (protectedMarkersRef.current.has(flightId)) {
      console.log(`🛡️ CRITICAL PROTECTION: Manually protected ${flightId}`);
      return true;
    }
    
    return false;
  }, [selectedFlightId, selectionInProgress]);

  // PERMANENT protection management - no automatic removal
  useEffect(() => {
    if (selectedFlightId) {
      console.log(`🛡️ Adding PERMANENT protection for selected flight: ${selectedFlightId}`);
      protectedMarkersRef.current.add(selectedFlightId);
    }
    
    // Only clean up protection for flights that are no longer selected AND not in progress
    const currentProtected = Array.from(protectedMarkersRef.current);
    currentProtected.forEach(protectedId => {
      if (protectedId !== selectedFlightId && protectedId !== selectionInProgress) {
        console.log(`🔓 Removing protection for unselected flight: ${protectedId}`);
        protectedMarkersRef.current.delete(protectedId);
      }
    });
  }, [selectedFlightId, selectionInProgress]);

  // Updated function to determine if aircraft is on ground - only use altitude < 200ft
  const isOnGround = useCallback((flight: Flight): boolean => {
    return flight.altitude < 200;
  }, []);

  // Create SVG icon for aircraft with updated colors for ground aircraft
  const createAircraftIcon = useCallback((flight: Flight, isSelected: boolean = false): L.DivIcon => {
    const onGround = isOnGround(flight);
    
    // Updated color scheme: light gray for ground aircraft, darker colors for airborne
    const baseColor = onGround ? '#9ca3af' : '#475569'; // Light gray for ground, slate for airborne
    const selectedColor = '#334155'; // Dark slate for selected
    const color = isSelected ? selectedColor : baseColor;
    
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

  // Create marker with enhanced click handling and immediate protection
  const createMarker = useCallback((flight: Flight): L.Marker | null => {
    try {
      if (!map || !flight) return null;
      
      const icon = createAircraftIcon(flight, false);
      
      const marker = L.marker([flight.latitude, flight.longitude], { icon })
        .on('click', () => {
          console.log(`🎯 Aircraft clicked: ${flight.flightId} (${flight.callsign}) - Altitude: ${flight.altitude}ft ${isOnGround(flight) ? '(ON GROUND)' : '(AIRBORNE)'}`);
          
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
  }, [createAircraftIcon, onFlightSelect, map, isOnGround]);

  // MAIN FIX: Enhanced marker management that respects protection
  useEffect(() => {
    if (!map) return;

    isUpdatingRef.current = true;
    
    // Count ground vs airborne aircraft for debugging
    const groundAircraft = flights.filter(f => isOnGround(f)).length;
    const airborneAircraft = flights.length - groundAircraft;
    
    console.log(`🔄 Updating ${flights.length} aircraft markers (Ground: ${groundAircraft}, Airborne: ${airborneAircraft}, Protected: ${Array.from(protectedMarkersRef.current).join(', ')})`);
    
    // CRITICAL FIX: Enhanced marker removal logic that NEVER removes protected markers
    Object.keys(markersRef.current).forEach(flightId => {
      // FIRST: Check if marker is protected - if so, NEVER remove it
      if (isMarkerProtected(flightId)) {
        console.log(`🛡️ PROTECTED: Keeping marker ${flightId} (PERMANENT PROTECTION)`);
        
        // Update marker with last known data or current data
        const currentFlight = flightLookup[flightId] || lastKnownFlightDataRef.current[flightId];
        if (currentFlight && markersRef.current[flightId]) {
          try {
            // Update position if we have current data
            if (flightLookup[flightId]) {
              markersRef.current[flightId].setLatLng([currentFlight.latitude, currentFlight.longitude]);
            }
            
            const isSelected = selectedFlightId === flightId || selectionInProgress === flightId;
            updateMarkerStyle(markersRef.current[flightId], currentFlight, isSelected);
            console.log(`🔄 Updated PROTECTED marker for flight ${flightId}`);
          } catch (error) {
            console.warn(`⚠️ Failed to update protected marker ${flightId}:`, error);
          }
        }
        
        // Reset miss count for protected markers
        markerMissCountRef.current[flightId] = 0;
        return; // Skip all removal logic for protected markers
      }
      
      // SECOND: For non-protected markers, check if they're in current flight list
      if (!currentFlightIds.has(flightId)) {
        // Increment miss count only for unprotected markers
        markerMissCountRef.current[flightId] = (markerMissCountRef.current[flightId] || 0) + 1;
        const missCount = markerMissCountRef.current[flightId];
        
        console.log(`📊 Flight ${flightId} missing (count: ${missCount}/${MAX_MISS_COUNT}) - NOT PROTECTED`);
        
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
          
          // Enhanced selection check
          const isSelected = selectedFlightId === flight.flightId || selectionInProgress === flight.flightId;
          updateMarkerStyle(existingMarker, flight, isSelected);
          
          if (isSelected) {
            console.log(`🔄 Updated SELECTED marker for flight ${flight.flightId}`);
          }
        } catch (error) {
          console.warn(`⚠️ Failed to update existing marker for flight ${flight.flightId}:`, error);
        }
      } else {
        // Create new marker
        const groundStatus = isOnGround(flight) ? 'ON GROUND' : 'AIRBORNE';
        console.log(`➕ Creating new marker for flight ${flight.flightId} (${flight.callsign}) - ${flight.altitude}ft ${groundStatus}`);
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
  }, [map, flights, currentFlightIds, createMarker, updateMarkerStyle, isMarkerProtected, selectedFlightId, selectionInProgress, isOnGround, flightLookup]);

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
