
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
        style: {
          version: 8,
          sources: {
            'osm-tiles': {
              type: 'raster',
              tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                      'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                      'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors'
            }
          },
          layers: [
            {
              id: 'osm-tiles',
              type: 'raster',
              source: 'osm-tiles',
              minzoom: 0,
              maxzoom: 19
            }
          ]
        },
        center: [0, 30], // Center on Atlantic for global view
        zoom: 2,
        minZoom: 1.5,
        projection: 'mercator', // Explicitly set to mercator for flat map
        renderWorldCopies: true, // Show multiple copies of the world
        trackResize: true, // Automatically resize when window resizes
        pitchWithRotate: false, // Disable pitch with rotate for smoother experience
        bearingSnap: 0, // Disable snapping to north during rotation
        dragRotate: false, // Disable rotation to prevent disorientation
        preserveDrawingBuffer: true, // Improve rendering consistency
      });
      
      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl({
        showCompass: false, // Hide compass since we disabled rotation
      }), 'top-right');

      // Add attribution control
      map.current.addControl(new mapboxgl.AttributionControl({
        customAttribution: '© OpenStreetMap contributors'
      }));

      // Disable map rotation using keyboard and touch rotation
      map.current.keyboard.disableRotation();
      map.current.touchZoomRotate.disableRotation();

      // Improve rendering performance
      map.current.on('movestart', () => {
        if (map.current) {
          // Optimize rendering during map movement
          map.current.getCanvas().style.willChange = 'transform';
          
          // Pause marker updates during movement for better performance
          map.current.getCanvas().classList.add('moving');
        }
      });
      
      map.current.on('moveend', () => {
        if (map.current) {
          // Reset optimization after movement ends
          map.current.getCanvas().style.willChange = 'auto';
          
          // Resume marker updates after movement
          map.current.getCanvas().classList.remove('moving');
        }
      });

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
