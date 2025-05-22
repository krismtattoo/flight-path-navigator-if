
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
          if (firstPoint.timestamp && typeof firstPoint.timestamp === 'number' && !isNaN(firstPoint.timestamp)) {
            console.log("First point timestamp:", new Date(firstPoint.timestamp).toISOString());
          } else {
            console.log("First point has invalid timestamp:", firstPoint.timestamp);
          }
          
          if (lastPoint.timestamp && typeof lastPoint.timestamp === 'number' && !isNaN(lastPoint.timestamp)) {
            console.log("Last point timestamp:", new Date(lastPoint.timestamp).toISOString());
          } else {
            console.log("Last point has invalid timestamp:", lastPoint.timestamp);
          }
        } catch (error) {
          console.error("Error processing timestamps:", error);
        }
      }
    }
  }, [routePoints, validRoutePoints, isRouteComplete]);
  
  // When a flight is selected, fit the map view to display the complete route
  useEffect(() => {
    if (map && validRoutePoints.length > 1 && selectedFlight) {
      try {
        // Create bounds that include all route points
        const bounds = new mapboxgl.LngLatBounds();
        
        // Add all points to bounds
        validRoutePoints.forEach(point => {
          bounds.extend([point.longitude, point.latitude]);
        });
        
        // Fit map to these bounds with padding
        map.fitBounds(bounds, {
          padding: { top: 100, bottom: 100, left: 100, right: 100 },
          maxZoom: 10, // Limit max zoom level
          duration: 1000
        });
        
        console.log("Map view adjusted to fit complete route");
      } catch (error) {
        console.error("Error fitting bounds:", error);
      }
    }
  }, [map, validRoutePoints, selectedFlight]);
  
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
