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

// Create individual line segments for altitude-based coloring
function createAltitudeSegments(routePoints: FlightTrackPoint[]) {
  const segments = [];
  
  for (let i = 0; i < routePoints.length - 1; i++) {
    const currentPoint = routePoints[i];
    const nextPoint = routePoints[i + 1];
    
    // Create a line segment between consecutive points
    segments.push({
      type: 'Feature' as const,
      properties: {
        type: 'flown',
        altitude: currentPoint.altitude || 0
      },
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          [currentPoint.longitude, currentPoint.latitude],
          [nextPoint.longitude, nextPoint.latitude]
        ]
      }
    });
  }
  
  return segments;
}

// Create GeoJSON for both flight plan and flown route
export function createRouteGeoJSON(
  flownRoute: FlightTrackPoint[], 
  flightPlan: FlightTrackPoint[]
) {
  const features = [];
  
  console.log(`Creating GeoJSON with flown route=${flownRoute.length} and flight plan=${flightPlan.length} points`);
  
  // Add flight plan line (white dashed line)
  if (flightPlan.length > 1) {
    const flightPlanCoords = flightPlan.map(p => [p.longitude, p.latitude]);
    features.push({
      type: 'Feature' as const,
      properties: {
        type: 'flightplan'
      },
      geometry: {
        type: 'LineString' as const,
        coordinates: flightPlanCoords
      }
    });
  }
  
  // Add flown route as individual segments with altitude information
  if (flownRoute.length > 1) {
    const altitudeSegments = createAltitudeSegments(flownRoute);
    features.push(...altitudeSegments);
  }
  
  // Add waypoints from flight plan (only destination and intermediate)
  if (flightPlan.length >= 2) {
    const endPoint = flightPlan[flightPlan.length - 1];
    
    // Add destination waypoint (red)
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
    
    // Add intermediate waypoints (small white circles)
    if (flightPlan.length > 2) {
      flightPlan.slice(1, -1).forEach(point => {
        features.push({
          type: 'Feature' as const,
          properties: {
            type: 'waypoint',
            waypointType: 'intermediate'
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [point.longitude, point.latitude]
          }
        });
      });
    }
  }
  
  return {
    type: 'FeatureCollection' as const,
    features: features
  };
}
