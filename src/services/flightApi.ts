
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

// Map server names to server IDs (to be populated from getServers call)
let serverIdMap: Record<string, string> = {};

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
    
    // Map server names to IDs for easier lookup
    data.forEach((server: ServerInfo) => {
      if (server.name.includes("Casual")) {
        serverIdMap["casual"] = server.id;
      } else if (server.name.includes("Training")) {
        serverIdMap["training"] = server.id;
      } else if (server.name.includes("Expert")) {
        serverIdMap["expert"] = server.id;
      }
    });
    
    console.log("Server ID mapping:", serverIdMap);
    return data;
  } catch (error) {
    console.error("Failed to fetch servers:", error);
    toast.error("Failed to load server list. Please try again.");
    return [];
  }
}

// Get the actual server ID for a named server type
function getServerIdByName(serverName: string): string {
  return serverIdMap[serverName] || "";
}

// Get all flights for a specific server
export async function getFlights(serverName: string): Promise<Flight[]> {
  try {
    // Get the actual server ID
    const serverId = getServerIdByName(serverName);
    
    if (!serverId) {
      console.error(`No ID found for server: ${serverName}`);
      toast.error(`Server information not available for ${serverName}. Try refreshing the page.`);
      return [];
    }
    
    console.log(`Fetching flights for serverId: ${serverId}`);
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
    console.log(`Found ${data.length} flights`);
    return data;
  } catch (error) {
    console.error("Failed to fetch flights:", error);
    toast.error("Failed to load flights. Please try again.");
    return [];
  }
}

// Get flight route for a specific flight
export async function getFlightRoute(serverName: string, flightId: string): Promise<FlightTrackPoint[]> {
  try {
    // Get the actual server ID
    const serverId = getServerIdByName(serverName);
    
    if (!serverId) {
      console.error(`No ID found for server: ${serverName}`);
      toast.error(`Server information not available for ${serverName}. Try refreshing the page.`);
      return [];
    }
    
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
export async function getUserDetails(serverName: string, userId: string) {
  try {
    // Get the actual server ID
    const serverId = getServerIdByName(serverName);
    
    if (!serverId) {
      console.error(`No ID found for server: ${serverName}`);
      toast.error(`Server information not available for ${serverName}. Try refreshing the page.`);
      return null;
    }
    
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
