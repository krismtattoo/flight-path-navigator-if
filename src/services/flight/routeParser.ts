
import { FlightTrackPoint } from "./types";

// Process flight route data (actual flown route) into FlightTrackPoint array
export const parseFlownRouteData = (data: any): FlightTrackPoint[] => {
  let processedPoints: FlightTrackPoint[] = [];
  
  try {
    console.log('Raw flown route data:', data);
    
    // Handle flight route API response according to documentation
    if (data?.result && Array.isArray(data.result)) {
      console.log(`Found ${data.result.length} flown route points from flight route API`);
      
      processedPoints = data.result
        .filter((point: any) => point && 
                 typeof point.latitude === 'number' && 
                 typeof point.longitude === 'number')
        .map((point: any) => ({
          latitude: point.latitude,
          longitude: point.longitude,
          altitude: point.altitude || 0,
          timestamp: point.date ? new Date(point.date).getTime() : Date.now()
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
// Based on official API documentation: result contains flightPlanItems array
export const parseFlightPlanData = (data: any): FlightTrackPoint[] => {
  let processedPoints: FlightTrackPoint[] = [];
  
  try {
    console.log('Raw flight plan data:', data);
    
    // Handle flight plan API response according to official documentation
    if (data?.result) {
      const result = data.result;
      
      // Parse flightPlanItems array (main structure from API docs)
      if (result.flightPlanItems && Array.isArray(result.flightPlanItems)) {
        console.log(`Found flight plan with ${result.flightPlanItems.length} flight plan items`);
        
        let waypointTimestampBase = Date.now();
        
        // Process each flight plan item
        result.flightPlanItems.forEach((item: any, index: number) => {
          if (item && item.location && 
              typeof item.location.latitude === 'number' && 
              typeof item.location.longitude === 'number') {
            
            processedPoints.push({
              latitude: item.location.latitude,
              longitude: item.location.longitude,
              altitude: item.altitude && item.altitude > 0 ? item.altitude : item.location.altitude || 0,
              timestamp: waypointTimestampBase + (index * 60000), // Fake timestamps spaced 1 minute apart
              waypointName: item.name || item.identifier || `WP${index + 1}`
            });
          }
        });
        
        console.log(`Successfully processed ${processedPoints.length} waypoints from flightPlanItems`);
      }
      
      // Fallback: Parse deprecated waypoints array if present (for backwards compatibility)
      else if (result.waypoints && Array.isArray(result.waypoints)) {
        console.log(`Found flight plan with ${result.waypoints.length} waypoints (deprecated format)`);
        
        let waypointTimestampBase = Date.now();
        processedPoints = result.waypoints
          .filter((waypoint: any) => waypoint && 
                   typeof waypoint.latitude === 'number' && 
                   typeof waypoint.longitude === 'number')
          .map((waypoint: any, index: number) => ({
            latitude: waypoint.latitude,
            longitude: waypoint.longitude,
            altitude: waypoint.altitude || 0,
            timestamp: waypointTimestampBase + (index * 60000), // Fake timestamps spaced 1 minute apart
            waypointName: waypoint.name || `WP${index + 1}`
          }));
      }
      
      // Handle case where we might have departure and destination coordinates directly
      else if (result.departure || result.destination) {
        console.log(`Found flight plan with departure and/or destination coordinates`);
        
        const points = [];
        
        // Add departure point if coordinates are available
        if (result.departure && 
            typeof result.departure.latitude === 'number' &&
            typeof result.departure.longitude === 'number') {
          points.push({
            latitude: result.departure.latitude,
            longitude: result.departure.longitude,
            altitude: 0,
            timestamp: Date.now(),
            waypointName: result.departure.name || result.departure.icao || 'DEP'
          });
        }
        
        // Add destination point if coordinates are available
        if (result.destination && 
            typeof result.destination.latitude === 'number' &&
            typeof result.destination.longitude === 'number') {
          points.push({
            latitude: result.destination.latitude,
            longitude: result.destination.longitude,
            altitude: 0,
            timestamp: Date.now() + 60000,
            waypointName: result.destination.name || result.destination.icao || 'ARR'
          });
        }
        
        processedPoints = points;
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
