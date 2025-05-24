
import { toast } from "sonner";
import { API_KEY, FlightTrackPoint } from "./types";
import { parseFlownRouteData, parseFlightPlanData } from "./routeParser";

// Fetch flown route data from specific endpoint
export const fetchFlownRouteFromEndpoint = async (endpoint: string): Promise<FlightTrackPoint[]> => {
  try {
    console.log(`Attempting to fetch flown route from endpoint: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Accept": "application/json"
      }
    });
    
    console.log(`Flown route endpoint ${endpoint} returned status ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`Flown route API response structure from ${endpoint}:`, {
        hasResult: !!data?.result,
        resultType: Array.isArray(data?.result) ? 'array' : typeof data?.result,
        resultLength: Array.isArray(data?.result) ? data.result.length : 'N/A'
      });
      
      if (data && data.result) {
        const points = parseFlownRouteData(data);
        if (points.length > 0) {
          console.log(`Successfully parsed ${points.length} flown route points from ${endpoint}`);
          return points;
        }
      }
    } else {
      console.log(`Flown route endpoint ${endpoint} returned status ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Error trying flown route endpoint ${endpoint}:`, error);
  }
  
  return [];
};

// Fetch flight plan data from specific endpoint
export const fetchFlightPlanFromEndpoint = async (endpoint: string): Promise<FlightTrackPoint[]> => {
  try {
    console.log(`Attempting to fetch flight plan from endpoint: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Accept": "application/json"
      }
    });
    
    console.log(`Flight plan endpoint ${endpoint} returned status ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`Flight plan API response structure from ${endpoint}:`, {
        hasResult: !!data?.result,
        hasWaypoints: !!(data?.result?.waypoints),
        waypointCount: data?.result?.waypoints?.length || 0,
        hasDeparture: !!(data?.result?.departure),
        hasDestination: !!(data?.result?.destination)
      });
      
      if (data && data.result) {
        const points = parseFlightPlanData(data);
        if (points.length > 0) {
          console.log(`Successfully parsed ${points.length} flight plan points from ${endpoint}`);
          return points;
        }
      }
    } else {
      console.log(`Flight plan endpoint ${endpoint} returned status ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Error trying flight plan endpoint ${endpoint}:`, error);
  }
  
  return [];
};

// Legacy function for backward compatibility
export const fetchFromEndpoint = async (endpoint: string): Promise<FlightTrackPoint[]> => {
  // Try both parsers for backward compatibility
  const flownRoute = await fetchFlownRouteFromEndpoint(endpoint);
  if (flownRoute.length > 0) {
    return flownRoute;
  }
  
  return await fetchFlightPlanFromEndpoint(endpoint);
};
