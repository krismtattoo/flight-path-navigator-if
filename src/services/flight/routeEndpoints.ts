
import { BASE_URL } from "./types";

// Define all possible endpoint patterns for route data
export const getRouteEndpointPatterns = (serverId: string, flightId: string): string[] => {
  return [
    // Flight route API endpoints (historical track)
    `${BASE_URL}/flights/${serverId}/${flightId}/route`,
    `${BASE_URL}/flights/${serverId}/route/${flightId}`,
    `${BASE_URL}/flights/${serverId}/${flightId}/track`,
    `${BASE_URL}/sessions/${serverId}/flights/${flightId}/route`,
    `${BASE_URL}/sessions/${serverId}/flights/${flightId}/track`,
    // Flight plan API endpoints (planned route)
    `${BASE_URL}/flights/${serverId}/${flightId}/flightplan`,
    `${BASE_URL}/sessions/${serverId}/flights/${flightId}/flightplan`,
    `${BASE_URL}/flights/${serverId}/${flightId}/plan`,
    `${BASE_URL}/sessions/${serverId}/flights/${flightId}/plan`,
    `${BASE_URL}/flights/${serverId}/${flightId}/path`,
    `${BASE_URL}/sessions/${serverId}/flights/${flightId}/path`
  ];
};
