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
    !isNaN(point.longitude) &&
    point.latitude >= -90 && point.latitude <= 90 &&
    point.longitude >= -180 && point.longitude <= 180
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

// Enhanced color interpolation function
export function interpolateColor(color1: string, color2: string, factor: number): string {
  // Convert hex to RGB
  const hex2rgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  
  // Convert RGB to hex
  const rgb2hex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };
  
  const c1 = hex2rgb(color1);
  const c2 = hex2rgb(color2);
  
  if (!c1 || !c2) return color1;
  
  const r = Math.round(c1.r + factor * (c2.r - c1.r));
  const g = Math.round(c1.g + factor * (c2.g - c1.g));
  const b = Math.round(c1.b + factor * (c2.b - c1.b));
  
  return rgb2hex(r, g, b);
}

// Enhanced altitude color mapping with smoother gradients
export function getAltitudeColor(altitude: number): string {
  // Modern, harmonious color palette for altitude visualization
  const colorStops = [
    { altitude: 0, color: '#ef4444' },      // Red (ground)
    { altitude: 1000, color: '#f97316' },   // Orange
    { altitude: 5000, color: '#eab308' },   // Yellow
    { altitude: 10000, color: '#84cc16' },  // Lime
    { altitude: 20000, color: '#22c55e' },  // Green
    { altitude: 30000, color: '#06b6d4' },  // Cyan
    { altitude: 40000, color: '#3b82f6' },  // Blue
    { altitude: 50000, color: '#8b5cf6' },  // Purple
    { altitude: 60000, color: '#a855f7' }   // Violet
  ];
  
  // Find the two color stops to interpolate between
  let lowerStop = colorStops[0];
  let upperStop = colorStops[colorStops.length - 1];
  
  for (let i = 0; i < colorStops.length - 1; i++) {
    if (altitude >= colorStops[i].altitude && altitude <= colorStops[i + 1].altitude) {
      lowerStop = colorStops[i];
      upperStop = colorStops[i + 1];
      break;
    }
  }
  
  // If altitude is beyond our range, return the appropriate boundary color
  if (altitude <= colorStops[0].altitude) return colorStops[0].color;
  if (altitude >= colorStops[colorStops.length - 1].altitude) return colorStops[colorStops.length - 1].color;
  
  // Calculate interpolation factor
  const factor = (altitude - lowerStop.altitude) / (upperStop.altitude - lowerStop.altitude);
  
  // Interpolate between the two colors
  return interpolateColor(lowerStop.color, upperStop.color, factor);
}

// Create smooth segments with interpolated colors
export function createSmoothAltitudeSegments(routePoints: FlightTrackPoint[]): Array<{
  coordinates: [number, number][];
  color: string;
  opacity: number;
}> {
  const segments = [];
  
  for (let i = 0; i < routePoints.length - 1; i++) {
    const currentPoint = routePoints[i];
    const nextPoint = routePoints[i + 1];
    
    // Get colors for current and next point
    const currentColor = getAltitudeColor(currentPoint.altitude || 0);
    const nextColor = getAltitudeColor(nextPoint.altitude || 0);
    
    // Create multiple micro-segments for smooth transition
    const microSegments = 3; // Number of segments between each point
    
    for (let j = 0; j < microSegments; j++) {
      const factor1 = j / microSegments;
      const factor2 = (j + 1) / microSegments;
      
      // Interpolate coordinates
      const lat1 = currentPoint.latitude + factor1 * (nextPoint.latitude - currentPoint.latitude);
      const lon1 = currentPoint.longitude + factor1 * (nextPoint.longitude - currentPoint.longitude);
      const lat2 = currentPoint.latitude + factor2 * (nextPoint.latitude - currentPoint.latitude);
      const lon2 = currentPoint.longitude + factor2 * (nextPoint.longitude - currentPoint.longitude);
      
      // Interpolate color
      const segmentColor = interpolateColor(currentColor, nextColor, (factor1 + factor2) / 2);
      
      segments.push({
        coordinates: [[lon1, lat1], [lon2, lat2]],
        color: segmentColor,
        opacity: 0.9
      });
    }
  }
  
  return segments;
}

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

// Calculate distance between two points (Haversine formula)
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
