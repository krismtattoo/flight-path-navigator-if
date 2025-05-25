
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { FlightTrackPoint, Flight } from '@/services/flight';
import { filterValidRoutePoints } from '@/utils/routeUtils';

interface LeafletFlightRouteProps {
  map: L.Map;
  flownRoute: FlightTrackPoint[];
  flightPlan: FlightTrackPoint[];
  selectedFlight: Flight | null;
}

const LeafletFlightRoute: React.FC<LeafletFlightRouteProps> = ({ 
  map, 
  flownRoute, 
  flightPlan, 
  selectedFlight 
}) => {
  const routeLayersRef = useRef<L.LayerGroup | null>(null);
  
  // Initialize route layer group
  useEffect(() => {
    if (!map) return;
    
    routeLayersRef.current = L.layerGroup().addTo(map);
    
    return () => {
      if (routeLayersRef.current) {
        map.removeLayer(routeLayersRef.current);
      }
    };
  }, [map]);

  // Update routes when data changes
  useEffect(() => {
    if (!map || !routeLayersRef.current) return;
    
    // Clear existing route layers
    routeLayersRef.current.clearLayers();
    
    if ((!flownRoute || flownRoute.length === 0) && (!flightPlan || flightPlan.length === 0)) {
      return;
    }
    
    // Process route data
    const validFlownRoute = filterValidRoutePoints(flownRoute || []);
    const validFlightPlan = filterValidRoutePoints(flightPlan || []);
    
    console.log(`Rendering route: ${validFlownRoute.length} flown, ${validFlightPlan.length} planned points`);
    
    // Create flight plan line (white dashed)
    if (validFlightPlan.length > 1) {
      const flightPlanCoords: L.LatLngExpression[] = validFlightPlan.map(point => [point.latitude, point.longitude]);
      
      const flightPlanLine = L.polyline(flightPlanCoords, {
        color: '#ffffff',
        weight: 3,
        opacity: 0.8,
        dashArray: '10, 10'
      });
      
      routeLayersRef.current.addLayer(flightPlanLine);
    }
    
    // Create flown route line with altitude-based colors
    if (validFlownRoute.length > 1) {
      // For simplicity, we'll use segments with different colors based on altitude
      for (let i = 0; i < validFlownRoute.length - 1; i++) {
        const point1 = validFlownRoute[i];
        const point2 = validFlownRoute[i + 1];
        
        // Calculate color based on altitude
        const altitude = point1.altitude;
        let color = '#ff0000'; // Default red
        
        if (altitude >= 50000) color = '#6600ff'; // Purple
        else if (altitude >= 40000) color = '#0066ff'; // Blue
        else if (altitude >= 30000) color = '#00ffff'; // Cyan
        else if (altitude >= 20000) color = '#00ff66'; // Green
        else if (altitude >= 10000) color = '#66ff00'; // Light green
        else if (altitude >= 5000) color = '#ffff00'; // Yellow
        else if (altitude >= 1000) color = '#ff6600'; // Orange
        
        const segment = L.polyline(
          [[point1.latitude, point1.longitude], [point2.latitude, point2.longitude]], 
          {
            color: color,
            weight: 4,
            opacity: 0.9
          }
        );
        
        routeLayersRef.current.addLayer(segment);
      }
    }
    
    // Add destination waypoint (red circle)
    if (validFlightPlan.length > 0) {
      const destination = validFlightPlan[validFlightPlan.length - 1];
      const destinationMarker = L.circleMarker([destination.latitude, destination.longitude], {
        radius: 6,
        fillColor: '#F44336',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 1
      });
      
      routeLayersRef.current.addLayer(destinationMarker);
    }
    
    // Add intermediate waypoints (small white circles)
    if (validFlightPlan.length > 2) {
      for (let i = 1; i < validFlightPlan.length - 1; i++) {
        const waypoint = validFlightPlan[i];
        const waypointMarker = L.circleMarker([waypoint.latitude, waypoint.longitude], {
          radius: 3,
          fillColor: '#ffffff',
          color: '#666666',
          weight: 1,
          opacity: 1,
          fillOpacity: 1
        });
        
        routeLayersRef.current.addLayer(waypointMarker);
      }
    }
    
  }, [map, flownRoute, flightPlan, selectedFlight]);

  return null;
};

export default LeafletFlightRoute;
