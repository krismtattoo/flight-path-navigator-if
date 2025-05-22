
import { useCallback, useRef, useState, useEffect } from 'react';
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
  const [isRouteComplete, setIsRouteComplete] = useState(false);
  
  // Register the route source reference
  const handleSourceReady = useCallback((source: mapboxgl.GeoJSONSource) => {
    routeRef.current = source;
    updateRoute();
  }, []);
  
  // Effect to check if route is complete (has start and end points)
  useEffect(() => {
    if (routePoints && routePoints.length > 0) {
      const firstPoint = routePoints[0];
      const lastPoint = routePoints[routePoints.length - 1];
      
      // Check if we have distinct start and end points
      if (firstPoint && lastPoint && 
          (firstPoint.latitude !== lastPoint.latitude || 
           firstPoint.longitude !== lastPoint.longitude)) {
        setIsRouteComplete(true);
      } else {
        setIsRouteComplete(false);
      }
    } else {
      setIsRouteComplete(false);
    }
  }, [routePoints]);
  
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
    console.log(`First point: ${validRoutePoints[0].latitude},${validRoutePoints[0].longitude}`);
    console.log(`Last point: ${validRoutePoints[validRoutePoints.length-1].latitude},${validRoutePoints[validRoutePoints.length-1].longitude}`);
    
    try {
      // Find current position in route
      const currentPositionIndex = findCurrentPositionIndex(validRoutePoints, selectedFlight);
      console.log("Current position index:", currentPositionIndex, "of", validRoutePoints.length);
      
      // Create and update GeoJSON - we'll use the actual position index now
      const routeGeoJSON = createRouteGeoJSON(validRoutePoints, currentPositionIndex);
      console.log("Route GeoJSON features count:", routeGeoJSON.features.length);
      
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
    isRouteComplete,
    handleSourceReady,
    updateRoute
  };
}
