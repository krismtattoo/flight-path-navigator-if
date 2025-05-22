
import { toast } from "sonner";
import { API_KEY, BASE_URL, FlightTrackPoint } from "./types";
import { getServers, getServerIdByName } from "./serverService";
import { serverIdMap } from "./types";

// Get flight route for a specific flight - try multiple endpoint patterns
export async function getFlightRoute(serverName: string, flightId: string): Promise<FlightTrackPoint[]> {
  try {
    // Ensure we have server IDs
    if (Object.keys(serverIdMap).length === 0) {
      console.log("No server IDs available, fetching servers first");
      await getServers();
    }
    
    // Get the actual server ID
    const serverId = getServerIdByName(serverName);
    
    if (!serverId) {
      console.error(`No ID found for server: ${serverName}`);
      toast.error(`Server information not available for ${serverName}. Try refreshing the page.`);
      return [];
    }
    
    console.log(`Fetching flight route for flight ${flightId} on server ${serverId}`);
    
    // Define all possible endpoint patterns to try
    const endpointPatterns = [
      `${BASE_URL}/flights/${serverId}/${flightId}/route`,
      `${BASE_URL}/flights/${serverId}/route/${flightId}`,
      `${BASE_URL}/flights/${serverId}/${flightId}/track`,
      `${BASE_URL}/sessions/${serverId}/flights/${flightId}/route`,
      `${BASE_URL}/sessions/${serverId}/flights/${flightId}/track`
    ];
    
    // Try each endpoint pattern in sequence
    for (const endpoint of endpointPatterns) {
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
          console.log(`Flight route API response from ${endpoint}:`, data);
          
          if (data && data.result && Array.isArray(data.result)) {
            console.log(`Found ${data.result.length} track points from ${endpoint}`);
            return data.result;
          }
        } else {
          console.log(`Endpoint ${endpoint} returned status ${response.status}`);
        }
      } catch (endpointError) {
        console.error(`Error trying endpoint ${endpoint}:`, endpointError);
        // Continue to try next endpoint
      }
    }
    
    // If we reach here, none of the endpoints worked
    console.log("All endpoints failed to retrieve flight route data");
    toast.error("Could not load flight route data. The flight may not have track data available.");
    return [];
  } catch (error) {
    console.error("Failed to fetch flight route:", error);
    toast.error("Failed to load flight route. Please try again.");
    return [];
  }
}
