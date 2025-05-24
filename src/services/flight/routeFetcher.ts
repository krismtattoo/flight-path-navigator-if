
import { toast } from "sonner";
import { API_KEY, FlightTrackPoint } from "./types";
import { parseFlownRouteData, parseFlightPlanData } from "./routeParser";

// Fetch flown route data from specific endpoint
export const fetchFlownRouteFromEndpoint = async (endpoint: string): Promise<FlightTrackPoint[]> => {
  try {
    console.log(`Attempting to fetch flown route from endpoint: ${endpoint}`);
    console.log(`Using API Key: ${API_KEY ? 'Present' : 'Missing'}`);
    
    const response = await fetch(endpoint, {
      method: 'GET',
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
      } else if (response.status === 404) {
        console.log(`Flown route not found for endpoint: ${endpoint}`);
        return [];
      } else {
        const errorText = await response.text();
        console.log(`Flown route endpoint ${endpoint} returned status ${response.status}: ${response.statusText}`, errorText);
      }
      return [];
    }
    
    const data = await response.json();
    console.log(`Flown route API response from ${endpoint}:`, data);
    
    const points = parseFlownRouteData(data);
    if (points.length > 0) {
      console.log(`Successfully parsed ${points.length} flown route points from ${endpoint}`);
      return points;
    } else {
      console.log(`No valid flown route points found in response from ${endpoint}`);
    }
  } catch (error) {
    console.error(`Error trying flown route endpoint ${endpoint}:`, error);
    // Don't show toast for network errors to avoid spam
  }
  
  return [];
};

// Fetch flight plan data from specific endpoint
export const fetchFlightPlanFromEndpoint = async (endpoint: string): Promise<FlightTrackPoint[]> => {
  try {
    console.log(`Attempting to fetch flight plan from endpoint: ${endpoint}`);
    console.log(`Using API Key: ${API_KEY ? 'Present' : 'Missing'}`);
    
    const response = await fetch(endpoint, {
      method: 'GET',
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
      } else if (response.status === 404) {
        console.log(`Flight plan not found for endpoint: ${endpoint}`);
        return [];
      } else {
        const errorText = await response.text();
        console.log(`Flight plan endpoint ${endpoint} returned status ${response.status}: ${response.statusText}`, errorText);
      }
      return [];
    }
    
    const data = await response.json();
    console.log(`Flight plan API response from ${endpoint}:`, data);
    
    const points = parseFlightPlanData(data);
    if (points.length > 0) {
      console.log(`Successfully parsed ${points.length} flight plan points from ${endpoint}`);
      return points;
    } else {
      console.log(`No valid flight plan data found in response from ${endpoint}`);
    }
  } catch (error) {
    console.error(`Error trying flight plan endpoint ${endpoint}:`, error);
    // Don't show toast for network errors to avoid spam
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
