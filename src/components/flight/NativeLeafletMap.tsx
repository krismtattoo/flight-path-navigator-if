
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface NativeLeafletMapProps {
  onMapInit: (map: L.Map) => void;
}

const NativeLeafletMap: React.FC<NativeLeafletMapProps> = ({ onMapInit }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    console.log("🗺️ Initializing native Leaflet map with CartoDB Positron light design");

    // Create the map
    const map = L.map(mapContainer.current, {
      center: [51.0, 10.5],
      zoom: 5,
      zoomControl: true,
      preferCanvas: true, // Better performance for many markers
    });

    // Add CartoDB Positron tile layer (very light and clean design)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    // Enable all interactions
    map.dragging.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
    map.scrollWheelZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();

    mapInstance.current = map;

    console.log("🗺️ Native Leaflet map with CartoDB Positron light design initialized successfully");
    onMapInit(map);

    // Cleanup function
    return () => {
      if (mapInstance.current) {
        console.log("🗑️ Cleaning up native Leaflet map");
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [onMapInit]);

  return (
    <div className="absolute inset-0 z-0">
      <div 
        ref={mapContainer} 
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};

export default NativeLeafletMap;
