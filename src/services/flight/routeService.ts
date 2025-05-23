
import { toast } from "sonner";
import { FlightTrackPoint } from "./types";
import { getServers, getServerIdByName } from "./serverService";
import { serverIdMap } from "./types";
import { getRouteEndpointPatterns } from "./routeEndpoints";
import { fetchFromEndpoint } from "./routeFetcher";
import { mergeRoutePoints } from "./routeParser";

// Get flight route for a specific flight - try all available API endpoints
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
    
    // Get all available endpoint patterns
    const endpointPatterns = getRouteEndpointPatterns(serverId, flightId);
    
    let actualRoutePoints: FlightTrackPoint[] = [];
    let flightPlanPoints: FlightTrackPoint[] = [];
    
    // Try each endpoint pattern until we find data
    for (let i = 0; i < endpointPatterns.length; i++) {
      const endpoint = endpointPatterns[i];
      console.log(`Trying endpoint ${i + 1}/${endpointPatterns.length}: ${endpoint}`);
      
      const points = await fetchFromEndpoint(endpoint);
      
      if (points.length > 0) {
        console.log(`Found ${points.length} points from endpoint: ${endpoint}`);
        
        // Categorize the data based on endpoint type
        if (endpoint.includes('/route') || endpoint.includes('/track')) {
          actualRoutePoints = points;
        } else if (endpoint.includes('/flightplan')) {
          flightPlanPoints = points;
        }
        
        // If we found route data, continue looking for flight plan data
        // If we found flight plan data and don't have route data yet, continue
        if (actualRoutePoints.length > 0 && flightPlanPoints.length > 0) {
          break; // We have both types of data
        }
      }
    }
    
    console.log(`Route points: ${actualRoutePoints.length}, Flight plan points: ${flightPlanPoints.length}`);
    
    // Merge the data - prioritize actual route if available
    const allPoints = mergeRoutePoints(actualRoutePoints, flightPlanPoints);
    
    if (allPoints.length > 0) {
      console.log(`Total route points collected: ${allPoints.length}`);
      return allPoints;
    }
    
    // If no data is available from any endpoint
    console.log("No route or flight plan data available for this flight from any API endpoint");
    toast.error("No route data available for this flight. The pilot may not have filed a flight plan, or the flight data is not yet available.");
    return [];
  } catch (error) {
    console.error("Failed to fetch flight route:", error);
    toast.error("Failed to load flight route. Please try again.");
    return [];
  }
}
