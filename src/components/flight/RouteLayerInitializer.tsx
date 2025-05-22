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
        
        // Add route traveled line - dark blue
        map.addLayer({
          id: 'route-traveled',
          type: 'line',
          source: 'route',
          filter: ['==', ['get', 'type'], 'traveled'],
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#2271B3',
            'line-width': 4,
            'line-opacity': 0.8
          }
        });

        // Add route remaining line - light blue
        map.addLayer({
          id: 'route-remaining',
          type: 'line',
          source: 'route',
          filter: ['==', ['get', 'type'], 'remaining'],
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#5DADEC',
            'line-width': 4,
            'line-opacity': 0.6
          }
        });
        
        // Add departure waypoint (green circle)
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
            'circle-color': '#00AA00',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });
        
        // Add destination waypoint (red circle)
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
            'circle-color': '#AA0000',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
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
