
import { API_KEY, BASE_URL } from './types';
import { getServerIdByName } from './serverService';

export interface ActiveATCFacility {
  frequencyId: string;
  userId: string;
  username: string | null;
  virtualOrganization: string | null;
  airportName: string;
  type: number;
  latitude: number;
  longitude: number;
  startTime: string;
}

export interface AirportStatus {
  airportIcao: string;
  airportName: string;
  inboundFlightsCount: number;
  inboundFlights: string[];
  outboundFlightsCount: number;
  outboundFlights: string[];
  atcFacilities: ActiveATCFacility[];
}

export interface WorldResponse {
  errorCode: number;
  result: AirportStatus[];
}

export async function getWorldStatus(serverName: string): Promise<AirportStatus[]> {
  const serverId = getServerIdByName(serverName);
  
  if (!serverId) {
    throw new Error(`Server ID not found for: ${serverName}`);
  }

  try {
    console.log(`Fetching world status for server: ${serverName} (${serverId})`);
    
    const response = await fetch(`${BASE_URL}/sessions/${serverId}/world`, {
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`World API error: ${response.status}`);
    }

    const data: WorldResponse = await response.json();
    
    if (data.errorCode !== 0) {
      throw new Error(`World API returned error code: ${data.errorCode}`);
    }

    // Filter airports with activity (inbound or outbound flights)
    const activeAirports = data.result.filter(airport => 
      airport.inboundFlightsCount > 0 || airport.outboundFlightsCount > 0
    );

    console.log(`Found ${activeAirports.length} airports with activity`);
    return activeAirports;
    
  } catch (error) {
    console.error("Failed to fetch world status:", error);
    throw error;
  }
}
