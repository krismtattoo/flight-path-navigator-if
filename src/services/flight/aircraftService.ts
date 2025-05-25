import { API_KEY, BASE_URL } from './types';

export interface AircraftInfo {
  aircraftId: string;
  aircraftName: string;
  liveryId: string;
  liveryName: string;
}

export interface LiveryData {
  id: string;
  aircraftID: string;
  aircraftName: string;
  liveryName: string;
}

export async function getAircraftLiveries(aircraftId: string): Promise<LiveryData[] | null> {
  try {
    console.log(`🔍 Fetching liveries for aircraft: ${aircraftId}`);
    const response = await fetch(`${BASE_URL}/aircraft/${aircraftId}/liveries`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch aircraft liveries: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (data.errorCode !== 0 || !data.result) {
      console.error('Aircraft liveries API returned error:', data);
      return null;
    }

    console.log(`✅ Retrieved ${data.result.length} liveries for aircraft ${aircraftId}`);
    return data.result;
  } catch (error) {
    console.error('Error fetching aircraft liveries:', error);
    return null;
  }
}

export async function getAircraftInfo(aircraftId: string, liveryId: string): Promise<AircraftInfo | null> {
  try {
    console.log(`🔍 Getting aircraft info for aircraft: ${aircraftId}, livery: ${liveryId}`);
    
    const liveries = await getAircraftLiveries(aircraftId);
    if (!liveries || liveries.length === 0) {
      console.log(`❌ No liveries found for aircraft ${aircraftId}`);
      return null;
    }

    // Find the specific livery
    const liveryData = liveries.find(livery => livery.id === liveryId);
    if (!liveryData) {
      console.log(`❌ Livery ${liveryId} not found in aircraft ${aircraftId} liveries`);
      // Return the first livery as fallback with aircraft name
      const firstLivery = liveries[0];
      return {
        aircraftId: aircraftId,
        aircraftName: firstLivery.aircraftName,
        liveryId: liveryId,
        liveryName: 'Standard Livery'
      };
    }

    console.log(`✅ Found livery: ${liveryData.liveryName} for aircraft: ${liveryData.aircraftName}`);
    return {
      aircraftId: aircraftId,
      aircraftName: liveryData.aircraftName,
      liveryId: liveryId,
      liveryName: liveryData.liveryName
    };
  } catch (error) {
    console.error('Error getting aircraft info:', error);
    return null;
  }
}

export async function getLiveryInfo(liveryId: string): Promise<{ liveryId: string; liveryName: string } | null> {
  try {
    // This is less efficient but kept for compatibility
    console.log(`🔍 Getting livery info for: ${liveryId} (deprecated method)`);
    return {
      liveryId: liveryId,
      liveryName: 'Unknown Livery'
    };
  } catch (error) {
    console.error('Error fetching livery info:', error);
    return null;
  }
}
