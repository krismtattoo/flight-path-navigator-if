
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { FlightTrackPoint, Flight } from '@/services/flightApi';

interface FlightRouteProps {
  map: mapboxgl.Map;
  routePoints: FlightTrackPoint[];
  selectedFlight: Flight | null;
}

const FlightRoute: React.FC<FlightRouteProps> = ({ map, routePoints, selectedFlight }) => {
  const routeRef = useRef<mapboxgl.GeoJSONSource | null>(null);
  
  // Initialize route source and layers when component mounts
  useEffect(() => {
    if (!map) return;
    
    map.on('load', () => {
      // Check if source already exists to prevent duplicate sources
      if (!map.getSource('route')) {
        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: []
            }
          }
        });
        
        map.addLayer({
          id: 'route-traveled',
          type: 'line',
          source: 'route',
          filter: ['==', 'type', 'traveled'],
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#2271B3',
            'line-width': 4,
            'line-opacity': 0.8
          }
        });

        map.addLayer({
          id: 'route-remaining',
          type: 'line',
          source: 'route',
          filter: ['==', 'type', 'remaining'],
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#5DADEC',
            'line-width': 4,
            'line-opacity': 0.6,
            'line-dasharray': [0, 2, 2]
          }
        });
      }
      
      routeRef.current = map.getSource('route') as mapboxgl.GeoJSONSource;
      updateRoute();
    });

    // If map is already loaded, get the source
    if (map.loaded() && map.getSource('route')) {
      routeRef.current = map.getSource('route') as mapboxgl.GeoJSONSource;
      updateRoute();
    }
  }, [map]);
  
  // Update route when routePoints or selectedFlight changes
  useEffect(() => {
    updateRoute();
  }, [routePoints, selectedFlight]);
  
  const updateRoute = () => {
    if (!routeRef.current) {
      console.log("Route reference not ready yet");
      return;
    }
    
    if (routePoints.length === 0) {
      // Clear the route
      console.log("No route points, clearing route");
      routeRef.current.setData({
        type: 'FeatureCollection',
        features: []
      });
      return;
    }
    
    console.log(`Updating route with ${routePoints.length} points`);
    
    // Find current position in route
    let currentPositionIndex = 0;
    if (selectedFlight) {
      // Find the closest point to current position
      const currentPos = {
        lat: selectedFlight.latitude,
        lng: selectedFlight.longitude
      };
      
      let minDist = Number.MAX_VALUE;
      routePoints.forEach((point, idx) => {
        const dist = Math.sqrt(
          Math.pow(point.latitude - currentPos.lat, 2) + 
          Math.pow(point.longitude - currentPos.lng, 2)
        );
        if (dist < minDist) {
          minDist = dist;
          currentPositionIndex = idx;
        }
      });
    }
    
    // Create GeoJSON for traveled and remaining route
    const traveledCoords = routePoints
      .slice(0, currentPositionIndex + 1)
      .map(p => [p.longitude, p.latitude]);
    
    const remainingCoords = routePoints
      .slice(currentPositionIndex)
      .map(p => [p.longitude, p.latitude]);
    
    console.log(`Route split: ${traveledCoords.length} traveled points, ${remainingCoords.length} remaining points`);
    
    // Update the route source
    routeRef.current.setData({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            type: 'traveled'
          },
          geometry: {
            type: 'LineString',
            coordinates: traveledCoords
          }
        },
        {
          type: 'Feature',
          properties: {
            type: 'remaining'
          },
          geometry: {
            type: 'LineString',
            coordinates: remainingCoords
          }
        }
      ]
    });
  };
  
  return null; // This component doesn't render anything itself
};

export default FlightRoute;
