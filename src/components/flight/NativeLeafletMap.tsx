
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

    console.log("🗺️ Initializing minimalist elegant dark blue map with OpenStreetMap");

    // Create the map
    const map = L.map(mapContainer.current, {
      center: [51.0, 10.5],
      zoom: 5,
      zoomControl: true,
      preferCanvas: true,
    });

    // Use OpenStreetMap with custom styling for minimalist blue look
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
      className: 'minimalist-blue-tiles',
    }).addTo(map);

    // Enable all interactions
    map.dragging.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
    map.scrollWheelZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();

    mapInstance.current = map;

    console.log("🗺️ Minimalist elegant dark blue map initialized successfully with OpenStreetMap");
    onMapInit(map);

    // Cleanup function
    return () => {
      if (mapInstance.current) {
        console.log("🗑️ Cleaning up minimalist map");
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [onMapInit]);

  return (
    <div className="absolute inset-0 z-0">
      {/* Gradient Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#1e3a8a] to-[#0f172a] z-0"></div>
      
      <div 
        ref={mapContainer} 
        className="w-full h-full minimalist-elegant-map relative z-10"
        style={{ minHeight: '400px' }}
      />
      
      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/20 via-transparent to-[#1e3a8a]/10 pointer-events-none z-20"></div>
    </div>
  );
};

export default NativeLeafletMap;
