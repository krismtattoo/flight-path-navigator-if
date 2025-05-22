
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
  const { validRoutePoints, handleSourceReady, updateRoute } = useRouteData({
    routePoints,
    selectedFlight
  });
  
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
