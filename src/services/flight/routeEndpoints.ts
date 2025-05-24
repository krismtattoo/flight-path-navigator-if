
import { BASE_URL } from "./types";

// Define specific endpoint patterns based on official Infinite Flight Live API documentation
export const getRouteEndpointPatterns = (sessionId: string, flightId: string): {
  flownRoute: string[];
  flightPlan: string[];
} => {
  return {
    // Flight route API endpoints (actual flown route) - bunte Linie
    flownRoute: [
      `${BASE_URL}/sessions/${sessionId}/flights/${flightId}/route`
    ],
    
    // Flight plan API endpoints (planned route with waypoints) - weiße Linie
    flightPlan: [
      `${BASE_URL}/sessions/${sessionId}/flights/${flightId}/flightplan`
    ]
  };
};
