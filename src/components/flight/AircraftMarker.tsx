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

  // Updated filter styles - alle Flugzeuge werden schwarz dargestellt
  const filterStyles = useMemo(() => ({
    onGroundNormal: 'brightness(0) saturate(0) invert(0) drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
    airborneNormal: 'brightness(0) saturate(0) invert(0) drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
    onGroundSelected: 'brightness(0) saturate(0) invert(0) drop-shadow(0 0 8px rgba(255,255,255,0.8))',
    airborneSelected: 'brightness(0) saturate(0) invert(0) drop-shadow(0 0 8px rgba(255,255,255,0.8))'
  }), []);

  // Optimized function to get aircraft filter
  const getAircraftFilter = useCallback((flight: Flight, isSelected: boolean = false): string => {
    const onGround = isOnGround(flight);
    
    if (isSelected) {
      return onGround ? filterStyles.onGroundSelected : filterStyles.airborneSelected;
    }
    
    return onGround ? filterStyles.onGroundNormal : filterStyles.airborneNormal;
  }, [isOnGround, filterStyles]);

  // Optimized marker creation function with new airplane image
  const createMarkerElement = useCallback((flight: Flight): HTMLDivElement => {
    const el = document.createElement('div');
    el.className = 'aircraft-marker';
    
    // WICHTIG: Setze alle Styles explizit und verwende !important um CSS-Konflikte zu vermeiden
    const baseStyles = [
      'width: 28px !important',
      'height: 28px !important',
      'background-image: url("/lovable-uploads/d61f4489-f69c-490b-a66b-6ed9139df944.png") !important',
      'background-size: contain !important',
      'background-repeat: no-repeat !important',
      'background-position: center !important',
      'cursor: pointer !important',
      'pointer-events: auto !important',
      'position: absolute !important',
      'transform-origin: center center !important',
      'will-change: transform !important'
    ].join('; ');
    
    el.style.cssText = baseStyles;
    
    console.log(`🛩️ Creating marker for flight ${flight.flightId} with heading ${flight.heading}°`);
    
    return el;
  }, []);

  // KORRIGIERTE Update marker function - plane.png zeigt standardmäßig nach Norden (0°)
  const updateMarkerAppearance = useCallback((
    element: HTMLDivElement, 
    flight: Flight, 
    isSelected: boolean
  ) => {
    const filter = getAircraftFilter(flight, isSelected);
    
    // Sichere Handling des Heading-Werts
    const rawHeading = flight.heading;
    const heading = typeof rawHeading === 'number' && !isNaN(rawHeading) ? rawHeading : 0;
    
    // Normalisiere Heading auf 0-360 Grad
    const normalizedHeading = ((heading % 360) + 360) % 360;
    
    // KRITISCH: plane.png zeigt standardmäßig nach Norden (0°)
    // Jedes Flugzeug MUSS individuell rotiert werden basierend auf seinem Heading
    const rotationAngle = normalizedHeading;
    const scaleValue = isSelected ? 1.2 : 1.0;
    
    console.log(`🧭 Flight ${flight.flightId}: Raw=${rawHeading}°, Normalized=${normalizedHeading}°, Rotating to=${rotationAngle}°`);
    
    // ENTSCHEIDEND: Setze Transform-Eigenschaften explizit und ohne Interferenz
    const transformValue = `rotate(${rotationAngle}deg) scale(${scaleValue})`;
    
    // Entferne alle vorherigen Transform-Werte vollständig
    element.style.removeProperty('transform');
    element.style.removeProperty('-webkit-transform');
    element.style.removeProperty('-moz-transform');
    element.style.removeProperty('-ms-transform');
    
    // Setze neue Transform-Werte mit !important
    element.style.setProperty('transform', transformValue, 'important');
    element.style.setProperty('-webkit-transform', transformValue, 'important');
    element.style.setProperty('transform-origin', 'center center', 'important');
    element.style.setProperty('filter', filter, 'important');
    
    // Debugging: Überprüfe ob Transform tatsächlich angewendet wurde
    const computedTransform = window.getComputedStyle(element).transform;
    console.log(`✅ Flight ${flight.flightId} Transform applied: ${transformValue}`);
    console.log(`🔍 Computed transform: ${computedTransform}`);
    console.log(`✈️ Direction: ${getDirectionName(normalizedHeading)}`);
    
    if (isSelected) {
      element.style.setProperty('z-index', '1000', 'important');
      element.classList.add('aircraft-marker-selected');
    } else {
      element.style.setProperty('z-index', '0', 'important');
      element.classList.remove('aircraft-marker-selected');
    }
  }, [getAircraftFilter]);

  // Hilfsfunktion um Richtungsname zu bekommen
  const getDirectionName = (heading: number): string => {
    if (heading >= 337.5 || heading < 22.5) return 'North';
    if (heading >= 22.5 && heading < 67.5) return 'Northeast';
    if (heading >= 67.5 && heading < 112.5) return 'East';
    if (heading >= 112.5 && heading < 157.5) return 'Southeast';
    if (heading >= 157.5 && heading < 202.5) return 'South';
    if (heading >= 202.5 && heading < 247.5) return 'Southwest';
    if (heading >= 247.5 && heading < 292.5) return 'West';
    if (heading >= 292.5 && heading < 337.5) return 'Northwest';
    return 'Unknown';
  };

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
