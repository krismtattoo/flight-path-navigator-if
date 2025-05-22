
import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { FlightTrackPoint, Flight } from '@/services/flight';
import RouteLayerInitializer from './RouteLayerInitializer';
import RouteWaypoints from './RouteWaypoints';
import { useRouteData } from '@/hooks/useRouteData';

interface FlightRouteProps {
  map: mapboxgl.Map;
  routePoints: FlightTrackPoint[];
  selectedFlight: Flight | null;
}

const FlightRoute: React.FC<FlightRouteProps> = ({ map, routePoints, selectedFlight }) => {
  // Use the custom hook to manage route data
  const { validRoutePoints, isRouteComplete, handleSourceReady, updateRoute } = useRouteData({
    routePoints,
    selectedFlight
  });
  
  // Debug route information
  useEffect(() => {
    if (routePoints.length > 0) {
      console.log(`Route has ${routePoints.length} total points, ${validRoutePoints.length} valid points`);
      console.log(`Route complete: ${isRouteComplete}`);
      
      if (routePoints.length >= 2) {
        const firstPoint = routePoints[0];
        const lastPoint = routePoints[routePoints.length - 1];
        console.log("Route start:", firstPoint.latitude, firstPoint.longitude);
        console.log("Route end:", lastPoint.latitude, lastPoint.longitude);
      }
    }
  }, [routePoints, validRoutePoints, isRouteComplete]);
  
  // Update route when dependencies change
  useEffect(() => {
    updateRoute();
  }, [updateRoute]);
  
  return (
    <>
      <RouteLayerInitializer map={map} onSourceReady={handleSourceReady} />
      <RouteWaypoints 
        map={map} 
        validRoutePoints={validRoutePoints} 
      />
    </>
  );
};

export default FlightRoute;
