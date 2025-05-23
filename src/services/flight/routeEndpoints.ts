
import { BASE_URL } from "./types";

// Define all possible endpoint patterns for route data based on the official API documentation
export const getRouteEndpointPatterns = (serverId: string, flightId: string): string[] => {
  return [
    // Flight route API endpoints (actual flown route) - primary endpoint
    `${BASE_URL}/flights/${serverId}/${flightId}/route`,
    // Flight plan API endpoints (planned route with waypoints)
    `${BASE_URL}/flights/${serverId}/${flightId}/flightplan`
  ];
};
