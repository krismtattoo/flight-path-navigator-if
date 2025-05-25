
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
    // We'll get the map instance through a different approach
  };

  // Use a ref callback to get the map instance when MapContainer mounts
  const mapRefCallback = (mapInstance: L.Map | null) => {
    if (mapInstance && !mapRef.current) {
      console.log("🗺️ Leaflet map initialized via ref callback");
      mapRef.current = mapInstance;
      
      // Enable standard Leaflet interactions
      mapInstance.dragging.enable();
      mapInstance.touchZoom.enable();
      mapInstance.doubleClickZoom.enable();
      mapInstance.scrollWheelZoom.enable();
      mapInstance.boxZoom.enable();
      mapInstance.keyboard.enable();
      
      onMapInit(mapInstance);
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
        ref={mapRefCallback}
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
