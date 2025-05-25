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

  // Update routes when data changes with ultra-smooth curved transitions
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
    
    console.log(`Rendering smooth curved route: ${validFlownRoute.length} flown, ${validFlightPlan.length} planned points`);
    
    // Create flight plan line (white dashed) - keep this as straight lines
    if (validFlightPlan.length > 1) {
      const flightPlanCoords: L.LatLngExpression[] = validFlightPlan.map(point => [point.latitude, point.longitude]);
      
      const flightPlanLine = L.polyline(flightPlanCoords, {
        color: '#ffffff',
        weight: 3,
        opacity: 0.8,
        dashArray: '10, 10',
        lineCap: 'round',
        lineJoin: 'round'
      });
      
      routeLayersRef.current.addLayer(flightPlanLine);
    }
    
    // Create ultra-smooth flown route with curved interpolation
    if (validFlownRoute.length > 1) {
      console.log('Creating ultra-smooth curved altitude-based route segments...');
      
      // Create smooth segments with color interpolation
      const smoothSegments = createSmoothAltitudeSegments(validFlownRoute);
      
      console.log(`Generated ${smoothSegments.length} ultra-smooth curved segments for route visualization`);
      
      // Add each smooth curved segment to the map
      smoothSegments.forEach((segment, index) => {
        const [coord1, coord2] = segment.coordinates;
        
        const polyline = L.polyline(
          [[coord1[1], coord1[0]], [coord2[1], coord2[0]]], 
          {
            color: segment.color,
            weight: 5,
            opacity: segment.opacity,
            lineCap: 'round',
            lineJoin: 'round',
            smoothFactor: 1.5, // Enhanced smoothing
            noClip: false
          }
        );
        
        routeLayersRef.current!.addLayer(polyline);
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
