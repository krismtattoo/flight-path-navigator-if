
import { FlightTrackPoint } from "./types";

// Process different route data formats into consistent FlightTrackPoint array
export const parseRouteData = (data: any): FlightTrackPoint[] => {
  let processedPoints: FlightTrackPoint[] = [];
  
  // Handle flight route API response (actual flown route)
  if (Array.isArray(data.result)) {
    console.log(`Found ${data.result.length} route points from flight route API`);
    
    processedPoints = data.result.map((point: any) => ({
      latitude: point.latitude,
      longitude: point.longitude,
      altitude: point.altitude || 0,
      timestamp: new Date(point.lastReport).getTime()
    }));
  }
  // Handle flight plan API response (planned route)
  else if (data.result && data.result.waypoints && Array.isArray(data.result.waypoints)) {
    console.log(`Found flight plan with ${data.result.waypoints.length} waypoints`);
    
    let waypointTimestampBase = Date.now();
    processedPoints = data.result.waypoints.map((waypoint: any, index: number) => ({
      latitude: waypoint.location.latitude,
      longitude: waypoint.location.longitude,
      altitude: waypoint.altitude || 0,
      timestamp: waypointTimestampBase + (index * 60000) // Fake timestamps spaced 1 minute apart
    }));
  }
  // Handle case where we have departure and destination info
  else if (data.result && data.result.departure && data.result.destination) {
    console.log(`Found flight plan with departure and destination`);
    
    const points = [];
    
    // Add departure point
    if (data.result.departure.location) {
      points.push({
        latitude: data.result.departure.location.latitude,
        longitude: data.result.departure.location.longitude,
        altitude: 0,
        timestamp: Date.now()
      });
    }
    
    // Add waypoints if available
    if (data.result.waypoints && Array.isArray(data.result.waypoints)) {
      data.result.waypoints.forEach((waypoint: any, index: number) => {
        points.push({
          latitude: waypoint.location.latitude,
          longitude: waypoint.location.longitude,
          altitude: waypoint.altitude || 0,
          timestamp: Date.now() + ((index + 1) * 60000)
        });
      });
    }
    
    // Add destination point
    if (data.result.destination.location) {
      points.push({
        latitude: data.result.destination.location.latitude,
        longitude: data.result.destination.location.longitude,
        altitude: 0,
        timestamp: Date.now() + (points.length * 60000)
      });
    }
    
    processedPoints = points;
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
    // If we have both historical (flown) and planned route data
    // Use historical data as primary and extend with remaining planned waypoints
    console.log("Merging historical route with flight plan data");
    
    // Sort both by timestamp
    historicalPoints.sort((a, b) => a.timestamp - b.timestamp);
    plannedPoints.sort((a, b) => a.timestamp - b.timestamp);
    
    // Get the last historical point
    const lastHistorical = historicalPoints[historicalPoints.length - 1];
    
    // Filter planned points to only include those beyond the last historical point
    const threshold = 0.01; // Approximately 1km at the equator
    const futurePoints = plannedPoints.filter(point => {
      const distance = Math.sqrt(
        Math.pow(point.latitude - lastHistorical.latitude, 2) + 
        Math.pow(point.longitude - lastHistorical.longitude, 2)
      );
      return distance > threshold;
    });
    
    console.log(`Found ${futurePoints.length} remaining waypoints beyond current position`);
    
    // Combine historical and future points
    return [...historicalPoints, ...futurePoints];
  } 
  // If we only have historical data (actual flown route)
  else if (historicalPoints.length > 0) {
    console.log("Using historical route data only");
    return historicalPoints;
  }
  // If we only have planned data (flight plan)
  else if (plannedPoints.length > 0) {
    console.log("Using flight plan data only");
    return plannedPoints;
  }
  
  // No valid points
  return [];
};
