
import React, { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { Airport } from '@/data/airportData';

interface AllAirportMarkersProps {
  map: L.Map;
  airports: Airport[];
  onAirportSelect: (airport: Airport) => void;
}

const AllAirportMarkers: React.FC<AllAirportMarkersProps> = ({ 
  map, 
  airports, 
  onAirportSelect 
}) => {
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  const createAirportIcon = useCallback((airport: Airport): L.DivIcon => {
    // Different colors based on airport type
    const isInternational = airport.iata && airport.iata.length > 0;
    const colorClass = isInternational ? 'bg-blue-500' : 'bg-gray-500';
    
    return L.divIcon({
      html: `
        <div class="airport-info-marker flex items-center justify-center rounded-full ${colorClass} text-white font-bold shadow-lg border-2 border-white" 
             style="width: 16px; height: 16px; font-size: 8px;">
          ✈
        </div>
      `,
      className: 'airport-info-marker-container',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  }, []);

  const createAirportMarker = useCallback((airport: Airport): L.Marker | null => {
    try {
      if (!map) return null;
      
      const icon = createAirportIcon(airport);
      
      const marker = L.marker([airport.latitude, airport.longitude], { 
        icon,
        draggable: false,
        keyboard: false
      })
        .on('click', (e) => {
          console.log(`🏢 Airport info clicked: ${airport.icao} (${airport.name})`);
          L.DomEvent.stopPropagation(e);
          onAirportSelect(airport);
        })
        .bindTooltip(`${airport.icao}${airport.iata ? ` / ${airport.iata}` : ''} - ${airport.name}`, {
          permanent: false,
          direction: 'top',
          opacity: 0.9
        });

      return marker;
    } catch (error) {
      console.error(`❌ Failed to create airport info marker for ${airport.icao}:`, error);
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

    console.log(`🏢 Creating info markers for ${airports.length} airports`);

    // Create new markers for all airports
    airports.forEach(airport => {
      const marker = createAirportMarker(airport);
      if (marker) {
        try {
          marker.addTo(map);
          markersRef.current[airport.icao] = marker;
        } catch (error) {
          console.error(`❌ Failed to add airport info marker to map for ${airport.icao}:`, error);
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

export default AllAirportMarkers;
