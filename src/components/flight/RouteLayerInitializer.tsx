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

        // Add flown route line with altitude-based color gradient
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
            'line-color': [
              'interpolate',
              ['linear'],
              ['get', 'altitude'],
              0, '#ff0000',        // Red for ground level (0 ft)
              1000, '#ff6600',     // Orange for low altitude (1000 ft)
              5000, '#ffff00',     // Yellow for low cruise (5000 ft)
              10000, '#66ff00',    // Light green for medium altitude (10000 ft)
              20000, '#00ff66',    // Green for high altitude (20000 ft)
              30000, '#00ffff',    // Cyan for cruise altitude (30000 ft)
              40000, '#0066ff',    // Blue for high cruise (40000 ft)
              50000, '#6600ff'     // Purple for very high altitude (50000+ ft)
            ],
            'line-width': [
              'interpolate',
              ['linear'],
              ['zoom'],
              5, 2,
              10, 4,
              15, 6
            ],
            'line-opacity': 0.9
          }
        });
        
        // Only keep destination waypoint (red)
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
