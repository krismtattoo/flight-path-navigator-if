
import { useCallback, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

export function useRouteSource() {
  const routeRef = useRef<mapboxgl.GeoJSONSource | null>(null);
  
  // Register the route source reference
  const handleSourceReady = useCallback((source: mapboxgl.GeoJSONSource) => {
    routeRef.current = source;
  }, []);

  return {
    routeRef,
    handleSourceReady
  };
}
