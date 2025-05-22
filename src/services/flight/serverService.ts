
import { toast } from "sonner";
import { API_KEY, BASE_URL, ServerInfo, serverIdMap, SERVER_TYPES } from "./types";

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
      
      // Clear the existing map
      Object.keys(serverIdMap).forEach(key => {
        delete serverIdMap[key];
      });
      
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
export function getServerIdByName(serverName: string): string {
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
