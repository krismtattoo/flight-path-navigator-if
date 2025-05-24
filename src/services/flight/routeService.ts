
import { toast } from "sonner";
import { FlightTrackPoint } from "./types";
import { getServers, getServerIdByName } from "./serverService";
import { serverIdMap } from "./types";
import { getRouteEndpointPatterns } from "./routeEndpoints";
import { fetchFlownRouteFromEndpoint, fetchFlightPlanFromEndpoint } from "./routeFetcher";

// Get flight route for a specific flight - fetch both flown route and flight plan separately
export async function getFlightRoute(serverName: string, flightId: string): Promise<{
  flownRoute: FlightTrackPoint[],
  flightPlan: FlightTrackPoint[]
}> {
  try {
    // Ensure we have server IDs
    if (Object.keys(serverIdMap).length === 0) {
      console.log("No server IDs available, fetching servers first");
      await getServers();
    }
    
    // Get the actual server ID (this is actually the sessionId)
    const sessionId = getServerIdByName(serverName);
    
    if (!sessionId) {
      console.error(`No ID found for server: ${serverName}`);
      toast.error(`Server information not available for ${serverName}. Try refreshing the page.`);
      return { flownRoute: [], flightPlan: [] };
    }
    
    console.log(`Fetching flight route for flight ${flightId} on session ${sessionId}`);
    
    // Get endpoint patterns for both route types
    const endpointPatterns = getRouteEndpointPatterns(sessionId, flightId);
    
    let flownRoutePoints: FlightTrackPoint[] = [];
    let flightPlanPoints: FlightTrackPoint[] = [];
    
    // Try to fetch flown route (bunte Linie)
    console.log("Fetching flown route data...");
    for (const endpoint of endpointPatterns.flownRoute) {
      console.log(`Trying flown route endpoint: ${endpoint}`);
      const points = await fetchFlownRouteFromEndpoint(endpoint);
      
      if (points.length > 0) {
        console.log(`Found ${points.length} flown route points from endpoint: ${endpoint}`);
        flownRoutePoints = points;
        break; // Use first successful endpoint
      }
    }
    
    // Try to fetch flight plan (weiße Linie)
    console.log("Fetching flight plan data...");
    for (const endpoint of endpointPatterns.flightPlan) {
      console.log(`Trying flight plan endpoint: ${endpoint}`);
      const points = await fetchFlightPlanFromEndpoint(endpoint);
      
      if (points.length > 0) {
        console.log(`Found ${points.length} flight plan points from endpoint: ${endpoint}`);
        flightPlanPoints = points;
        break; // Use first successful endpoint
      }
    }
    
    console.log(`Final result - Flown route points: ${flownRoutePoints.length}, Flight plan points: ${flightPlanPoints.length}`);
    
    if (flownRoutePoints.length === 0 && flightPlanPoints.length === 0) {
      console.log("No route or flight plan data available for this flight from any API endpoint");
      toast.error("No route data available for this flight. The pilot may not have filed a flight plan, or the flight data is not yet available.");
    } else {
      const routeInfo = [];
      if (flownRoutePoints.length > 0) routeInfo.push(`${flownRoutePoints.length} flown route points`);
      if (flightPlanPoints.length > 0) routeInfo.push(`${flightPlanPoints.length} flight plan points`);
      console.log(`Successfully loaded: ${routeInfo.join(', ')}`);
    }
    
    return {
      flownRoute: flownRoutePoints,
      flightPlan: flightPlanPoints
    };
  } catch (error) {
    console.error("Failed to fetch flight route:", error);
    toast.error("Failed to load flight route. Please try again.");
    return { flownRoute: [], flightPlan: [] };
  }
}
