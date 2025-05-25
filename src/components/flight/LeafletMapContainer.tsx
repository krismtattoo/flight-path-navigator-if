
import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LeafletMapContainerProps {
  onMapInit: (map: L.Map) => void;
}

const LeafletMapContainer: React.FC<LeafletMapContainerProps> = ({ onMapInit }) => {
  const mapRef = useRef<L.Map | null>(null);

  const handleMapReady = () => {
    console.log("🗺️ Leaflet map ready event fired");
    
    // Access the map instance through the ref
    const mapContainer = document.querySelector('.leaflet-container') as HTMLElement;
    if (mapContainer && (mapContainer as any)._leaflet_id) {
      const map = (window as any).L.map._layers[(mapContainer as any)._leaflet_id];
      
      if (map && !mapRef.current) {
        console.log("🗺️ Leaflet map initialized via whenReady");
        mapRef.current = map;
        
        // Enable standard Leaflet interactions
        map.dragging.enable();
        map.touchZoom.enable();
        map.doubleClickZoom.enable();
        map.scrollWheelZoom.enable();
        map.boxZoom.enable();
        map.keyboard.enable();
        
        onMapInit(map);
      }
    }
  };

  // Use a different approach - access via useMap hook pattern
  const initializeMap = () => {
    // Find the map container and get the Leaflet map instance
    const containers = document.querySelectorAll('.leaflet-container');
    const container = containers[containers.length - 1] as any; // Get the latest one
    
    if (container && container._leaflet_map && !mapRef.current) {
      const map = container._leaflet_map;
      console.log("🗺️ Leaflet map initialized");
      mapRef.current = map;
      
      // Enable standard Leaflet interactions
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
      
      onMapInit(map);
    }
  };

  useEffect(() => {
    // Try to initialize after a short delay to ensure the map is ready
    const timer = setTimeout(initializeMap, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={[51.0, 10.5]}
        zoom={5}
        className="w-full h-full"
        whenReady={handleMapReady}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
      </MapContainer>
    </div>
  );
};

export default LeafletMapContainer;
