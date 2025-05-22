
import React, { useState, useCallback } from 'react';
import { Flight, FlightTrackPoint } from '@/services/flight';
import { getFlightRoute } from '@/services/flight';
import { toast } from "sonner";

// Import mapbox
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Import our components
import ServerSelection from './flight/ServerSelection';
import FlightDetails from './flight/FlightDetails';
import AircraftMarker from './flight/AircraftMarker';
import FlightRoute from './flight/FlightRoute';
import FlightCount from './flight/FlightCount';
import LoadingIndicator from './flight/LoadingIndicator';
import MapStyles from './flight/MapStyles';
import MapContainer from './flight/MapContainer';

// Import custom hook
import { useFlightData } from '@/hooks/useFlightData';

// Mapbox token - updating to user's token
mapboxgl.accessToken = 'pk.eyJ1Ijoia3Jpc210YXR0b28iLCJhIjoiY2x0bGh2cjAxMTl2MzJtcDY2cTR1aXY4dCJ9.qG3BOVZeFRKcmNgtiMd9uw';

const FlightMap: React.FC = () => {
  const { 
    activeServer, 
    servers, 
    flights, 
    loading, 
    initializing, 
    handleServerChange 
  } = useFlightData();
  
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [flightRoute, setFlightRoute] = useState<FlightTrackPoint[]>([]);
  
  const handleMapInit = useCallback((initializedMap: mapboxgl.Map) => {
    setMap(initializedMap);
  }, []);

  // Handle flight selection
  const handleFlightSelect = async (flight: Flight) => {
    setSelectedFlight(flight);
    
    if (!activeServer) return;
    
    try {
      // Log debug information
      console.log(`Fetching route for flight ${flight.flightId} on server ${activeServer.id}`);
      
      const routeData = await getFlightRoute(activeServer.id, flight.flightId);
      console.log(`Retrieved flight route data:`, routeData);
      
      setFlightRoute(routeData);
      
      // Center and zoom to the flight
      if (map && flight) {
        map.flyTo({
          center: [flight.longitude, flight.latitude],
          zoom: 6,
          speed: 1.2
        });
      }
    } catch (error) {
      console.error("Failed to fetch flight route:", error);
      toast.error("Failed to load flight route.");
    }
  };

  return (
    <div className="relative h-screen w-full">
      {/* Server Selection Tabs */}
      <ServerSelection 
        servers={servers} 
        onServerChange={handleServerChange} 
      />
      
      {/* Loading indicator */}
      {(loading || initializing) && (
        <LoadingIndicator 
          message={initializing ? "Connecting to Infinite Flight..." : "Loading flights..."} 
        />
      )}
      
      {/* Flight Details */}
      {selectedFlight && activeServer && (
        <FlightDetails 
          flight={selectedFlight} 
          serverID={activeServer.id} 
          onClose={() => {
            setSelectedFlight(null);
            setFlightRoute([]);
          }} 
        />
      )}
      
      {/* Flight Count */}
      <FlightCount count={flights.length} />
      
      {/* Map Container */}
      <MapContainer onMapInit={handleMapInit} />
      
      {/* Aircraft Markers */}
      {map && (
        <>
          <AircraftMarker 
            map={map} 
            flights={flights} 
            onFlightSelect={handleFlightSelect} 
          />
          <FlightRoute 
            map={map} 
            routePoints={flightRoute} 
            selectedFlight={selectedFlight} 
          />
        </>
      )}
      
      {/* Map Styles */}
      <MapStyles />
    </div>
  );
};

export default FlightMap;
