
import React, { useRef } from 'react';
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

  const handleMapCreated = (map: L.Map) => {
    console.log("🗺️ Leaflet map initialized successfully");
    
    mapRef.current = map;
    
    // Enable standard Leaflet interactions with null checks
    if (map && map.dragging) map.dragging.enable();
    if (map && map.touchZoom) map.touchZoom.enable();
    if (map && map.doubleClickZoom) map.doubleClickZoom.enable();
    if (map && map.scrollWheelZoom) map.scrollWheelZoom.enable();
    if (map && map.boxZoom) map.boxZoom.enable();
    if (map && map.keyboard) map.keyboard.enable();
    
    onMapInit(map);
  };

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={[51.0, 10.5]}
        zoom={5}
        className="w-full h-full"
        zoomControl={true}
        whenCreated={handleMapCreated}
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
