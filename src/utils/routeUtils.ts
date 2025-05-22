
import mapboxgl from 'mapbox-gl';
import { FlightTrackPoint, Flight } from '@/services/flight';

// Find the current position index in the route based on the flight's position
export function findCurrentPositionIndex(
  routePoints: FlightTrackPoint[], 
  flight: Flight | null
): number {
  if (!flight) return 0;
  
  const currentPos = {
    lat: flight.latitude,
    lng: flight.longitude
  };
  
  let minDist = Number.MAX_VALUE;
  let currentPositionIndex = 0;
  
  routePoints.forEach((point, idx) => {
    const dist = Math.sqrt(
      Math.pow(point.latitude - currentPos.lat, 2) + 
      Math.pow(point.longitude - currentPos.lng, 2)
    );
    if (dist < minDist) {
      minDist = dist;
      currentPositionIndex = idx;
    }
  });
  
  return currentPositionIndex;
}

// Filter valid route points
export function filterValidRoutePoints(routePoints: FlightTrackPoint[]): FlightTrackPoint[] {
  return routePoints.filter(point => 
    typeof point.latitude === 'number' && 
    typeof point.longitude === 'number' && 
    !isNaN(point.latitude) && 
    !isNaN(point.longitude)
  );
}

// Create GeoJSON for the route
export function createRouteGeoJSON(
  validRoutePoints: FlightTrackPoint[], 
  currentPositionIndex: number
) {
  // Create GeoJSON for traveled and remaining route
  const traveledCoords = validRoutePoints
    .slice(0, currentPositionIndex + 1)
    .map(p => [p.longitude, p.latitude]);
  
  const remainingCoords = validRoutePoints
    .slice(currentPositionIndex)
    .map(p => [p.longitude, p.latitude]);
  
  // Create waypoints features
  const waypointFeatures = validRoutePoints.map((point, index) => ({
    type: 'Feature' as const,
    properties: {
      type: 'waypoint',
      index: index,
      altitude: point.altitude,
      timestamp: point.timestamp
    },
    geometry: {
      type: 'Point' as const,
      coordinates: [point.longitude, point.latitude]
    }
  }));
  
  return {
    type: 'FeatureCollection' as const,
    features: [
      {
        type: 'Feature' as const,
        properties: {
          type: 'traveled'
        },
        geometry: {
          type: 'LineString' as const,
          coordinates: traveledCoords
        }
      },
      {
        type: 'Feature' as const,
        properties: {
          type: 'remaining'
        },
        geometry: {
          type: 'LineString' as const,
          coordinates: remainingCoords
        }
      },
      ...waypointFeatures
    ]
  };
}
