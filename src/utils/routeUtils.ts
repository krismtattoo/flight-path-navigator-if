
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
  // Filter valid points and apply smoothing by reducing the number of points
  const validPoints = routePoints.filter(point => 
    typeof point.latitude === 'number' && 
    typeof point.longitude === 'number' && 
    !isNaN(point.latitude) && 
    !isNaN(point.longitude)
  );
  
  // If we have too many points, reduce their number for smoother rendering
  if (validPoints.length > 300) {
    const samplingRate = Math.ceil(validPoints.length / 300);
    return validPoints.filter((_, index) => index % samplingRate === 0 || index === validPoints.length - 1);
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
  
  // Create GeoJSON for traveled and remaining route
  const traveledCoords = validRoutePoints
    .slice(0, currentPositionIndex + 1)
    .map(p => [p.longitude, p.latitude]);
  
  // Important fix: Make sure remaining coords includes ALL points from current position to the end
  const remainingCoords = validRoutePoints
    .slice(currentPositionIndex)
    .map(p => [p.longitude, p.latitude]);
  
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
  
  // Add waypoint markers (start, current position, end)
  if (validRoutePoints.length > 0) {
    // Start waypoint
    const startPoint = validRoutePoints[0];
    features.push({
      type: 'Feature' as const,
      properties: {
        type: 'waypoint',
        waypointType: 'start',
        altitude: startPoint.altitude,
        timestamp: startPoint.timestamp
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [startPoint.longitude, startPoint.latitude]
      }
    });
    
    // Current position waypoint
    const currentPoint = validRoutePoints[currentPositionIndex];
    features.push({
      type: 'Feature' as const,
      properties: {
        type: 'waypoint',
        waypointType: 'current',
        altitude: currentPoint.altitude,
        timestamp: currentPoint.timestamp
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [currentPoint.longitude, currentPoint.latitude]
      }
    });
    
    // End waypoint
    const endPoint = validRoutePoints[validRoutePoints.length - 1];
    features.push({
      type: 'Feature' as const,
      properties: {
        type: 'waypoint',
        waypointType: 'end',
        altitude: endPoint.altitude,
        timestamp: endPoint.timestamp
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [endPoint.longitude, endPoint.latitude]
      }
    });
  }
  
  console.log("Creating route GeoJSON with features:", features.length);
  console.log("Traveled path points:", traveledCoords.length);
  console.log("Remaining path points:", remainingCoords.length);
  
  return {
    type: 'FeatureCollection' as const,
    features: features
  };
}
