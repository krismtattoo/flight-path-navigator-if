
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

interface StaticBlueMapProps {
  onMapInit: (map: L.Map) => void;
}

const StaticBlueMap: React.FC<StaticBlueMapProps> = ({ onMapInit }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    console.log("🗺️ Initializing static blue world map");

    // Create the map without any tile layers
    const map = L.map(mapContainer.current, {
      center: [30, 0],
      zoom: 3,
      zoomControl: true,
      preferCanvas: true,
      attributionControl: false,
    });

    // Enable all interactions
    map.dragging.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
    map.scrollWheelZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();

    mapInstance.current = map;

    console.log("🗺️ Static blue world map initialized successfully");
    onMapInit(map);

    // Cleanup function
    return () => {
      if (mapInstance.current) {
        console.log("🗑️ Cleaning up static blue map");
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [onMapInit]);

  return (
    <div className="absolute inset-0 z-0">
      {/* Static Blue World Map Background */}
      <div className="absolute inset-0 static-blue-world-map z-0"></div>
      
      {/* World Map SVG Overlay */}
      <div className="absolute inset-0 world-map-overlay z-5"></div>
      
      <div 
        ref={mapContainer} 
        className="w-full h-full static-elegant-map relative z-10"
        style={{ minHeight: '400px' }}
      />
      
      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/10 via-transparent to-transparent pointer-events-none z-20"></div>
    </div>
  );
};

export default StaticBlueMap;
