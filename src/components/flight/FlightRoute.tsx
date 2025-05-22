
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
  
  // Debug route information with more detail
  useEffect(() => {
    if (routePoints.length > 0) {
      console.log(`Route has ${routePoints.length} total points, ${validRoutePoints.length} valid points`);
      console.log(`Route complete: ${isRouteComplete}`);
      
      // More detailed debugging
      if (routePoints.length >= 2) {
        const firstPoint = routePoints[0];
        const lastPoint = routePoints[routePoints.length - 1];
        console.log("Route start:", firstPoint.latitude, firstPoint.longitude);
        console.log("Route end:", lastPoint.latitude, lastPoint.longitude);
        
        // Show timestamps to see if they're chronological - with validation to prevent Invalid Date error
        try {
          if (firstPoint.timestamp && !isNaN(firstPoint.timestamp)) {
            console.log("First point timestamp:", new Date(firstPoint.timestamp).toISOString());
          } else {
            console.log("First point has invalid timestamp:", firstPoint.timestamp);
          }
          
          if (lastPoint.timestamp && !isNaN(lastPoint.timestamp)) {
            console.log("Last point timestamp:", new Date(lastPoint.timestamp).toISOString());
          } else {
            console.log("Last point has invalid timestamp:", lastPoint.timestamp);
          }
        } catch (error) {
          console.error("Error processing timestamps:", error);
        }
        
        // Log some middle points to check the data quality
        if (routePoints.length > 10) {
          console.log("Some middle points:");
          console.log("25% point:", routePoints[Math.floor(routePoints.length * 0.25)]);
          console.log("50% point:", routePoints[Math.floor(routePoints.length * 0.5)]);
          console.log("75% point:", routePoints[Math.floor(routePoints.length * 0.75)]);
        }
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
