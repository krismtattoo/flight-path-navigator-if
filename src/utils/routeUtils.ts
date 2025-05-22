
import mapboxgl from 'mapbox-gl';
import { FlightTrackPoint, Flight } from '@/services/flight';

// Find the current position index in the route based on the flight's position
export function findCurrentPositionIndex(
  routePoints: FlightTrackPoint[], 
  flight: Flight | null
): number {
  if (!flight || routePoints.length === 0) return 0;
  
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
  // Filter valid points and remove duplicates
  const validPoints = routePoints.filter(point => 
    typeof point.latitude === 'number' && 
    typeof point.longitude === 'number' && 
    !isNaN(point.latitude) && 
    !isNaN(point.longitude)
  );
  
  // Make sure start and end points are included by keeping first and last points
  if (validPoints.length < 2) {
    return validPoints; // Not enough points for a route
  }
  
  // Ensure points are sorted by timestamp if available
  if (validPoints.length > 0 && validPoints[0].timestamp) {
    return [...validPoints].sort((a, b) => a.timestamp - b.timestamp);
  }
  
  // If we have too many points, reduce their number for smoother rendering
  // But always keep start and end points
  if (validPoints.length > 300) {
    const startPoint = validPoints[0];
    const endPoint = validPoints[validPoints.length - 1];
    
    // Keep approximately 300 points including start and end
    const samplingRate = Math.ceil((validPoints.length - 2) / 298);
    
    // Filter middle points
    const middlePoints = validPoints
      .slice(1, validPoints.length - 1)
      .filter((_, index) => index % samplingRate === 0);
    
    // Return combined array with start, sampled middle points, and end
    return [startPoint, ...middlePoints, endPoint];
  }
  
  return validPoints;
}

// Create GeoJSON for the route
export function createRouteGeoJSON(
  validRoutePoints: FlightTrackPoint[], 
  currentPositionIndex: number
) {
  if (validRoutePoints.length === 0) {
    return {
      type: 'FeatureCollection' as const,
      features: []
    };
  }
  
  // Ensure currentPositionIndex is within bounds
  const safeIndex = Math.max(0, Math.min(currentPositionIndex, validRoutePoints.length - 1));
  
  // Create GeoJSON for traveled and remaining route - always include all points
  const traveledCoords = validRoutePoints
    .slice(0, safeIndex + 1)
    .map(p => [p.longitude, p.latitude]);
  
  const remainingCoords = validRoutePoints
    .slice(safeIndex)
    .map(p => [p.longitude, p.latitude]);
  
  console.log(`Creating GeoJSON with traveled=${traveledCoords.length} and remaining=${remainingCoords.length} points`);
  
  // Create features array
  const features = [];
  
  // Add traveled path if it exists
  if (traveledCoords.length > 1) {
    features.push({
      type: 'Feature' as const,
      properties: {
        type: 'traveled'
      },
      geometry: {
        type: 'LineString' as const,
        coordinates: traveledCoords
      }
    });
  }
  
  // Add remaining path if it exists
  if (remainingCoords.length > 1) {
    features.push({
      type: 'Feature' as const,
      properties: {
        type: 'remaining'
      },
      geometry: {
        type: 'LineString' as const,
        coordinates: remainingCoords
      }
    });
  }
  
  // Add waypoints at start and end of route
  if (validRoutePoints.length >= 2) {
    const startPoint = validRoutePoints[0];
    const endPoint = validRoutePoints[validRoutePoints.length - 1];
    
    // Add departure waypoint
    features.push({
      type: 'Feature' as const,
      properties: {
        type: 'waypoint',
        waypointType: 'departure'
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [startPoint.longitude, startPoint.latitude]
      }
    });
    
    // Add destination waypoint
    features.push({
      type: 'Feature' as const,
      properties: {
        type: 'waypoint',
        waypointType: 'destination'
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [endPoint.longitude, endPoint.latitude]
      }
    });
  }
  
  return {
    type: 'FeatureCollection' as const,
    features: features
  };
}
