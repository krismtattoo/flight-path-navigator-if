
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
    
    if (response.ok) {
      const data = await response.json();
      console.log(`API response from ${endpoint}:`, data);
      
      // Check if we have valid result data
      if (data && data.result) {
        return parseRouteData(data);
      }
    } else {
      console.log(`Endpoint ${endpoint} returned status ${response.status}`);
    }
  } catch (error) {
    console.error(`Error trying endpoint ${endpoint}:`, error);
  }
  
  // Return empty array if endpoint failed
  return [];
};
