
import React, { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { AirportStatus } from '@/services/flight/worldService';

interface AirportMarkersProps {
  map: L.Map;
  airports: AirportStatus[];
  onAirportSelect: (airport: AirportStatus) => void;
}

const AirportMarkers: React.FC<AirportMarkersProps> = ({ 
  map, 
  airports, 
  onAirportSelect 
}) => {
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  const createAirportIcon = useCallback((airport: AirportStatus): L.DivIcon => {
    const totalFlights = airport.inboundFlightsCount + airport.outboundFlightsCount;
    const hasATC = airport.atcFacilities.length > 0;
    
    // Size based on activity
    const size = Math.min(Math.max(16, totalFlights * 2), 32);
    
    return L.divIcon({
      html: `
        <div class="airport-marker flex items-center justify-center rounded-full ${hasATC ? 'bg-green-500' : 'bg-blue-500'} text-white font-bold shadow-lg border-2 border-white" 
             style="width: ${size}px; height: ${size}px; font-size: ${Math.max(10, size / 3)}px;">
          ✈
        </div>
      `,
      className: 'airport-marker-container',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }, []);

  const createAirportMarker = useCallback((airport: AirportStatus): L.Marker | null => {
    try {
      if (!map || !airport.atcFacilities.length) return null;
      
      // Use the first ATC facility's coordinates
      const coords = airport.atcFacilities[0];
      const icon = createAirportIcon(airport);
      
      const marker = L.marker([coords.latitude, coords.longitude], { 
        icon,
        draggable: false,
        keyboard: false
      })
        .on('click', (e) => {
          console.log(`🏢 Airport clicked: ${airport.airportIcao} (${airport.airportName})`);
          L.DomEvent.stopPropagation(e);
          onAirportSelect(airport);
        });

      return marker;
    } catch (error) {
      console.error(`❌ Failed to create airport marker for ${airport.airportIcao}:`, error);
      return null;
    }
  }, [map, createAirportIcon, onAirportSelect]);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current = {};

    console.log(`🏢 Creating markers for ${airports.length} airports`);

    // Create new markers
    airports.forEach(airport => {
      const marker = createAirportMarker(airport);
      if (marker) {
        try {
          marker.addTo(map);
          markersRef.current[airport.airportIcao] = marker;
        } catch (error) {
          console.error(`❌ Failed to add airport marker to map for ${airport.airportIcao}:`, error);
        }
      }
    });

  }, [map, airports, createAirportMarker]);

  // Cleanup on unmount
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

export default AirportMarkers;
