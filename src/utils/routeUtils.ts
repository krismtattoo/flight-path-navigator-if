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

// Enhanced filter for valid route points with better smoothing
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
  
  if (validPoints.length < 2) {
    return validPoints;
  }
  
  // Sort by timestamp if available
  if (validPoints.length > 0 && validPoints[0].timestamp) {
    validPoints.sort((a, b) => a.timestamp - b.timestamp);
  }
  
  // Enhanced smoothing: Remove points that create sharp angles or are too close
  const smoothedPoints = [validPoints[0]]; // Always keep first point
  
  for (let i = 1; i < validPoints.length - 1; i++) {
    const prev = validPoints[i - 1];
    const current = validPoints[i];
    const next = validPoints[i + 1];
    
    // Calculate distance between consecutive points
    const distToPrev = calculateDistance(prev.latitude, prev.longitude, current.latitude, current.longitude);
    const distToNext = calculateDistance(current.latitude, current.longitude, next.latitude, next.longitude);
    
    // Skip points that are too close (creates jagged lines)
    if (distToPrev < 0.1 && distToNext < 0.1) {
      continue;
    }
    
    // Calculate angle to detect sharp turns that cause pixelation
    const angle1 = Math.atan2(current.latitude - prev.latitude, current.longitude - prev.longitude);
    const angle2 = Math.atan2(next.latitude - current.latitude, next.longitude - current.longitude);
    const angleDiff = Math.abs(angle1 - angle2);
    
    // Include point if it's not creating a sharp angle or if it's significant distance
    if (angleDiff > 0.1 || distToPrev > 1.0) {
      smoothedPoints.push(current);
    }
  }
  
  // Always keep the last point
  if (validPoints.length > 1) {
    smoothedPoints.push(validPoints[validPoints.length - 1]);
  }
  
  // Adaptive sampling for very long routes
  if (smoothedPoints.length > 150) {
    const startPoint = smoothedPoints[0];
    const endPoint = smoothedPoints[smoothedPoints.length - 1];
    const samplingRate = Math.ceil((smoothedPoints.length - 2) / 148);
    
    const sampledPoints = smoothedPoints
      .slice(1, smoothedPoints.length - 1)
      .filter((_, index) => index % samplingRate === 0);
    
    return [startPoint, ...sampledPoints, endPoint];
  }
  
  return smoothedPoints;
}

// Enhanced color interpolation function
export function interpolateColor(color1: string, color2: string, factor: number): string {
  const hex2rgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  
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
  
  let lowerStop = colorStops[0];
  let upperStop = colorStops[colorStops.length - 1];
  
  for (let i = 0; i < colorStops.length - 1; i++) {
    if (altitude >= colorStops[i].altitude && altitude <= colorStops[i + 1].altitude) {
      lowerStop = colorStops[i];
      upperStop = colorStops[i + 1];
      break;
    }
  }
  
  if (altitude <= colorStops[0].altitude) return colorStops[0].color;
  if (altitude >= colorStops[colorStops.length - 1].altitude) return colorStops[colorStops.length - 1].color;
  
  const factor = (altitude - lowerStop.altitude) / (upperStop.altitude - lowerStop.altitude);
  return interpolateColor(lowerStop.color, upperStop.color, factor);
}

// Ultra-smooth Catmull-Rom spline interpolation for natural curves
function calculateCatmullRomPoint(t: number, p0: [number, number], p1: [number, number], p2: [number, number], p3: [number, number]): [number, number] {
  const t2 = t * t;
  const t3 = t2 * t;
  
  const x = 0.5 * (
    (2 * p1[0]) +
    (-p0[0] + p2[0]) * t +
    (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
    (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3
  );
  
  const y = 0.5 * (
    (2 * p1[1]) +
    (-p0[1] + p2[1]) * t +
    (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
    (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3
  );
  
  return [x, y];
}

// Generate ultra-smooth control points using Catmull-Rom splines
function generateSmoothControlPoints(points: FlightTrackPoint[]): Array<{
  segments: [number, number][];
  startAltitude: number;
  endAltitude: number;
}> {
  if (points.length < 2) return [];
  
  const controlPointSets = [];
  const resolution = 25; // Higher resolution for ultra-smooth curves
  
  for (let i = 0; i < points.length - 1; i++) {
    // Get 4 points for Catmull-Rom (p0, p1, p2, p3)
    const p0 = i > 0 ? 
      [points[i - 1].longitude, points[i - 1].latitude] as [number, number] : 
      [points[i].longitude, points[i].latitude] as [number, number];
    
    const p1 = [points[i].longitude, points[i].latitude] as [number, number];
    const p2 = [points[i + 1].longitude, points[i + 1].latitude] as [number, number];
    
    const p3 = i < points.length - 2 ? 
      [points[i + 2].longitude, points[i + 2].latitude] as [number, number] : 
      [points[i + 1].longitude, points[i + 1].latitude] as [number, number];
    
    // Generate smooth curve segments
    const segments: [number, number][] = [];
    
    for (let t = 0; t <= 1; t += 1 / resolution) {
      const point = calculateCatmullRomPoint(t, p0, p1, p2, p3);
      segments.push(point);
    }
    
    controlPointSets.push({
      segments,
      startAltitude: points[i].altitude || 0,
      endAltitude: points[i + 1].altitude || 0
    });
  }
  
  return controlPointSets;
}

// Create ultra-smooth curved segments with perfect color interpolation
export function createSmoothAltitudeSegments(routePoints: FlightTrackPoint[]): Array<{
  coordinates: [number, number][];
  color: string;
  opacity: number;
}> {
  if (routePoints.length < 2) return [];
  
  const segments = [];
  const smoothControlPointSets = generateSmoothControlPoints(routePoints);
  
  smoothControlPointSets.forEach((controlSet) => {
    const currentColor = getAltitudeColor(controlSet.startAltitude);
    const nextColor = getAltitudeColor(controlSet.endAltitude);
    
    // Create micro-segments along the smooth curve
    for (let i = 0; i < controlSet.segments.length - 1; i++) {
      const t = i / (controlSet.segments.length - 1);
      const segmentColor = interpolateColor(currentColor, nextColor, t);
      
      segments.push({
        coordinates: [controlSet.segments[i], controlSet.segments[i + 1]],
        color: segmentColor,
        opacity: 0.95
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
