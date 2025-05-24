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

  // Pre-computed filter styles for better performance
  const filterStyles = useMemo(() => ({
    onGroundNormal: 'brightness(0) saturate(0) invert(0.4) contrast(1.5) drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
    airborneNormal: 'brightness(0) saturate(0) invert(0.6) sepia(1) hue-rotate(180deg) saturate(2) drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
    onGroundSelected: 'brightness(0) saturate(0) invert(0.8) contrast(2) drop-shadow(0 0 8px rgba(255,255,255,0.8))',
    airborneSelected: 'brightness(0) saturate(0) invert(0.7) sepia(1) hue-rotate(180deg) saturate(3) drop-shadow(0 0 8px rgba(91,173,236,0.8))'
  }), []);

  // Optimized function to get aircraft filter
  const getAircraftFilter = useCallback((flight: Flight, isSelected: boolean = false): string => {
    const onGround = isOnGround(flight);
    
    if (isSelected) {
      return onGround ? filterStyles.onGroundSelected : filterStyles.airborneSelected;
    }
    
    return onGround ? filterStyles.onGroundNormal : filterStyles.airborneNormal;
  }, [isOnGround, filterStyles]);

  // Optimized marker creation function
  const createMarkerElement = useCallback((flight: Flight): HTMLDivElement => {
    const el = document.createElement('div');
    el.className = 'aircraft-marker';
    el.style.cssText = `
      width: 28px;
      height: 28px;
      background-image: url("/lovable-uploads/d61f4489-f69c-490b-a66b-6ed9139df944.png");
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      transform-origin: center center;
      cursor: pointer;
      pointer-events: auto;
      will-change: transform;
      backface-visibility: hidden;
    `;
    
    console.log(`🛩️ Creating marker for flight ${flight.flightId} with heading ${flight.heading}°`);
    
    return el;
  }, []);

  // Optimized update marker function with proper heading rotation
  const updateMarkerAppearance = useCallback((
    element: HTMLDivElement, 
    flight: Flight, 
    isSelected: boolean
  ) => {
    const filter = getAircraftFilter(flight, isSelected);
    
    // Berechne die korrekte Rotation basierend auf dem Heading
    // Das SVG zeigt standardmäßig nach oben (0°), Flugrichtung 0° ist Norden
    // Daher müssen wir um 90° korrigieren, damit die Flugzeugnase in die richtige Richtung zeigt
    const normalizedHeading = ((flight.heading % 360) + 360) % 360;
    const rotationAngle = normalizedHeading;
    const scaleValue = isSelected ? 1.2 : 1.0;
    
    // Erstelle die vollständige Transform-Eigenschaft
    const transform = `rotate(${rotationAngle}deg) scale(${scaleValue})`;
    
    console.log(`🔄 Updating aircraft ${flight.flightId}: heading=${flight.heading}°, normalized=${normalizedHeading}°, rotation=${rotationAngle}°`);
    
    // Batch DOM updates to avoid layout thrashing
    if (element.style.filter !== filter) {
      element.style.filter = filter;
    }
    if (element.style.transform !== transform) {
      element.style.transform = transform;
      console.log(`✅ Applied transform: ${transform} to flight ${flight.flightId}`);
    }
    if (isSelected) {
      element.style.zIndex = '1000';
      element.classList.add('aircraft-marker-selected');
    } else {
      element.style.zIndex = '0';
      element.classList.remove('aircraft-marker-selected');
    }
  }, [getAircraftFilter]);

  // Optimized click handler with debouncing
  const createClickHandler = useCallback((flight: Flight) => {
    return (e: MouseEvent) => {
      e.stopPropagation();
      console.log(`🎯 Flight clicked: ${flight.flightId}`);
      
      // Remove highlight from previously selected marker
      if (selectedMarkerIdRef.current && markerElementsRef.current[selectedMarkerIdRef.current]) {
        const prevElement = markerElementsRef.current[selectedMarkerIdRef.current];
        const prevFlight = flightLookup[selectedMarkerIdRef.current];
        if (prevFlight) {
          console.log(`🔄 Removing highlight from ${selectedMarkerIdRef.current}`);
          updateMarkerAppearance(prevElement, prevFlight, false);
        }
      }
      
      // Highlight selected marker
      const currentElement = markerElementsRef.current[flight.flightId];
      if (currentElement) {
        updateMarkerAppearance(currentElement, flight, true);
      }
      
      selectedMarkerIdRef.current = flight.flightId;
      console.log(`✅ Selected: ${flight.flightId}`);
      
      onFlightSelect(flight);
    };
  }, [flightLookup, updateMarkerAppearance, onFlightSelect]);

  useEffect(() => {
    console.log(`🛩️ AircraftMarker effect - ${flights.length} flights, map loaded: ${map?.loaded()}`);
    
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
      
      const existingMarkerIds = Object.keys(markersRef.current);
      
      // Remove markers for flights that no longer exist
      existingMarkerIds.forEach(flightId => {
        if (!currentFlightIds.has(flightId)) {
          console.log(`🗑️ Removing marker for departed flight ${flightId}`);
          markersRef.current[flightId].remove();
          delete markersRef.current[flightId];
          delete markerElementsRef.current[flightId];
          if (selectedMarkerIdRef.current === flightId) {
            selectedMarkerIdRef.current = null;
          }
        }
      });
      
      // Use requestAnimationFrame to batch DOM updates
      requestAnimationFrame(() => {
        let updatedCount = 0;
        let createdCount = 0;
        
        // Process flights in batches to avoid blocking the main thread
        const batchSize = 100;
        let batchIndex = 0;
        
        const processBatch = () => {
          const start = batchIndex * batchSize;
          const end = Math.min(start + batchSize, flights.length);
          
          for (let i = start; i < end; i++) {
            const flight = flights[i];
            const existingMarker = markersRef.current[flight.flightId];
            const isSelected = selectedMarkerIdRef.current === flight.flightId;
            
            if (existingMarker) {
              // Update existing marker position and appearance
              existingMarker.setLngLat([flight.longitude, flight.latitude]);
              const element = markerElementsRef.current[flight.flightId];
              if (element) {
                updateMarkerAppearance(element, flight, isSelected);
              }
              updatedCount++;
            } else {
              // Create new marker
              const element = createMarkerElement(flight);
              updateMarkerAppearance(element, flight, isSelected);
              
              const marker = new mapboxgl.Marker({
                element,
                anchor: 'center',
                draggable: false,
                rotationAlignment: 'map',
                pitchAlignment: 'map',
              });
              
              marker.setLngLat([flight.longitude, flight.latitude]);
              
              if (map && map.getCanvas()) {
                marker.addTo(map);
                markersRef.current[flight.flightId] = marker;
                markerElementsRef.current[flight.flightId] = element;
                createdCount++;
                
                // Add optimized click handler
                element.addEventListener('click', createClickHandler(flight));
              }
            }
          }
          
          batchIndex++;
          if (end < flights.length) {
            // Process next batch in next frame
            requestAnimationFrame(processBatch);
          } else {
            console.log(`✅ Markers updated - Updated: ${updatedCount}, Created: ${createdCount}, Total: ${Object.keys(markersRef.current).length}`);
          }
        };
        
        processBatch();
      });
    }
  }, [flights, map, currentFlightIds, createMarkerElement, updateMarkerAppearance, createClickHandler]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log(`🧹 Cleaning up ${Object.keys(markersRef.current).length} markers`);
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};
      markerElementsRef.current = {};
    };
  }, []);

  return null;
};

export default React.memo(AircraftMarker);
