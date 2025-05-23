
import { BASE_URL } from "./types";

// Define all possible endpoint patterns for route data based on the official API documentation
export const getRouteEndpointPatterns = (serverId: string, flightId: string): string[] => {
  return [
    // Flight route API endpoints (actual flown route) - try multiple variations
    `${BASE_URL}/flights/${serverId}/${flightId}/route`,
    `${BASE_URL}/sessions/${serverId}/flights/${flightId}/route`,
    
    // Flight plan API endpoints (planned route with waypoints) - try multiple variations
    `${BASE_URL}/flights/${serverId}/${flightId}/flightplan`,
    `${BASE_URL}/sessions/${serverId}/flights/${flightId}/flightplan`,
    
    // Additional endpoint patterns that might exist
    `${BASE_URL}/flights/${serverId}/${flightId}/track`,
    `${BASE_URL}/sessions/${serverId}/flights/${flightId}/track`
  ];
};
