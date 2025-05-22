
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { FlightTrackPoint } from '@/services/flight';

interface RouteWaypointsProps {
  map: mapboxgl.Map;
  validRoutePoints: FlightTrackPoint[];
}

const RouteWaypoints: React.FC<RouteWaypointsProps> = ({ map, validRoutePoints }) => {
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  // Clear existing markers
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };
  
  useEffect(() => {
    // Clean up markers when component unmounts
    return () => {
      clearMarkers();
    };
  }, []);
  
  useEffect(() => {
    // Clear existing waypoint markers
    clearMarkers();
    
    if (!validRoutePoints || validRoutePoints.length === 0) {
      return;
    }
    
    // Only add markers for the start, end, and a few key points
    const pointsToShow = [];
    
    // Always show start point
    if (validRoutePoints.length > 0) {
      pointsToShow.push(0);
    }
    
    // Show middle point if route is long enough
    if (validRoutePoints.length > 20) {
      pointsToShow.push(Math.floor(validRoutePoints.length / 2));
    }
    
    // Always show end point if available
    if (validRoutePoints.length > 1) {
      pointsToShow.push(validRoutePoints.length - 1);
    }
    
    // Create markers only for the selected points
    pointsToShow.forEach(index => {
      const point = validRoutePoints[index];
      
      // Add popup with waypoint information
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 25,
        className: 'waypoint-popup'
      });
      
      const pointType = index === 0 ? 'Departure' : 
                        index === validRoutePoints.length - 1 ? 'Arrival' : 'Waypoint';
      
      const timestamp = new Date(point.timestamp).toLocaleTimeString();
      popup.setHTML(`
        <div class="font-medium">${pointType}</div>
        <div>Altitude: ${Math.round(point.altitude).toLocaleString()} ft</div>
        <div>Time: ${timestamp}</div>
      `);
      
      // Create marker with proper color based on point type
      const marker = new mapboxgl.Marker({
        color: index === 0 ? '#22c55e' : // Green for departure
               index === validRoutePoints.length - 1 ? '#ef4444' : // Red for arrival
               '#2271B3', // Blue for waypoints
        scale: 0.7
      })
      .setLngLat([point.longitude, point.latitude])
      .setPopup(popup)
      .addTo(map);
      
      markersRef.current.push(marker);
    });
  }, [map, validRoutePoints]);
  
  return null; // This component doesn't render anything itself
};

export default RouteWaypoints;
