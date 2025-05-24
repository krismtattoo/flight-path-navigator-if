
import { useCallback, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { FlightTrackPoint, Flight } from '@/services/flight';
import { filterValidRoutePoints, createRouteGeoJSON } from '@/utils/routeUtils';
import { toast } from 'sonner';

export function useRouteUpdater(
  flownRoute: FlightTrackPoint[], 
  flightPlan: FlightTrackPoint[], 
  selectedFlight: Flight | null
) {
  const validFlownRouteRef = useRef<FlightTrackPoint[]>([]);
  const validFlightPlanRef = useRef<FlightTrackPoint[]>([]);
  
  const updateRoute = useCallback((routeRef: React.MutableRefObject<mapboxgl.GeoJSONSource | null>) => {
    if (!routeRef.current) {
      console.log("Route reference not ready yet");
      return;
    }
    
    if ((!flownRoute || flownRoute.length === 0) && (!flightPlan || flightPlan.length === 0)) {
      // Clear the route
      console.log("No route points, clearing route");
      routeRef.current.setData({
        type: 'FeatureCollection',
        features: []
      });
      validFlownRouteRef.current = [];
      validFlightPlanRef.current = [];
      return;
    }
    
    // Process both route types
    const validFlownRoute = filterValidRoutePoints(flownRoute || []);
    const validFlightPlan = filterValidRoutePoints(flightPlan || []);
    
    validFlownRouteRef.current = validFlownRoute;
    validFlightPlanRef.current = validFlightPlan;
    
    console.log(`Updating route with flown=${validFlownRoute.length} and flight plan=${validFlightPlan.length} points`);
    
    if (validFlownRoute.length > 0) {
      console.log(`Flown route: ${validFlownRoute[0].latitude},${validFlownRoute[0].longitude} to ${validFlownRoute[validFlownRoute.length-1].latitude},${validFlownRoute[validFlownRoute.length-1].longitude}`);
    }
    
    if (validFlightPlan.length > 0) {
      console.log(`Flight plan: ${validFlightPlan[0].latitude},${validFlightPlan[0].longitude} to ${validFlightPlan[validFlightPlan.length-1].latitude},${validFlightPlan[validFlightPlan.length-1].longitude}`);
    }
    
    try {
      // Create and update GeoJSON with both route types
      const routeGeoJSON = createRouteGeoJSON(validFlownRoute, validFlightPlan);
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
  }, [flownRoute, flightPlan, selectedFlight]);

  return {
    validFlownRoute: validFlownRouteRef.current,
    validFlightPlan: validFlightPlanRef.current,
    updateRoute
  };
}
