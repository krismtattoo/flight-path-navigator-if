
import { FlightTrackPoint } from "./types";

// Process flight route data (actual flown route) into FlightTrackPoint array
export const parseFlownRouteData = (data: any): FlightTrackPoint[] => {
  let processedPoints: FlightTrackPoint[] = [];
  
  try {
    // Handle flight route API response (actual flown route from /route endpoint)
    if (data?.result && Array.isArray(data.result)) {
      console.log(`Found ${data.result.length} flown route points from flight route API`);
      
      processedPoints = data.result
        .filter((point: any) => point && typeof point.latitude === 'number' && typeof point.longitude === 'number')
        .map((point: any) => ({
          latitude: point.latitude,
          longitude: point.longitude,
          altitude: point.altitude || 0,
          timestamp: point.lastReport ? new Date(point.lastReport).getTime() : Date.now()
        }));
    }
    
    // Sort points by timestamp if available
    if (processedPoints.length > 0 && processedPoints[0].timestamp) {
      processedPoints.sort((a: FlightTrackPoint, b: FlightTrackPoint) => a.timestamp - b.timestamp);
    }
  } catch (error) {
    console.error('Error parsing flown route data:', error);
  }
  
  return processedPoints;
};

// Process flight plan data (planned route with waypoints) into FlightTrackPoint array
export const parseFlightPlanData = (data: any): FlightTrackPoint[] => {
  let processedPoints: FlightTrackPoint[] = [];
  
  try {
    // Handle flight plan API response (planned route from /flightplan endpoint)
    if (data?.result?.waypoints && Array.isArray(data.result.waypoints)) {
      console.log(`Found flight plan with ${data.result.waypoints.length} waypoints`);
      
      let waypointTimestampBase = Date.now();
      processedPoints = data.result.waypoints
        .filter((waypoint: any) => waypoint?.location && 
                 typeof waypoint.location.latitude === 'number' && 
                 typeof waypoint.location.longitude === 'number')
        .map((waypoint: any, index: number) => ({
          latitude: waypoint.location.latitude,
          longitude: waypoint.location.longitude,
          altitude: waypoint.altitude || 0,
          timestamp: waypointTimestampBase + (index * 60000) // Fake timestamps spaced 1 minute apart
        }));
    }
    // Handle case where we have departure and destination info
    else if (data?.result?.departure || data?.result?.destination) {
      console.log(`Found flight plan with departure and/or destination`);
      
      const points = [];
      
      // Add departure point
      if (data.result.departure?.location && 
          typeof data.result.departure.location.latitude === 'number' &&
          typeof data.result.departure.location.longitude === 'number') {
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
          if (waypoint?.location && 
              typeof waypoint.location.latitude === 'number' && 
              typeof waypoint.location.longitude === 'number') {
            points.push({
              latitude: waypoint.location.latitude,
              longitude: waypoint.location.longitude,
              altitude: waypoint.altitude || 0,
              timestamp: Date.now() + ((index + 1) * 60000)
            });
          }
        });
      }
      
      // Add destination point
      if (data.result.destination?.location && 
          typeof data.result.destination.location.latitude === 'number' &&
          typeof data.result.destination.location.longitude === 'number') {
        points.push({
          latitude: data.result.destination.location.latitude,
          longitude: data.result.destination.location.longitude,
          altitude: 0,
          timestamp: Date.now() + (points.length * 60000)
        });
      }
      
      processedPoints = points;
    }
    // Handle alternative flight plan structure
    else if (data?.result && typeof data.result === 'object') {
      console.log('Checking for alternative flight plan structure');
      
      // Check if result contains direct coordinate data
      if (data.result.latitude && data.result.longitude) {
        processedPoints = [{
          latitude: data.result.latitude,
          longitude: data.result.longitude,
          altitude: data.result.altitude || 0,
          timestamp: Date.now()
        }];
      }
    }
  } catch (error) {
    console.error('Error parsing flight plan data:', error);
  }
  
  return processedPoints;
};

// Legacy function for backward compatibility
export const parseRouteData = (data: any): FlightTrackPoint[] => {
  // Try to parse as flown route first, then flight plan
  const flownRoute = parseFlownRouteData(data);
  if (flownRoute.length > 0) {
    return flownRoute;
  }
  
  return parseFlightPlanData(data);
};

// Merge historical and planned points (keeping for compatibility)
export const mergeRoutePoints = (
  historicalPoints: FlightTrackPoint[], 
  plannedPoints: FlightTrackPoint[]
): FlightTrackPoint[] => {
  
  if (historicalPoints.length > 0 && plannedPoints.length > 0) {
    console.log("Merging historical route with flight plan data");
    
    historicalPoints.sort((a, b) => a.timestamp - b.timestamp);
    plannedPoints.sort((a, b) => a.timestamp - b.timestamp);
    
    const lastHistorical = historicalPoints[historicalPoints.length - 1];
    
    const threshold = 0.01;
    const futurePoints = plannedPoints.filter(point => {
      const distance = Math.sqrt(
        Math.pow(point.latitude - lastHistorical.latitude, 2) + 
        Math.pow(point.longitude - lastHistorical.longitude, 2)
      );
      return distance > threshold;
    });
    
    console.log(`Found ${futurePoints.length} remaining waypoints beyond current position`);
    
    return [...historicalPoints, ...futurePoints];
  } 
  else if (historicalPoints.length > 0) {
    console.log("Using historical route data only");
    return historicalPoints;
  }
  else if (plannedPoints.length > 0) {
    console.log("Using flight plan data only");
    return plannedPoints;
  }
  
  return [];
};
