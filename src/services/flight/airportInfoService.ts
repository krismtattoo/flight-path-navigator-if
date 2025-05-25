
import { API_KEY, BASE_URL } from './types';

export interface Country {
  id: number;
  name: string;
  isoCode: string;
}

export interface AirportInfo {
  icao: string;
  iata: string;
  name: string;
  city: string;
  state: string;
  country: Country;
  class: number;
  frequenciesCount: number;
  elevation: number;
  latitude: number;
  longitude: number;
  timezone: string;
  has3dBuildings: boolean;
  hasJetbridges: boolean;
  hasSafedockUnits: boolean;
  hasTaxiwayRouting: boolean;
}

export interface AirportInfoResponse {
  errorCode: number;
  result: AirportInfo;
}

export async function getAirportInfo(airportIcao: string): Promise<AirportInfo> {
  try {
    console.log(`Fetching airport info for: ${airportIcao}`);
    
    const response = await fetch(`${BASE_URL}/airport/${airportIcao}`, {
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Airport Info API error: ${response.status}`);
    }

    const data: AirportInfoResponse = await response.json();
    
    if (data.errorCode !== 0) {
      throw new Error(`Airport Info API returned error code: ${data.errorCode}`);
    }

    console.log(`Retrieved airport info for ${airportIcao}:`, data.result);
    return data.result;
    
  } catch (error) {
    console.error(`Failed to fetch airport info for ${airportIcao}:`, error);
    throw error;
  }
}
