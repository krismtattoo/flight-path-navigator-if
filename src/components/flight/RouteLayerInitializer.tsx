
import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface RouteLayerInitializerProps {
  map: mapboxgl.Map;
  onSourceReady: (source: mapboxgl.GeoJSONSource) => void;
}

const RouteLayerInitializer: React.FC<RouteLayerInitializerProps> = ({ map, onSourceReady }) => {
  useEffect(() => {
    if (!map) return;
    
    const initializeRouteLayers = () => {
      console.log("Initializing route layers");
      
      // Check if source already exists to prevent duplicate sources
      if (!map.getSource('route')) {
        console.log("Adding route source and layers");
        
        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        });
        
        // Add flight plan line (white, like in the reference image)
        map.addLayer({
          id: 'route-flightplan',
          type: 'line',
          source: 'route',
          filter: ['==', ['get', 'type'], 'flightplan'],
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#ffffff',
            'line-width': 3,
            'line-opacity': 0.8,
            'line-dasharray': [2, 2] // Dashed white line for flight plan
          }
        });

        // Add flown route line (colored, like in the reference image)
        map.addLayer({
          id: 'route-flown',
          type: 'line',
          source: 'route',
          filter: ['==', ['get', 'type'], 'flown'],
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#00ff88', // Bright green for flown route
            'line-width': 4,
            'line-opacity': 0.9
          }
        });
        
        // Departure waypoint (green)
        map.addLayer({
          id: 'route-waypoint-departure',
          type: 'circle',
          source: 'route',
          filter: ['all', 
            ['==', ['get', 'type'], 'waypoint'],
            ['==', ['get', 'waypointType'], 'departure']
          ],
          paint: {
            'circle-radius': 6,
            'circle-color': '#4CAF50',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });
        
        // Destination waypoint (red)
        map.addLayer({
          id: 'route-waypoint-destination',
          type: 'circle',
          source: 'route',
          filter: ['all', 
            ['==', ['get', 'type'], 'waypoint'],
            ['==', ['get', 'waypointType'], 'destination']
          ],
          paint: {
            'circle-radius': 6,
            'circle-color': '#F44336',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });
        
        // Current position waypoint (blue)
        map.addLayer({
          id: 'route-waypoint-current',
          type: 'circle',
          source: 'route',
          filter: ['all', 
            ['==', ['get', 'type'], 'waypoint'],
            ['==', ['get', 'waypointType'], 'current']
          ],
          paint: {
            'circle-radius': 5,
            'circle-color': '#2196F3',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });

        // Intermediate waypoints (small white circles)
        map.addLayer({
          id: 'route-waypoint-intermediate',
          type: 'circle',
          source: 'route',
          filter: ['all', 
            ['==', ['get', 'type'], 'waypoint'],
            ['==', ['get', 'waypointType'], 'intermediate']
          ],
          paint: {
            'circle-radius': 3,
            'circle-color': '#ffffff',
            'circle-stroke-width': 1,
            'circle-stroke-color': '#666666'
          }
        });
      }
      
      const routeSource = map.getSource('route') as mapboxgl.GeoJSONSource;
      console.log("Route source initialized, calling onSourceReady");
      onSourceReady(routeSource);
    };

    // If map is already loaded, initialize layers
    if (map.loaded()) {
      console.log("Map already loaded, initializing layers");
      initializeRouteLayers();
    } else {
      // Otherwise, wait for the load event
      console.log("Map not loaded yet, waiting for load event");
      map.on('load', initializeRouteLayers);
    }
    
    // Cleanup function
    return () => {
      map.off('load', initializeRouteLayers);
    };
    
  }, [map, onSourceReady]);
  
  return null; // This component doesn't render anything itself
};

export default RouteLayerInitializer;
