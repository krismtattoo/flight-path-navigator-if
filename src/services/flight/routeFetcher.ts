
import { toast } from "sonner";
import { API_KEY, FlightTrackPoint } from "./types";
import { parseFlownRouteData, parseFlightPlanData } from "./routeParser";

// Fetch flown route data from specific endpoint
export const fetchFlownRouteFromEndpoint = async (endpoint: string): Promise<FlightTrackPoint[]> => {
  try {
    console.log(`Attempting to fetch flown route from endpoint: ${endpoint}`);
    console.log(`Using API Key: ${API_KEY ? 'Present' : 'Missing'}`);
    
    const response = await fetch(endpoint, {
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });
    
    console.log(`Flown route endpoint ${endpoint} returned status ${response.status}`);
    
    if (!response.ok) {
      if (response.status === 401) {
        console.error("Unauthorized - API Key may be invalid");
        toast.error("API authorization failed. Please check your API key.");
      } else if (response.status === 403) {
        console.error("Forbidden - API Key may lack permissions");
        toast.error("API access forbidden. Please check your API key permissions.");
      } else {
        console.log(`Flown route endpoint ${endpoint} returned status ${response.status}: ${response.statusText}`);
      }
      return [];
    }
    
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
  } catch (error) {
    console.error(`Error trying flown route endpoint ${endpoint}:`, error);
    toast.error("Network error while fetching flight route data.");
  }
  
  return [];
};

// Fetch flight plan data from specific endpoint
export const fetchFlightPlanFromEndpoint = async (endpoint: string): Promise<FlightTrackPoint[]> => {
  try {
    console.log(`Attempting to fetch flight plan from endpoint: ${endpoint}`);
    console.log(`Using API Key: ${API_KEY ? 'Present' : 'Missing'}`);
    
    const response = await fetch(endpoint, {
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });
    
    console.log(`Flight plan endpoint ${endpoint} returned status ${response.status}`);
    
    if (!response.ok) {
      if (response.status === 401) {
        console.error("Unauthorized - API Key may be invalid");
        toast.error("API authorization failed. Please check your API key.");
      } else if (response.status === 403) {
        console.error("Forbidden - API Key may lack permissions");
        toast.error("API access forbidden. Please check your API key permissions.");
      } else {
        console.log(`Flight plan endpoint ${endpoint} returned status ${response.status}: ${response.statusText}`);
      }
      return [];
    }
    
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
  } catch (error) {
    console.error(`Error trying flight plan endpoint ${endpoint}:`, error);
    toast.error("Network error while fetching flight plan data.");
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
