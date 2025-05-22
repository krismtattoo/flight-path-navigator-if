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
      // Check if source already exists to prevent duplicate sources
      if (!map.getSource('route')) {
        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: []
            }
          }
        });
        
        map.addLayer({
          id: 'route-traveled',
          type: 'line',
          source: 'route',
          filter: ['==', 'type', 'traveled'],
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

        map.addLayer({
          id: 'route-remaining',
          type: 'line',
          source: 'route',
          filter: ['==', 'type', 'remaining'],
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#5DADEC',
            'line-width': 4,
            'line-opacity': 0.6,
            'line-dasharray': [0, 2, 2]
          }
        });
        
        // Add waypoints layer
        map.addLayer({
          id: 'waypoints',
          type: 'circle',
          source: 'route',
          filter: ['==', 'type', 'waypoint'],
          paint: {
            'circle-radius': 4,
            'circle-color': '#2271B3',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });
      }
      
      const routeSource = map.getSource('route') as mapboxgl.GeoJSONSource;
      onSourceReady(routeSource);
    };

    // If map is already loaded, initialize layers
    if (map.loaded()) {
      initializeRouteLayers();
    }
    
    // Otherwise, wait for the load event
    map.on('load', initializeRouteLayers);
    
  }, [map, onSourceReady]);
  
  return null; // This component doesn't render anything itself
};

export default RouteLayerInitializer;
