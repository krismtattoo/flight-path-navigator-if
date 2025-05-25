
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
  const protectedMarkersRef = useRef<Set<string>>(new Set());
  const isUpdatingRef = useRef(false);

  // Constants for enhanced marker protection
  const MAX_MISS_COUNT = 3; // Reduced from 5 for faster cleanup

  // CRITICAL: Add immediate protection when clicking
  const addImmediateProtection = useCallback((flightId: string) => {
    console.log(`🛡️ IMMEDIATE PROTECTION: Adding ${flightId}`);
    protectedMarkersRef.current.add(flightId);
  }, []);

  // Enhanced protection check with strict priority
  const isMarkerProtected = useCallback((flightId: string): boolean => {
    // CRITICAL PROTECTION: Selection in progress (highest priority)
    if (selectionInProgress === flightId) {
      return true;
    }
    
    // CRITICAL PROTECTION: Currently selected (second highest priority)
    if (selectedFlightId === flightId) {
      return true;
    }
    
    // CRITICAL PROTECTION: Manually protected markers (temporary protection)
    if (protectedMarkersRef.current.has(flightId)) {
      return true;
    }
    
    return false;
  }, [selectedFlightId, selectionInProgress]);

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

  // FIXED: Enhanced currentFlightIds that ALWAYS includes protected flights FIRST
  const currentFlightIds = useMemo(() => {
    const baseFlightIds = new Set<string>();
    
    // FIRST: Add all protected flights (prevents removal)
    protectedMarkersRef.current.forEach(protectedId => {
      baseFlightIds.add(protectedId);
      console.log(`🛡️ PRIORITY: Adding protected flight ${protectedId} to currentFlightIds`);
    });
    
    // SECOND: Add current flights from API
    flights.forEach(f => baseFlightIds.add(f.flightId));
    
    console.log(`📊 currentFlightIds: ${baseFlightIds.size} total (${flights.length} from API + ${baseFlightIds.size - flights.length} protected)`);
    return baseFlightIds;
  }, [flights]);

  // PERMANENT protection management
  useEffect(() => {
    if (selectedFlightId) {
      console.log(`🛡️ Adding PERMANENT protection for selected flight: ${selectedFlightId}`);
      protectedMarkersRef.current.add(selectedFlightId);
    }
    
    if (selectionInProgress) {
      console.log(`🛡️ Adding PERMANENT protection for selection in progress: ${selectionInProgress}`);
      protectedMarkersRef.current.add(selectionInProgress);
    }
    
    // Clean up protection for flights that are no longer selected AND not in progress
    const currentProtected = Array.from(protectedMarkersRef.current);
    currentProtected.forEach(protectedId => {
      if (protectedId !== selectedFlightId && protectedId !== selectionInProgress) {
        console.log(`🔓 Removing protection for unselected flight: ${protectedId}`);
        protectedMarkersRef.current.delete(protectedId);
      }
    });
  }, [selectedFlightId, selectionInProgress]);

  // Determine if aircraft is on ground
  const isOnGround = useCallback((flight: Flight): boolean => {
    return flight.altitude < 200;
  }, []);

  // SIMPLIFIED aircraft icon creation (removed problematic animations)
  const createAircraftIcon = useCallback((flight: Flight, isSelected: boolean = false): L.DivIcon => {
    const onGround = isOnGround(flight);
    
    // Simplified color scheme
    const baseColor = onGround ? '#9ca3af' : '#475569';
    const selectedColor = '#3b82f6'; // Blue for selected
    const color = isSelected ? selectedColor : baseColor;
    
    // SIMPLIFIED: Removed problematic glow effects
    const svgIcon = `
      <svg width="24" height="24" viewBox="0 0 512 512" style="transform: rotate(${flight.heading}deg);" class="aircraft-svg">
        <path d="M256 64c-32 0-64 32-64 64v128l-128 64v32l128-32v96l-32 32v32l64-16 64 16v-32l-32-32v-96l128 32v-32l-128-64V128c0-32-32-64-64-64z" 
              fill="${color}" 
              stroke="${isSelected ? '#ffffff' : 'none'}"
              stroke-width="${isSelected ? '8' : '0'}"
              vector-effect="non-scaling-stroke"/>
      </svg>
    `;

    return L.divIcon({
      html: svgIcon,
      className: `aircraft-marker ${isSelected ? 'aircraft-marker-selected' : ''}`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  }, [isOnGround]);

  // SAFE marker cleanup function
  const safeRemoveMarker = useCallback((flightId: string) => {
    const marker = markersRef.current[flightId];
    if (marker && map) {
      try {
        // Remove from map
        map.removeLayer(marker);
        // Clean up references
        delete markersRef.current[flightId];
        delete markerMissCountRef.current[flightId];
        console.log(`🗑️ SAFE: Removed marker for flight ${flightId}`);
      } catch (error) {
        console.warn(`⚠️ Error removing marker for flight ${flightId}:`, error);
        // Force cleanup even if removal fails
        delete markersRef.current[flightId];
        delete markerMissCountRef.current[flightId];
      }
    }
  }, [map]);

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

  // ENHANCED marker creation with immediate protection
  const createMarker = useCallback((flight: Flight): L.Marker | null => {
    try {
      if (!map || !flight) return null;
      
      const isSelected = selectedFlightId === flight.flightId || selectionInProgress === flight.flightId;
      const icon = createAircraftIcon(flight, isSelected);
      
      const marker = L.marker([flight.latitude, flight.longitude], { 
        icon,
        // Disable dragging to prevent ghost markers
        draggable: false,
        keyboard: false
      })
        .on('click', (e) => {
          console.log(`🎯 Aircraft clicked: ${flight.flightId} (${flight.callsign})`);
          
          // CRITICAL: Add immediate protection BEFORE calling selection handler
          addImmediateProtection(flight.flightId);
          
          // Prevent event bubbling that could cause issues
          L.DomEvent.stopPropagation(e);
          
          // Call selection handler
          onFlightSelect(flight);
        });

      return marker;
    } catch (error) {
      console.error(`❌ Failed to create marker for flight ${flight.flightId}:`, error);
      return null;
    }
  }, [createAircraftIcon, onFlightSelect, map, selectedFlightId, selectionInProgress, addImmediateProtection]);

  // MAIN EFFECT: Enhanced marker management with strict protection
  useEffect(() => {
    if (!map || isUpdatingRef.current) return;

    isUpdatingRef.current = true;
    
    try {
      console.log(`🔄 Updating ${flights.length} aircraft markers`);
      
      // PHASE 1: PROTECTED MARKER UPDATES (highest priority)
      Object.keys(markersRef.current).forEach(flightId => {
        if (isMarkerProtected(flightId)) {
          console.log(`🛡️ PROTECTED: Maintaining marker ${flightId}`);
          
          // Update with current or last known data
          const currentFlight = flightLookup[flightId] || lastKnownFlightDataRef.current[flightId];
          if (currentFlight && markersRef.current[flightId]) {
            try {
              // Update position if we have current data
              if (flightLookup[flightId]) {
                markersRef.current[flightId].setLatLng([currentFlight.latitude, currentFlight.longitude]);
              }
              
              const isSelected = selectedFlightId === flightId || selectionInProgress === flightId;
              updateMarkerStyle(markersRef.current[flightId], currentFlight, isSelected);
            } catch (error) {
              console.warn(`⚠️ Failed to update protected marker ${flightId}:`, error);
            }
          }
          
          // Reset miss count for protected markers
          markerMissCountRef.current[flightId] = 0;
          return; // Skip all removal logic for protected markers
        }
        
        // PHASE 2: UNPROTECTED MARKER MANAGEMENT
        if (!currentFlightIds.has(flightId)) {
          markerMissCountRef.current[flightId] = (markerMissCountRef.current[flightId] || 0) + 1;
          const missCount = markerMissCountRef.current[flightId];
          
          console.log(`📊 Flight ${flightId} missing (count: ${missCount}/${MAX_MISS_COUNT})`);
          
          if (missCount >= MAX_MISS_COUNT) {
            safeRemoveMarker(flightId);
            protectedMarkersRef.current.delete(flightId);
          }
        } else {
          markerMissCountRef.current[flightId] = 0;
        }
      });

      // PHASE 3: CREATE/UPDATE CURRENT FLIGHTS
      flights.forEach(flight => {
        const existingMarker = markersRef.current[flight.flightId];
        
        if (existingMarker) {
          // Update existing marker
          try {
            existingMarker.setLatLng([flight.latitude, flight.longitude]);
            
            const isSelected = selectedFlightId === flight.flightId || selectionInProgress === flight.flightId;
            updateMarkerStyle(existingMarker, flight, isSelected);
          } catch (error) {
            console.warn(`⚠️ Failed to update existing marker for flight ${flight.flightId}:`, error);
          }
        } else {
          // Create new marker
          const groundStatus = isOnGround(flight) ? 'ON GROUND' : 'AIRBORNE';
          console.log(`➕ Creating new marker for flight ${flight.flightId} (${flight.callsign}) - ${groundStatus}`);
          
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
      
    } finally {
      isUpdatingRef.current = false;
    }
  }, [map, flights, currentFlightIds, createMarker, updateMarkerStyle, isMarkerProtected, selectedFlightId, selectionInProgress, isOnGround, flightLookup, safeRemoveMarker]);

  // Enhanced cleanup effect
  useEffect(() => {
    return () => {
      try {
        console.log('🧹 Cleaning up all markers');
        Object.entries(markersRef.current).forEach(([flightId, marker]) => {
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
