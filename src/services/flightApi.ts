
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
      // Die Server-Daten sind in einem result-Feld
      const servers = data.result;
      console.log("Processing servers:", servers);
      
      // Map server names to IDs for easier lookup
      serverIdMap = {}; // Reset the map
      
      servers.forEach((server: any) => {
        if (server.name && server.id) {
          // Direktes Mapping von vollem Namen zu ID
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
  // Versuche es erst mit dem genauen Namen
  const serverId = serverIdMap[serverName.toLowerCase()];
  
  if (!serverId) {
    // Wenn nicht gefunden, versuche alternativ Matchings
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

// Get flight route for a specific flight
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
    
    // FIX: Use the correct API endpoint structure for track data
    const response = await fetch(`${BASE_URL}/flights/${serverId}/${flightId}/route`, {
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error ${response.status}: ${errorText}`);
      
      // Let's try the alternative endpoint if the first one fails
      console.log("Trying alternative endpoint for flight route");
      const altResponse = await fetch(`${BASE_URL}/flights/${serverId}/route/${flightId}`, {
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Accept": "application/json"
        }
      });
      
      if (!altResponse.ok) {
        console.error(`Alternative API endpoint also failed with ${altResponse.status}`);
        throw new Error(`API error: ${response.status}`);
      }
      
      const altData = await altResponse.json();
      console.log("Flight route API response from alternative endpoint:", altData);
      
      if (altData && altData.result && Array.isArray(altData.result)) {
        console.log(`Found ${altData.result.length} track points`);
        return altData.result;
      }
    } else {
      const data = await response.json();
      console.log("Flight route API response:", data);
      
      if (data && data.result && Array.isArray(data.result)) {
        console.log(`Found ${data.result.length} track points`);
        return data.result;
      }
    }
    
    // If we reach here, try a third endpoint format as a last resort
    console.log("Trying final endpoint format for flight route");
    const finalResponse = await fetch(`${BASE_URL}/sessions/${serverId}/flights/${flightId}/route`, {
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Accept": "application/json"
      }
    });
    
    if (finalResponse.ok) {
      const finalData = await finalResponse.json();
      if (finalData && finalData.result && Array.isArray(finalData.result)) {
        console.log(`Found ${finalData.result.length} track points with final endpoint`);
        return finalData.result;
      }
    }
    
    console.log("No track points found in API response");
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
    if (data && data.result) {
      return data.result;
    }
    
    return null;
  } catch (error) {
    console.error("Failed to fetch user details:", error);
    toast.error("Failed to load user details. Please try again.");
    return null;
  }
}
