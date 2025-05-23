
import { toast } from "sonner";
import { API_KEY, FlightTrackPoint } from "./types";
import { parseRouteData } from "./routeParser";

// Fetch data from a specific endpoint
export const fetchFromEndpoint = async (endpoint: string): Promise<FlightTrackPoint[]> => {
  try {
    console.log(`Attempting to fetch from endpoint: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Accept": "application/json"
      }
    });
    
    console.log(`Endpoint ${endpoint} returned status ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`API response structure from ${endpoint}:`, {
        hasResult: !!data?.result,
        resultType: Array.isArray(data?.result) ? 'array' : typeof data?.result,
        resultLength: Array.isArray(data?.result) ? data.result.length : 'N/A',
        hasWaypoints: !!(data?.result?.waypoints),
        waypointCount: data?.result?.waypoints?.length || 0,
        hasDeparture: !!(data?.result?.departure),
        hasDestination: !!(data?.result?.destination)
      });
      
      // Check if we have valid result data
      if (data && data.result) {
        const points = parseRouteData(data);
        if (points.length > 0) {
          console.log(`Successfully parsed ${points.length} points from ${endpoint}`);
          return points;
        }
      }
    } else {
      console.log(`Endpoint ${endpoint} returned status ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Error trying endpoint ${endpoint}:`, error);
  }
  
  // Return empty array if endpoint failed
  return [];
};
