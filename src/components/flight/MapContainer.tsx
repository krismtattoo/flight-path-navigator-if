
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { toast } from "sonner";

interface MapContainerProps {
  onMapInit: (map: mapboxgl.Map) => void;
}

const MapContainer: React.FC<MapContainerProps> = ({ onMapInit }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11', // Light style for a bright map
        center: [0, 30], // Center on Atlantic for global view
        zoom: 2,
        minZoom: 1.5,
      });
      
      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // When the map is loaded, call the onMapInit callback
      map.current.on('load', () => {
        if (map.current) {
          onMapInit(map.current);
        }
      });
    } catch (error) {
      console.error("Failed to initialize map:", error);
      toast.error("Failed to initialize map. Please refresh the page.");
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [onMapInit]);

  return <div ref={mapContainer} className="absolute inset-0" />;
};

export default MapContainer;
