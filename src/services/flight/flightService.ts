
import { toast } from "sonner";
import { API_KEY, BASE_URL, Flight, serverIdMap } from "./types";
import { getServers, getServerIdByName } from "./serverService";

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
    console.log(`Using API Key for flights: ${API_KEY ? 'Present' : 'Missing'}`);
    
    const response = await fetch(`${BASE_URL}/flights/${serverId}`, {
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Unauthorized - API Key may be invalid");
        toast.error("API authorization failed. Please check your API key.");
        throw new Error(`API authorization failed: ${response.status}`);
      } else if (response.status === 403) {
        console.error("Forbidden - API Key may lack permissions");
        toast.error("API access forbidden. Please check your API key permissions.");
        throw new Error(`API access forbidden: ${response.status}`);
      } else {
        throw new Error(`API error: ${response.status}`);
      }
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
        console.log(`Using API Key for user details: ${API_KEY ? 'Present' : 'Missing'}`);
        
        const response = await fetch(endpoint, {
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Accept": "application/json",
            "Content-Type": "application/json"
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.result) {
            console.log("User details retrieved successfully");
            return data.result;
          }
        } else if (response.status === 401) {
          console.error("Unauthorized - API Key may be invalid");
          toast.error("API authorization failed. Please check your API key.");
          return null;
        } else if (response.status === 403) {
          console.error("Forbidden - API Key may lack permissions");
          toast.error("API access forbidden. Please check your API key permissions.");
          return null;
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
