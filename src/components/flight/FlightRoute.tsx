
import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { FlightTrackPoint, Flight } from '@/services/flight';
import RouteLayerInitializer from './RouteLayerInitializer';
import RouteWaypoints from './RouteWaypoints';
import { useRouteData } from '@/hooks/useRouteData';

interface FlightRouteProps {
  map: mapboxgl.Map;
  flownRoute: FlightTrackPoint[];
  flightPlan: FlightTrackPoint[];
  selectedFlight: Flight | null;
}

const FlightRoute: React.FC<FlightRouteProps> = ({ map, flownRoute, flightPlan, selectedFlight }) => {
  // Use the custom hook to manage route data
  const { validFlownRoute, validFlightPlan, isRouteComplete, handleSourceReady, updateRoute } = useRouteData({
    flownRoute,
    flightPlan,
    selectedFlight
  });
  
  // Debug route information with more detail
  useEffect(() => {
    if (flownRoute.length > 0 || flightPlan.length > 0) {
      console.log(`Route has ${flownRoute.length} flown points, ${flightPlan.length} flight plan points`);
      console.log(`Valid: ${validFlownRoute.length} flown, ${validFlightPlan.length} flight plan`);
      console.log(`Route complete: ${isRouteComplete}`);
    }
  }, [flownRoute, flightPlan, validFlownRoute, validFlightPlan, isRouteComplete]);
  
  // When a flight is selected, fit the map view to display the complete route
  useEffect(() => {
    if (map && (validFlownRoute.length > 1 || validFlightPlan.length > 1) && selectedFlight) {
      try {
        // Create bounds that include all route points
        const bounds = new mapboxgl.LngLatBounds();
        
        // Add all points to bounds
        [...validFlownRoute, ...validFlightPlan].forEach(point => {
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
  }, [map, validFlownRoute, validFlightPlan, selectedFlight]);
  
  // Update route when dependencies change
  useEffect(() => {
    updateRoute();
  }, [updateRoute]);
  
  return (
    <>
      <RouteLayerInitializer map={map} onSourceReady={handleSourceReady} />
      <RouteWaypoints 
        map={map} 
        validRoutePoints={[...validFlownRoute, ...validFlightPlan]} 
      />
    </>
  );
};

export default FlightRoute;
