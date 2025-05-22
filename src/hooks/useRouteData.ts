
import { useCallback, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { FlightTrackPoint, Flight } from '@/services/flight';
import { filterValidRoutePoints, findCurrentPositionIndex, createRouteGeoJSON } from '@/utils/routeUtils';
import { toast } from 'sonner';

interface UseRouteDataProps {
  routePoints: FlightTrackPoint[];
  selectedFlight: Flight | null;
}

export function useRouteData({ routePoints, selectedFlight }: UseRouteDataProps) {
  const routeRef = useRef<mapboxgl.GeoJSONSource | null>(null);
  const validRoutePointsRef = useRef<FlightTrackPoint[]>([]);
  
  // Register the route source reference
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

  return {
    validRoutePoints: validRoutePointsRef.current,
    handleSourceReady,
    updateRoute
  };
}
