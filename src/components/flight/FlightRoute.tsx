
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
  
  // Remove the automatic map fitting to preserve tracking mode
  // The route will be visible but won't interfere with aircraft tracking
  
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
