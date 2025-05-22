
import { toast } from "sonner";
import { FlightTrackPoint } from "./types";
import { getServers, getServerIdByName } from "./serverService";
import { serverIdMap } from "./types";
import { getRouteEndpointPatterns } from "./routeEndpoints";
import { fetchFromEndpoint } from "./routeFetcher";
import { mergeRoutePoints } from "./routeParser";

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
    
    // Get all potential endpoint patterns
    const endpointPatterns = getRouteEndpointPatterns(serverId, flightId);
    
    // Arrays to store collected points
    let historicalPoints: FlightTrackPoint[] = [];
    let plannedPoints: FlightTrackPoint[] = [];
    
    // Try each endpoint pattern in sequence
    for (const endpoint of endpointPatterns) {
      const points = await fetchFromEndpoint(endpoint);
      
      if (points.length > 0) {
        // Determine if this is likely historical or planned data based on the endpoint
        if (endpoint.includes('route') || endpoint.includes('track')) {
          historicalPoints = points.length > historicalPoints.length ? points : historicalPoints;
        } else {
          plannedPoints = points.length > plannedPoints.length ? points : plannedPoints;
        }
      }
    }
    
    // After trying all endpoints, combine historical and planned points
    console.log(`Historical points: ${historicalPoints.length}, Planned points: ${plannedPoints.length}`);
    
    // Merge points from both sources
    const allPoints = mergeRoutePoints(historicalPoints, plannedPoints);
    
    // After processing, check if we have any points
    if (allPoints.length > 0) {
      console.log(`Total route points collected: ${allPoints.length}`);
      return allPoints;
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
