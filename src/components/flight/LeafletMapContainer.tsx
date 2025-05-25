
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
    
    if (mapRef.current && !mapRef.current._container) {
      console.log("🗺️ Leaflet map initialized via whenReady");
      
      // Enable standard Leaflet interactions
      mapRef.current.dragging.enable();
      mapRef.current.touchZoom.enable();
      mapRef.current.doubleClickZoom.enable();
      mapRef.current.scrollWheelZoom.enable();
      mapRef.current.boxZoom.enable();
      mapRef.current.keyboard.enable();
      
      onMapInit(mapRef.current);
    }
  };

  // Use ref callback to capture the map instance
  const setMapRef = (map: L.Map | null) => {
    if (map && !mapRef.current) {
      console.log("🗺️ Leaflet map initialized via ref");
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
        ref={setMapRef}
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
