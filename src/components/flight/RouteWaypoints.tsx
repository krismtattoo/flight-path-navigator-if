
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
    
    // As per user request, we're not creating any markers here
    // The code for creating markers has been removed
    
  }, [map, validRoutePoints]);
  
  return null; // This component doesn't render anything itself
};

export default RouteWaypoints;
