import { toast } from "sonner";
import { API_KEY, BASE_URL, FlightTrackPoint } from "./types";
import { getServers, getServerIdByName } from "./serverService";
import { serverIdMap } from "./types";

// Get flight route for a specific flight - try multiple endpoint patterns
export async function getFlightRoute(serverName: string, flightId: string): Promise<FlightTrackPoint[]> {
  try {
    // Ensure we have server IDs
    if (Object.keys(serverIdMap).length === 0) {
      console.log("No server IDs available, fetching servers first");
      await getServers();
    }
    
    // Get the actual server ID
    const serverId = getServerIdByName(serverName);
    
    if (!serverId) {
      console.error(`No ID found for server: ${serverName}`);
      toast.error(`Server information not available for ${serverName}. Try refreshing the page.`);
      return [];
    }
    
    console.log(`Fetching flight route for flight ${flightId} on server ${serverId}`);
    
    // Define all possible endpoint patterns to try - expanded with more potential endpoints
    // Based on the documentation links shared by the user
    const endpointPatterns = [
      // Flight route API endpoints (historical track)
      `${BASE_URL}/flights/${serverId}/${flightId}/route`,
      `${BASE_URL}/flights/${serverId}/route/${flightId}`,
      `${BASE_URL}/flights/${serverId}/${flightId}/track`,
      `${BASE_URL}/sessions/${serverId}/flights/${flightId}/route`,
      `${BASE_URL}/sessions/${serverId}/flights/${flightId}/track`,
      // Flight plan API endpoints (planned route)
      `${BASE_URL}/flights/${serverId}/${flightId}/flightplan`,
      `${BASE_URL}/sessions/${serverId}/flights/${flightId}/flightplan`,
      `${BASE_URL}/flights/${serverId}/${flightId}/plan`,
      `${BASE_URL}/sessions/${serverId}/flights/${flightId}/plan`,
      `${BASE_URL}/flights/${serverId}/${flightId}/path`,
      `${BASE_URL}/sessions/${serverId}/flights/${flightId}/path`
    ];
    
    // Array to store all collected points
    let allPoints: FlightTrackPoint[] = [];
    let historicalPoints: FlightTrackPoint[] = [];
    let plannedPoints: FlightTrackPoint[] = [];
    
    // Try each endpoint pattern in sequence
    for (const endpoint of endpointPatterns) {
      try {
        console.log(`Attempting to fetch from endpoint: ${endpoint}`);
        const response = await fetch(endpoint, {
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Accept": "application/json"
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`API response from ${endpoint}:`, data);
          
          // Check if we have valid result data
          if (data && data.result) {
            // Handle array responses (route points)
            if (Array.isArray(data.result)) {
              console.log(`Found ${data.result.length} points from ${endpoint}`);
              
              // Convert to standard track point format if needed
              let processedPoints = data.result;
              
              // If this doesn't have lat/long but has coordinates format, transform
              if (data.result.length > 0 && !data.result[0].latitude && data.result[0].coordinates) {
                processedPoints = data.result.map((point: any) => ({
                  latitude: point.coordinates.latitude || point.coordinates.lat,
                  longitude: point.coordinates.longitude || point.coordinates.lng,
                  altitude: point.altitude || point.coordinates.altitude || 0,
                  timestamp: point.timestamp || Date.now() // Use timestamp or current time as fallback
                }));
              }
              
              // Make sure the points are sorted by timestamp
              if (processedPoints.length > 0 && processedPoints[0].timestamp) {
                processedPoints.sort((a: FlightTrackPoint, b: FlightTrackPoint) => a.timestamp - b.timestamp);
              }
              
              // Determine if this is likely historical or planned data based on the endpoint
              if (endpoint.includes('route') || endpoint.includes('track')) {
                historicalPoints = processedPoints.length > historicalPoints.length ? 
                                    processedPoints : historicalPoints;
              } else {
                plannedPoints = processedPoints.length > plannedPoints.length ? 
                                 processedPoints : plannedPoints;
              }
            } 
            // Handle object with route property
            else if (data.result.route && Array.isArray(data.result.route)) {
              console.log(`Found route property with ${data.result.route.length} points`);
              
              let routePoints = data.result.route.map((point: any) => ({
                latitude: point.latitude || (point.coordinates ? point.coordinates.latitude : 0),
                longitude: point.longitude || (point.coordinates ? point.coordinates.longitude : 0),
                altitude: point.altitude || (point.coordinates ? point.coordinates.altitude : 0),
                timestamp: point.timestamp || Date.now()
              }));
              
              plannedPoints = routePoints.length > plannedPoints.length ? 
                               routePoints : plannedPoints;
            }
            // Handle object with waypoints
            else if (data.result.waypoints && Array.isArray(data.result.waypoints)) {
              console.log(`Found waypoints with ${data.result.waypoints.length} points`);
              
              let waypointTimestampBase = Date.now();
              let routePoints = data.result.waypoints.map((point: any, index: number) => ({
                latitude: point.latitude || (point.coordinates ? point.coordinates.latitude : 0),
                longitude: point.longitude || (point.coordinates ? point.coordinates.longitude : 0),
                altitude: point.altitude || (point.coordinates ? point.coordinates.altitude : 0),
                timestamp: waypointTimestampBase + (index * 60000) // Fake timestamps spaced 1 minute apart
              }));
              
              plannedPoints = routePoints.length > plannedPoints.length ? 
                               routePoints : plannedPoints;
            }
            // Handle various flight plan formats
            else if (data.result.departure && data.result.destination) {
              console.log(`Found flight plan with departure ${data.result.departure} and destination ${data.result.destination}`);
              
              // Try to extract route points from various structures
              let routePoints: FlightTrackPoint[] = [];
              
              // Check for waypoints array
              if (data.result.waypoints && Array.isArray(data.result.waypoints)) {
                routePoints = data.result.waypoints.map((point: any, index: number) => ({
                  latitude: point.latitude || (point.coordinates ? point.coordinates.latitude : 0),
                  longitude: point.longitude || (point.coordinates ? point.coordinates.longitude : 0),
                  altitude: point.altitude || (point.coordinates ? point.coordinates.altitude : 0),
                  timestamp: Date.now() + (index * 60000) // Fake timestamps spaced 1 minute apart
                }));
              }
              
              if (routePoints.length > 0) {
                plannedPoints = routePoints.length > plannedPoints.length ? 
                                 routePoints : plannedPoints;
              }
            }
          }
        } else {
          console.log(`Endpoint ${endpoint} returned status ${response.status}`);
        }
      } catch (endpointError) {
        console.error(`Error trying endpoint ${endpoint}:`, endpointError);
        // Continue to try next endpoint
      }
    }
    
    // After trying all endpoints, combine historical and planned points
    console.log(`Historical points: ${historicalPoints.length}, Planned points: ${plannedPoints.length}`);
    
    // If we have both historical and planned data
    if (historicalPoints.length > 0 && plannedPoints.length > 0) {
      // Sort both by timestamp
      historicalPoints.sort((a, b) => a.timestamp - b.timestamp);
      plannedPoints.sort((a, b) => a.timestamp - b.timestamp);
      
      // If historical points already include some of the planned route, use that
      if (historicalPoints.length > plannedPoints.length) {
        console.log("Historical route includes more points than planned route");
        allPoints = historicalPoints;
      } else {
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
        allPoints = [...historicalPoints, ...futurePoints];
      }
    } 
    // If we only have historical data
    else if (historicalPoints.length > 0) {
      allPoints = historicalPoints;
    }
    // If we only have planned data
    else if (plannedPoints.length > 0) {
      allPoints = plannedPoints;
    }
    
    // After processing, check if we have any points
    if (allPoints.length > 0) {
      console.log(`Total route points collected: ${allPoints.length}`);
      return allPoints;
    }
    
    // If we reach here, none of the endpoints worked
    console.log("All endpoints failed to retrieve flight route data");
    toast.error("Could not load flight route data. The flight may not have track data available.");
    return [];
  } catch (error) {
    console.error("Failed to fetch flight route:", error);
    toast.error("Failed to load flight route. Please try again.");
    return [];
  }
}
