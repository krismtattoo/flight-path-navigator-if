
import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface MapContainerProps {
  onMapInit: (map: mapboxgl.Map) => void;
}

const MapContainer: React.FC<MapContainerProps> = ({ onMapInit }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  
  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11', // Heller Stil
      center: [10.5, 51.0], // Zentriert auf Deutschland
      zoom: 5,
      projection: 'mercator'
    });
    
    // Add navigation controls and disable rotation
    map.addControl(new mapboxgl.NavigationControl({
      showCompass: false
    }), 'top-right');
    
    // Disable map rotation
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();
    
    // Call the onMapInit callback when map is loaded
    map.on('load', () => {
      onMapInit(map);
    });
    
    // Cleanup function
    return () => {
      map.remove();
    };
  }, [onMapInit]);

  return (
    <div ref={mapContainer} className="absolute inset-0 z-0" />
  );
};

export default MapContainer;
