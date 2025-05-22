
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
    console.log("Available servers:", data);
    
    if (data && data.result && Array.isArray(data.result)) {
      // Server data is in the result field
      const servers = data.result;
      console.log("Processing servers:", servers);
      
      // Map server names to IDs for easier lookup
      serverIdMap = {}; // Reset the map
      
      servers.forEach((server: any) => {
        if (server.name && server.id) {
          // Direct mapping from full name to ID
          if (server.name.includes("Casual")) {
            serverIdMap["casual"] = server.id;
            serverIdMap[SERVER_TYPES.CASUAL.toLowerCase()] = server.id;
          } else if (server.name.includes("Training")) {
            serverIdMap["training"] = server.id;
            serverIdMap[SERVER_TYPES.TRAINING.toLowerCase()] = server.id;
          } else if (server.name.includes("Expert")) {
            serverIdMap["expert"] = server.id;
            serverIdMap[SERVER_TYPES.EXPERT.toLowerCase()] = server.id;
          }
        }
      });
      
      console.log("Server ID mapping:", serverIdMap);
      return servers;
    }
    
    return [];
  } catch (error) {
    console.error("Failed to fetch servers:", error);
    toast.error("Failed to load server list. Please try again.");
    return [];
  }
}

// Get the actual server ID for a named server type
function getServerIdByName(serverName: string): string {
  // Try first with the exact name
  const serverId = serverIdMap[serverName.toLowerCase()];
  
  if (!serverId) {
    // If not found, try alternative matches
    if (serverName.toLowerCase().includes("casual")) {
      return serverIdMap["casual"] || "";
    } else if (serverName.toLowerCase().includes("training")) {
      return serverIdMap["training"] || "";
    } else if (serverName.toLowerCase().includes("expert")) {
      return serverIdMap["expert"] || "";
    }
    
    console.error(`No ID found for server: ${serverName}. Current mapping:`, serverIdMap);
    return "";
  }
  
  return serverId;
}

// Get all flights for a specific server
export async function getFlights(serverName: string): Promise<Flight[]> {
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
    if (data && data.result && Array.isArray(data.result)) {
      console.log(`Found ${data.result.length} flights`);
      return data.result;
    }
    
    return [];
  } catch (error) {
    console.error("Failed to fetch flights:", error);
    toast.error("Failed to load flights. Please try again.");
    return [];
  }
}

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
    
    // Define all possible endpoint patterns to try
    const endpointPatterns = [
      `${BASE_URL}/flights/${serverId}/${flightId}/route`,
      `${BASE_URL}/flights/${serverId}/route/${flightId}`,
      `${BASE_URL}/flights/${serverId}/${flightId}/track`,
      `${BASE_URL}/sessions/${serverId}/flights/${flightId}/route`,
      `${BASE_URL}/sessions/${serverId}/flights/${flightId}/track`
    ];
    
    // Try each endpoint pattern in sequence
    for (const endpoint of endpointPatterns) {
      try {
        console.log(`Attempting to fetch from endpoint: ${endpoint}`);
        const response = await fetch(endpoint, {
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Accept": "application/json"
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Flight route API response from ${endpoint}:`, data);
          
          if (data && data.result && Array.isArray(data.result)) {
            console.log(`Found ${data.result.length} track points from ${endpoint}`);
            return data.result;
          }
        } else {
          console.log(`Endpoint ${endpoint} returned status ${response.status}`);
        }
      } catch (endpointError) {
        console.error(`Error trying endpoint ${endpoint}:`, endpointError);
        // Continue to try next endpoint
      }
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

// Get user details
export async function getUserDetails(serverName: string, userId: string) {
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
      return null;
    }
    
    // Try multiple endpoint patterns for user details too
    const userEndpoints = [
      `${BASE_URL}/users/${serverId}/${userId}`,
      `${BASE_URL}/sessions/${serverId}/users/${userId}`
    ];
    
    for (const endpoint of userEndpoints) {
      try {
        console.log(`Attempting to fetch user details from: ${endpoint}`);
        const response = await fetch(endpoint, {
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Accept": "application/json"
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.result) {
            console.log("User details retrieved successfully");
            return data.result;
          }
        } else {
          console.log(`User endpoint ${endpoint} returned status ${response.status}`);
        }
      } catch (endpointError) {
        console.error(`Error trying user endpoint ${endpoint}:`, endpointError);
        // Continue to try next endpoint
      }
    }
    
    console.log("Failed to retrieve user details from all endpoints");
    return null;
  } catch (error) {
    console.error("Failed to fetch user details:", error);
    toast.error("Failed to load user details. Please try again.");
    return null;
  }
}
