import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { FlightTrackPoint, Flight } from '@/services/flight';
import { filterValidRoutePoints, createSmoothAltitudeSegments } from '@/utils/routeUtils';

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
  
  useEffect(() => {
    if (!map) return;
    
    routeLayersRef.current = L.layerGroup().addTo(map);
    
    return () => {
      if (routeLayersRef.current) {
        map.removeLayer(routeLayersRef.current);
      }
    };
  }, [map]);

  useEffect(() => {
    if (!map || !routeLayersRef.current) return;
    
    routeLayersRef.current.clearLayers();
    
    if ((!flownRoute || flownRoute.length === 0) && (!flightPlan || flightPlan.length === 0)) {
      return;
    }
    
    const validFlownRoute = filterValidRoutePoints(flownRoute || []);
    const validFlightPlan = filterValidRoutePoints(flightPlan || []);
    
    console.log(`Rendering ultra-smooth route: ${validFlownRoute.length} flown, ${validFlightPlan.length} planned points`);
    
    // Create flight plan line (white dashed)
    if (validFlightPlan.length > 1) {
      const flightPlanCoords: L.LatLngExpression[] = validFlightPlan.map(point => [point.latitude, point.longitude]);
      
      const flightPlanLine = L.polyline(flightPlanCoords, {
        color: '#ffffff',
        weight: 3,
        opacity: 0.85,
        dashArray: '8, 12',
        lineCap: 'round',
        lineJoin: 'round',
        smoothFactor: 5.0,
        noClip: true
      });
      
      routeLayersRef.current.addLayer(flightPlanLine);
    }
    
    // Create ultra-smooth flown route with Catmull-Rom splines
    if (validFlownRoute.length > 1) {
      console.log('Creating ultra-smooth spline-based route with perfect anti-aliasing...');
      
      const smoothSegments = createSmoothAltitudeSegments(validFlownRoute);
      
      console.log(`Generated ${smoothSegments.length} ultra-smooth spline segments`);
      
      // Group segments by color to reduce the number of polylines
      const colorGroups = new Map<string, L.LatLngExpression[]>();
      
      smoothSegments.forEach((segment) => {
        const [coord1, coord2] = segment.coordinates;
        const coords: L.LatLngExpression[] = [[coord1[1], coord1[0]], [coord2[1], coord2[0]]];
        
        if (!colorGroups.has(segment.color)) {
          colorGroups.set(segment.color, []);
        }
        
        // Connect segments of the same color
        const existingCoords = colorGroups.get(segment.color)!;
        if (existingCoords.length === 0) {
          existingCoords.push(...coords);
        } else {
          existingCoords.push(coords[1]); // Add only the end point to continue the line
        }
      });
      
      // Create optimized polylines for each color group
      colorGroups.forEach((coords, color) => {
        if (coords.length > 1) {
          const polyline = L.polyline(coords, {
            color: color,
            weight: 2.5, // Reduced from 4 to 2.5 for thinner line
            opacity: 0.95,
            lineCap: 'round',
            lineJoin: 'round',
            smoothFactor: 8.0,
            noClip: true,
            className: 'ultra-smooth-route'
          });
          
          routeLayersRef.current!.addLayer(polyline);
        }
      });
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
