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

  const MAX_MISS_COUNT = 3;

  const addImmediateProtection = useCallback((flightId: string) => {
    console.log(`🛡️ IMMEDIATE PROTECTION: Adding ${flightId}`);
    protectedMarkersRef.current.add(flightId);
  }, []);

  const isMarkerProtected = useCallback((flightId: string): boolean => {
    if (selectionInProgress === flightId) {
      return true;
    }
    
    if (selectedFlightId === flightId) {
      return true;
    }
    
    if (protectedMarkersRef.current.has(flightId)) {
      return true;
    }
    
    return false;
  }, [selectedFlightId, selectionInProgress]);

  const flightLookup = useMemo(() => {
    const lookup: { [key: string]: Flight } = {};
    flights.forEach(flight => {
      lookup[flight.flightId] = flight;
      lastKnownFlightDataRef.current[flight.flightId] = flight;
      markerMissCountRef.current[flight.flightId] = 0;
    });
    return lookup;
  }, [flights]);

  const currentFlightIds = useMemo(() => {
    const baseFlightIds = new Set<string>();
    
    protectedMarkersRef.current.forEach(protectedId => {
      baseFlightIds.add(protectedId);
      console.log(`🛡️ PRIORITY: Adding protected flight ${protectedId} to currentFlightIds`);
    });
    
    flights.forEach(f => baseFlightIds.add(f.flightId));
    
    console.log(`📊 currentFlightIds: ${baseFlightIds.size} total (${flights.length} from API + ${baseFlightIds.size - flights.length} protected)`);
    return baseFlightIds;
  }, [flights]);

  useEffect(() => {
    if (selectedFlightId) {
      console.log(`🛡️ Adding PERMANENT protection for selected flight: ${selectedFlightId}`);
      protectedMarkersRef.current.add(selectedFlightId);
    }
    
    if (selectionInProgress) {
      console.log(`🛡️ Adding PERMANENT protection for selection in progress: ${selectionInProgress}`);
      protectedMarkersRef.current.add(selectionInProgress);
    }
    
    const currentProtected = Array.from(protectedMarkersRef.current);
    currentProtected.forEach(protectedId => {
      if (protectedId !== selectedFlightId && protectedId !== selectionInProgress) {
        console.log(`🔓 Removing protection for unselected flight: ${protectedId}`);
        protectedMarkersRef.current.delete(protectedId);
      }
    });
  }, [selectedFlightId, selectionInProgress]);

  const isOnGround = useCallback((flight: Flight): boolean => {
    return flight.altitude < 200;
  }, []);

  // FIXED: Pink aircraft for selected state with dark shadow for all aircraft
  const createAircraftIcon = useCallback((flight: Flight, isSelected: boolean = false): L.DivIcon => {
    const onGround = isOnGround(flight);
    
    // Color logic: Pink for selected, normal colors for others
    const groundColor = '#9ca3af';
    const airborneColor = '#475569';
    const selectedColor = '#ec4899'; // Pink for selected aircraft
    
    let fillColor;
    if (isSelected) {
      fillColor = selectedColor;
    } else {
      fillColor = onGround ? groundColor : airborneColor;
    }
    
    const svgIcon = `
      <svg width="${isSelected ? '28' : '24'}" height="${isSelected ? '28' : '24'}" viewBox="0 0 512 512" style="transform: rotate(${flight.heading}deg);" class="aircraft-svg">
        <!-- Dark background shadow for ALL aircraft -->
        <path d="M256 64c-32 0-64 32-64 64v128l-128 64v32l128-32v96l-32 32v32l64-16 64 16v-32l-32-32v-96l128 32v-32l-128-64V128c0-32-32-64-64-64z" 
              fill="#000000" 
              opacity="0.3"
              transform="translate(2,2)"
              stroke="none"/>
        <!-- Main aircraft icon -->
        <path d="M256 64c-32 0-64 32-64 64v128l-128 64v32l128-32v96l-32 32v32l64-16 64 16v-32l-32-32v-96l128 32v-32l-128-64V128c0-32-32-64-64-64z" 
              fill="${fillColor}" 
              stroke="none"/>
      </svg>
    `;

    return L.divIcon({
      html: svgIcon,
      className: `aircraft-marker ${isSelected ? 'aircraft-marker-selected' : ''}`,
      iconSize: isSelected ? [28, 28] : [24, 24],
      iconAnchor: isSelected ? [14, 14] : [12, 12],
    });
  }, [isOnGround]);

  const safeRemoveMarker = useCallback((flightId: string) => {
    const marker = markersRef.current[flightId];
    if (marker && map) {
      try {
        map.removeLayer(marker);
        delete markersRef.current[flightId];
        delete markerMissCountRef.current[flightId];
        console.log(`🗑️ SAFE: Removed marker for flight ${flightId}`);
      } catch (error) {
        console.warn(`⚠️ Error removing marker for flight ${flightId}:`, error);
        delete markersRef.current[flightId];
        delete markerMissCountRef.current[flightId];
      }
    }
  }, [map]);

  const updateMarkerStyle = useCallback((marker: L.Marker, flight: Flight, isSelected: boolean) => {
    try {
      if (!marker || !flight) return;
      
      const newIcon = createAircraftIcon(flight, isSelected);
      marker.setIcon(newIcon);
    } catch (error) {
      console.warn(`⚠️ Failed to update marker style for flight ${flight?.flightId}:`, error);
    }
  }, [createAircraftIcon]);

  const createMarker = useCallback((flight: Flight): L.Marker | null => {
    try {
      if (!map || !flight) return null;
      
      const isSelected = selectedFlightId === flight.flightId || selectionInProgress === flight.flightId;
      const icon = createAircraftIcon(flight, isSelected);
      
      const marker = L.marker([flight.latitude, flight.longitude], { 
        icon,
        draggable: false,
        keyboard: false
      })
        .on('click', (e) => {
          console.log(`🎯 Aircraft clicked: ${flight.flightId} (${flight.callsign})`);
          
          addImmediateProtection(flight.flightId);
          
          L.DomEvent.stopPropagation(e);
          
          onFlightSelect(flight);
        });

      return marker;
    } catch (error) {
      console.error(`❌ Failed to create marker for flight ${flight.flightId}:`, error);
      return null;
    }
  }, [createAircraftIcon, onFlightSelect, map, selectedFlightId, selectionInProgress, addImmediateProtection]);

  useEffect(() => {
    if (!map || isUpdatingRef.current) return;

    isUpdatingRef.current = true;
    
    try {
      console.log(`🔄 Updating ${flights.length} aircraft markers`);
      
      Object.keys(markersRef.current).forEach(flightId => {
        if (isMarkerProtected(flightId)) {
          console.log(`🛡️ PROTECTED: Maintaining marker ${flightId}`);
          
          const currentFlight = flightLookup[flightId] || lastKnownFlightDataRef.current[flightId];
          if (currentFlight && markersRef.current[flightId]) {
            try {
              if (flightLookup[flightId]) {
                markersRef.current[flightId].setLatLng([currentFlight.latitude, currentFlight.longitude]);
              }
              
              const isSelected = selectedFlightId === flightId || selectionInProgress === flightId;
              updateMarkerStyle(markersRef.current[flightId], currentFlight, isSelected);
            } catch (error) {
              console.warn(`⚠️ Failed to update protected marker ${flightId}:`, error);
            }
          }
          
          markerMissCountRef.current[flightId] = 0;
          return;
        }
        
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

      flights.forEach(flight => {
        const existingMarker = markersRef.current[flight.flightId];
        
        if (existingMarker) {
          try {
            existingMarker.setLatLng([flight.latitude, flight.longitude]);
            
            const isSelected = selectedFlightId === flight.flightId || selectionInProgress === flight.flightId;
            updateMarkerStyle(existingMarker, flight, isSelected);
          } catch (error) {
            console.warn(`⚠️ Failed to update existing marker for flight ${flight.flightId}:`, error);
          }
        } else {
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
