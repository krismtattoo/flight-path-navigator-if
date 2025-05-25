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

// Bézier curve interpolation for smooth curves
function calculateBezierPoint(t: number, p0: [number, number], p1: [number, number], p2: [number, number], p3: [number, number]): [number, number] {
  const cx = 3 * (p1[0] - p0[0]);
  const bx = 3 * (p2[0] - p1[0]) - cx;
  const ax = p3[0] - p0[0] - cx - bx;
  
  const cy = 3 * (p1[1] - p0[1]);
  const by = 3 * (p2[1] - p1[1]) - cy;
  const ay = p3[1] - p0[1] - cy - by;
  
  const tSquared = t * t;
  const tCubed = tSquared * t;
  
  const resultX = (ax * tCubed) + (bx * tSquared) + (cx * t) + p0[0];
  const resultY = (ay * tCubed) + (by * tSquared) + (cy * t) + p0[1];
  
  return [resultX, resultY];
}

// Generate control points for smooth Bézier curves
function generateControlPoints(points: FlightTrackPoint[]): Array<{
  p0: [number, number];
  p1: [number, number];
  p2: [number, number];
  p3: [number, number];
}> {
  if (points.length < 2) return [];
  
  const controlPointSets = [];
  
  for (let i = 0; i < points.length - 1; i++) {
    const current = [points[i].longitude, points[i].latitude] as [number, number];
    const next = [points[i + 1].longitude, points[i + 1].latitude] as [number, number];
    
    // Calculate control points for smooth curves
    let prev = i > 0 ? [points[i - 1].longitude, points[i - 1].latitude] as [number, number] : current;
    let after = i < points.length - 2 ? [points[i + 2].longitude, points[i + 2].latitude] as [number, number] : next;
    
    // Control point calculation for natural curves
    const tension = 0.3; // Smoothness factor
    
    const cp1: [number, number] = [
      current[0] + (next[0] - prev[0]) * tension,
      current[1] + (next[1] - prev[1]) * tension
    ];
    
    const cp2: [number, number] = [
      next[0] - (after[0] - current[0]) * tension,
      next[1] - (after[1] - current[1]) * tension
    ];
    
    controlPointSets.push({
      p0: current,
      p1: cp1,
      p2: cp2,
      p3: next
    });
  }
  
  return controlPointSets;
}

// Create smooth curved segments with interpolated colors
export function createSmoothAltitudeSegments(routePoints: FlightTrackPoint[]): Array<{
  coordinates: [number, number][];
  color: string;
  opacity: number;
}> {
  if (routePoints.length < 2) return [];
  
  const segments = [];
  const controlPointSets = generateControlPoints(routePoints);
  const curveResolution = 8; // Number of points per curve segment
  
  controlPointSets.forEach((controlPoints, segmentIndex) => {
    const currentPoint = routePoints[segmentIndex];
    const nextPoint = routePoints[segmentIndex + 1];
    
    const currentColor = getAltitudeColor(currentPoint.altitude || 0);
    const nextColor = getAltitudeColor(nextPoint.altitude || 0);
    
    // Create smooth curve points using Bézier interpolation
    const curvePoints: [number, number][] = [];
    
    for (let t = 0; t <= 1; t += 1 / curveResolution) {
      const point = calculateBezierPoint(t, controlPoints.p0, controlPoints.p1, controlPoints.p2, controlPoints.p3);
      curvePoints.push(point);
    }
    
    // Create multiple micro-segments along the curve with color interpolation
    for (let i = 0; i < curvePoints.length - 1; i++) {
      const t1 = i / (curvePoints.length - 1);
      const t2 = (i + 1) / (curvePoints.length - 1);
      const avgT = (t1 + t2) / 2;
      
      const segmentColor = interpolateColor(currentColor, nextColor, avgT);
      
      segments.push({
        coordinates: [curvePoints[i], curvePoints[i + 1]],
        color: segmentColor,
        opacity: 0.9
      });
    }
  });
  
  return segments;
}

function createAltitudeSegments(routePoints: FlightTrackPoint[]) {
  const segments = [];
  
  for (let i = 0; i < routePoints.length - 1; i++) {
    const currentPoint = routePoints[i];
    const nextPoint = routePoints[i + 1];
    
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
  
  if (flownRoute.length > 1) {
    const altitudeSegments = createAltitudeSegments(flownRoute);
    features.push(...altitudeSegments);
  }
  
  if (flightPlan.length >= 2) {
    const endPoint = flightPlan[flightPlan.length - 1];
    
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
