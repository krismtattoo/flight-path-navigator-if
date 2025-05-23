
import { toast } from "sonner";
import { FlightTrackPoint } from "./types";
import { getServers, getServerIdByName } from "./serverService";
import { serverIdMap } from "./types";
import { getRouteEndpointPatterns } from "./routeEndpoints";
import { fetchFromEndpoint } from "./routeFetcher";
import { mergeRoutePoints } from "./routeParser";

// Get flight route for a specific flight - try the official API endpoints
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
    
    // Get the official endpoint patterns
    const endpointPatterns = getRouteEndpointPatterns(serverId, flightId);
    
    let actualRoutePoints: FlightTrackPoint[] = [];
    let flightPlanPoints: FlightTrackPoint[] = [];
    
    // Try route endpoint first (actual flown route)
    const routeEndpoint = endpointPatterns[0];
    console.log(`Trying route endpoint: ${routeEndpoint}`);
    actualRoutePoints = await fetchFromEndpoint(routeEndpoint);
    
    // Try flight plan endpoint (planned route)
    const flightPlanEndpoint = endpointPatterns[1];
    console.log(`Trying flight plan endpoint: ${flightPlanEndpoint}`);
    flightPlanPoints = await fetchFromEndpoint(flightPlanEndpoint);
    
    console.log(`Route points: ${actualRoutePoints.length}, Flight plan points: ${flightPlanPoints.length}`);
    
    // Merge the data - prioritize actual route if available
    const allPoints = mergeRoutePoints(actualRoutePoints, flightPlanPoints);
    
    if (allPoints.length > 0) {
      console.log(`Total route points collected: ${allPoints.length}`);
      return allPoints;
    }
    
    // If no data is available
    console.log("No route or flight plan data available for this flight");
    toast.error("No route data available for this flight. The flight may not have filed a flight plan or track data may be unavailable.");
    return [];
  } catch (error) {
    console.error("Failed to fetch flight route:", error);
    toast.error("Failed to load flight route. Please try again.");
    return [];
  }
}
