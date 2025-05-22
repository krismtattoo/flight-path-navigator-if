import { FlightTrackPoint } from "./types";

// Process different route data formats into consistent FlightTrackPoint array
export const parseRouteData = (data: any): FlightTrackPoint[] => {
  let processedPoints: FlightTrackPoint[] = [];
  
  // Handle array responses (route points)
  if (Array.isArray(data.result)) {
    console.log(`Found ${data.result.length} points in array format`);
    
    // Convert to standard track point format if needed
    processedPoints = data.result;
    
    // If this doesn't have lat/long but has coordinates format, transform
    if (data.result.length > 0 && !data.result[0].latitude && data.result[0].coordinates) {
      processedPoints = data.result.map((point: any) => ({
        latitude: point.coordinates.latitude || point.coordinates.lat,
        longitude: point.coordinates.longitude || point.coordinates.lng,
        altitude: point.altitude || point.coordinates.altitude || 0,
        timestamp: point.timestamp || Date.now() // Use timestamp or current time as fallback
      }));
    }
  } 
  // Handle object with route property
  else if (data.result.route && Array.isArray(data.result.route)) {
    console.log(`Found route property with ${data.result.route.length} points`);
    
    processedPoints = data.result.route.map((point: any) => ({
      latitude: point.latitude || (point.coordinates ? point.coordinates.latitude : 0),
      longitude: point.longitude || (point.coordinates ? point.coordinates.longitude : 0),
      altitude: point.altitude || (point.coordinates ? point.coordinates.altitude : 0),
      timestamp: point.timestamp || Date.now()
    }));
  }
  // Handle object with waypoints
  else if (data.result.waypoints && Array.isArray(data.result.waypoints)) {
    console.log(`Found waypoints with ${data.result.waypoints.length} points`);
    
    let waypointTimestampBase = Date.now();
    processedPoints = data.result.waypoints.map((point: any, index: number) => ({
      latitude: point.latitude || (point.coordinates ? point.coordinates.latitude : 0),
      longitude: point.longitude || (point.coordinates ? point.coordinates.longitude : 0),
      altitude: point.altitude || (point.coordinates ? point.coordinates.altitude : 0),
      timestamp: waypointTimestampBase + (index * 60000) // Fake timestamps spaced 1 minute apart
    }));
  }
  // Handle flight plan formats
  else if (data.result.departure && data.result.destination) {
    console.log(`Found flight plan with departure ${data.result.departure} and destination ${data.result.destination}`);
    
    // Extract route points from waypoints array if available
    if (data.result.waypoints && Array.isArray(data.result.waypoints)) {
      processedPoints = data.result.waypoints.map((point: any, index: number) => ({
        latitude: point.latitude || (point.coordinates ? point.coordinates.latitude : 0),
        longitude: point.longitude || (point.coordinates ? point.coordinates.longitude : 0),
        altitude: point.altitude || (point.coordinates ? point.coordinates.altitude : 0),
        timestamp: Date.now() + (index * 60000) // Fake timestamps spaced 1 minute apart
      }));
    }
  }
  
  // Sort points by timestamp if available
  if (processedPoints.length > 0 && processedPoints[0].timestamp) {
    processedPoints.sort((a: FlightTrackPoint, b: FlightTrackPoint) => a.timestamp - b.timestamp);
  }
  
  return processedPoints;
};

// Merge historical and planned points
export const mergeRoutePoints = (
  historicalPoints: FlightTrackPoint[], 
  plannedPoints: FlightTrackPoint[]
): FlightTrackPoint[] => {
  
  if (historicalPoints.length > 0 && plannedPoints.length > 0) {
    // Sort both by timestamp
    historicalPoints.sort((a, b) => a.timestamp - b.timestamp);
    plannedPoints.sort((a, b) => a.timestamp - b.timestamp);
    
    // If historical points already include more points than planned route, use that
    if (historicalPoints.length > plannedPoints.length) {
      console.log("Historical route includes more points than planned route");
      return historicalPoints;
    } 
    
    // Otherwise combine them, making sure to avoid duplicates
    // Get the last historical point
    const lastHistorical = historicalPoints[historicalPoints.length - 1];
    
    // Filter planned points to only include those beyond the last historical point
    // Use a small threshold for position comparison
    const threshold = 0.0001; // Approximately 11 meters at the equator
    const futurePoints = plannedPoints.filter(point => {
      return Math.abs(point.latitude - lastHistorical.latitude) > threshold || 
             Math.abs(point.longitude - lastHistorical.longitude) > threshold;
    });
    
    console.log(`Found ${futurePoints.length} future points beyond current position`);
    
    // Combine historical and future points
    return [...historicalPoints, ...futurePoints];
  } 
  // If we only have historical data
  else if (historicalPoints.length > 0) {
    return historicalPoints;
  }
  // If we only have planned data
  else if (plannedPoints.length > 0) {
    return plannedPoints;
  }
  
  // No valid points
  return [];
};
