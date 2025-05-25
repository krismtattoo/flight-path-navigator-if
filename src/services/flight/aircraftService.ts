
import { API_KEY, BASE_URL } from './types';

export interface AircraftInfo {
  aircraftId: string;
  aircraftName: string;
  liveryId: string;
  liveryName: string;
}

export async function getAircraftInfo(aircraftId: string): Promise<AircraftInfo | null> {
  try {
    const response = await fetch(`${BASE_URL}/aircraft/${aircraftId}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch aircraft info: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (data.errorCode !== 0 || !data.result) {
      console.error('Aircraft API returned error:', data);
      return null;
    }

    return {
      aircraftId: data.result.aircraftId,
      aircraftName: data.result.aircraftName,
      liveryId: data.result.liveryId,
      liveryName: data.result.liveryName
    };
  } catch (error) {
    console.error('Error fetching aircraft info:', error);
    return null;
  }
}

export async function getLiveryInfo(liveryId: string): Promise<{ liveryId: string; liveryName: string } | null> {
  try {
    const response = await fetch(`${BASE_URL}/aircraft/liveries/${liveryId}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch livery info: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (data.errorCode !== 0 || !data.result) {
      console.error('Livery API returned error:', data);
      return null;
    }

    return {
      liveryId: data.result.liveryId,
      liveryName: data.result.liveryName
    };
  } catch (error) {
    console.error('Error fetching livery info:', error);
    return null;
  }
}
