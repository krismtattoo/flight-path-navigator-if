
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
    
    // Only add detailed tooltips for significant waypoints to avoid cluttering
    // Pick evenly spaced points
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
  }, [map, validRoutePoints]);
  
  return null; // This component doesn't render anything itself
};

export default RouteWaypoints;
