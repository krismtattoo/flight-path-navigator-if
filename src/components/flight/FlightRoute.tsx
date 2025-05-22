
import React, { useCallback, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { FlightTrackPoint, Flight } from '@/services/flight';
import { toast } from 'sonner';
import { filterValidRoutePoints, findCurrentPositionIndex, createRouteGeoJSON } from '@/utils/routeUtils';
import RouteLayerInitializer from './RouteLayerInitializer';
import RouteWaypoints from './RouteWaypoints';

interface FlightRouteProps {
  map: mapboxgl.Map;
  routePoints: FlightTrackPoint[];
  selectedFlight: Flight | null;
}

const FlightRoute: React.FC<FlightRouteProps> = ({ map, routePoints, selectedFlight }) => {
  const routeRef = useRef<mapboxgl.GeoJSONSource | null>(null);
  const validRoutePointsRef = useRef<FlightTrackPoint[]>([]);
  
  // Callback for when the route source is ready
  const handleSourceReady = useCallback((source: mapboxgl.GeoJSONSource) => {
    routeRef.current = source;
    updateRoute();
  }, []);
  
  // Update route data
  const updateRoute = useCallback(() => {
    if (!routeRef.current) {
      console.log("Route reference not ready yet");
      return;
    }
    
    if (!routePoints || routePoints.length === 0) {
      // Clear the route
      console.log("No route points, clearing route");
      routeRef.current.setData({
        type: 'FeatureCollection',
        features: []
      });
      validRoutePointsRef.current = [];
      return;
    }
    
    // Check for valid data in routePoints
    const validRoutePoints = filterValidRoutePoints(routePoints);
    validRoutePointsRef.current = validRoutePoints;
    
    if (validRoutePoints.length === 0) {
      console.log("No valid route points found, clearing route");
      routeRef.current.setData({
        type: 'FeatureCollection',
        features: []
      });
      return;
    }
    
    console.log(`Updating route with ${validRoutePoints.length} valid points`);
    
    try {
      // Find current position in route
      const currentPositionIndex = findCurrentPositionIndex(validRoutePoints, selectedFlight);
      
      // Create and update GeoJSON
      const routeGeoJSON = createRouteGeoJSON(validRoutePoints, currentPositionIndex);
      routeRef.current.setData(routeGeoJSON);
      
    } catch (error) {
      console.error("Error rendering flight route:", error);
      toast.error("Error displaying flight route. Some data may be invalid.");
      
      // Clear the route on error
      routeRef.current.setData({
        type: 'FeatureCollection',
        features: []
      });
    }
  }, [routePoints, selectedFlight]);
  
  // Update route when dependencies change
  useEffect(() => {
    updateRoute();
  }, [updateRoute]);
  
  return (
    <>
      <RouteLayerInitializer map={map} onSourceReady={handleSourceReady} />
      <RouteWaypoints 
        map={map} 
        validRoutePoints={validRoutePointsRef.current} 
      />
    </>
  );
};

export default FlightRoute;
