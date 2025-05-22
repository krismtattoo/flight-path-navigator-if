
import { toast } from "sonner";

// API key
const API_KEY = "r8hxd0a54uoxrgj51ag5usiba3uls8ii";
const BASE_URL = "https://api.infiniteflight.com/public/v2";

// Server types
export const SERVER_TYPES = {
  CASUAL: "Casual Server",
  TRAINING: "Training Server",
  EXPERT: "Expert Server"
};

// Types for API responses
export interface Flight {
  flightId: string;
  userId: string;
  callsign: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  heading: number;
  aircraft: string;
  livery: string;
  username: string;
  virtualOrganization?: string;
  lastReportTime: number;
  track: FlightTrackPoint[];
}

export interface FlightTrackPoint {
  latitude: number;
  longitude: number;
  altitude: number;
  timestamp: number;
}

export interface ServerInfo {
  id: string;
  name: string;
  maxUsers: number;
  userCount: number;
}

// Get all available servers
export async function getServers(): Promise<ServerInfo[]> {
  try {
    const response = await fetch(`${BASE_URL}/sessions`, {
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch servers:", error);
    toast.error("Failed to load server list. Please try again.");
    return [];
  }
}

// Get all flights for a specific server
export async function getFlights(serverId: string): Promise<Flight[]> {
  try {
    const response = await fetch(`${BASE_URL}/flights/${serverId}`, {
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch flights:", error);
    toast.error("Failed to load flights. Please try again.");
    return [];
  }
}

// Get flight route for a specific flight
export async function getFlightRoute(serverId: string, flightId: string): Promise<FlightTrackPoint[]> {
  try {
    const response = await fetch(`${BASE_URL}/flights/${serverId}/${flightId}/route`, {
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch flight route:", error);
    toast.error("Failed to load flight route. Please try again.");
    return [];
  }
}

// Get user details
export async function getUserDetails(serverId: string, userId: string) {
  try {
    const response = await fetch(`${BASE_URL}/users/${serverId}/${userId}`, {
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch user details:", error);
    toast.error("Failed to load user details. Please try again.");
    return null;
  }
}
