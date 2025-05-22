
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { FlightTrackPoint, Flight } from '@/services/flightApi';
import { toast } from 'sonner';

interface FlightRouteProps {
  map: mapboxgl.Map;
  routePoints: FlightTrackPoint[];
  selectedFlight: Flight | null;
}

const FlightRoute: React.FC<FlightRouteProps> = ({ map, routePoints, selectedFlight }) => {
  const routeRef = useRef<mapboxgl.GeoJSONSource | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
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
        
        // Add waypoints layer
        map.addLayer({
          id: 'waypoints',
          type: 'circle',
          source: 'route',
          filter: ['==', 'type', 'waypoint'],
          paint: {
            'circle-radius': 4,
            'circle-color': '#2271B3',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
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
    
    // Clean up markers when component unmounts
    return () => {
      clearMarkers();
    };
  }, [map]);
  
  // Update route when routePoints or selectedFlight changes
  useEffect(() => {
    updateRoute();
  }, [routePoints, selectedFlight]);
  
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };
  
  const updateRoute = () => {
    if (!routeRef.current) {
      console.log("Route reference not ready yet");
      return;
    }
    
    // Clear existing waypoint markers
    clearMarkers();
    
    if (!routePoints || routePoints.length === 0) {
      // Clear the route
      console.log("No route points, clearing route");
      routeRef.current.setData({
        type: 'FeatureCollection',
        features: []
      });
      return;
    }
    
    // Check for valid data in routePoints
    const validRoutePoints = routePoints.filter(point => 
      typeof point.latitude === 'number' && 
      typeof point.longitude === 'number' && 
      !isNaN(point.latitude) && 
      !isNaN(point.longitude)
    );
    
    if (validRoutePoints.length === 0) {
      console.log("No valid route points found, clearing route");
      routeRef.current.setData({
        type: 'FeatureCollection',
        features: []
      });
      return;
    }
    
    console.log(`Updating route with ${validRoutePoints.length} valid points`);
    
    // Find current position in route
    let currentPositionIndex = 0;
    if (selectedFlight) {
      // Find the closest point to current position
      const currentPos = {
        lat: selectedFlight.latitude,
        lng: selectedFlight.longitude
      };
      
      let minDist = Number.MAX_VALUE;
      validRoutePoints.forEach((point, idx) => {
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
    
    try {
      // Create GeoJSON for traveled and remaining route
      const traveledCoords = validRoutePoints
        .slice(0, currentPositionIndex + 1)
        .map(p => [p.longitude, p.latitude]);
      
      const remainingCoords = validRoutePoints
        .slice(currentPositionIndex)
        .map(p => [p.longitude, p.latitude]);
      
      console.log(`Route split: ${traveledCoords.length} traveled points, ${remainingCoords.length} remaining points`);
      
      // Create waypoints features
      const waypointFeatures = validRoutePoints.map((point, index) => ({
        type: 'Feature' as const,
        properties: {
          type: 'waypoint',
          index: index,
          altitude: point.altitude,
          timestamp: point.timestamp
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [point.longitude, point.latitude]
        }
      }));
      
      // Update the route source with lines and waypoints
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
          },
          ...waypointFeatures
        ]
      });
      
      // Only add detailed tooltips for significant waypoints to avoid cluttering
      // For now, pick evenly spaced points
      const maxTooltips = 10;
      const step = Math.max(1, Math.floor(validRoutePoints.length / maxTooltips));
      
      for (let i = 0; i < validRoutePoints.length; i += step) {
        const point = validRoutePoints[i];
        
        // Add popup with waypoint information
        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 25,
          className: 'waypoint-popup'
        });
        
        const timestamp = new Date(point.timestamp).toLocaleTimeString();
        popup.setHTML(`
          <div class="font-medium">Waypoint ${i+1}/${validRoutePoints.length}</div>
          <div>Altitude: ${Math.round(point.altitude).toLocaleString()} ft</div>
          <div>Time: ${timestamp}</div>
        `);
        
        // Create a transparent marker to hold the popup
        const marker = new mapboxgl.Marker({
          color: 'rgba(0,0,0,0)',
          scale: 0.5
        })
        .setLngLat([point.longitude, point.latitude])
        .setPopup(popup)
        .addTo(map);
        
        markersRef.current.push(marker);
      }
    } catch (error) {
      console.error("Error rendering flight route:", error);
      toast.error("Error displaying flight route. Some data may be invalid.");
      
      // Clear the route on error
      routeRef.current.setData({
        type: 'FeatureCollection',
        features: []
      });
    }
  };
  
  return null; // This component doesn't render anything itself
};

export default FlightRoute;
