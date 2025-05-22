
import React, { useState, useEffect, useRef } from 'react';
import { toast } from "sonner";
import { getFlights, getFlightRoute, getServers, SERVER_TYPES, Flight, FlightTrackPoint, ServerInfo } from '@/services/flightApi';

// For mapbox
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Import our new components
import ServerSelection from './flight/ServerSelection';
import FlightDetails from './flight/FlightDetails';
import AircraftMarker from './flight/AircraftMarker';
import FlightRoute from './flight/FlightRoute';
import FlightCount from './flight/FlightCount';
import LoadingIndicator from './flight/LoadingIndicator';
import MapStyles from './flight/MapStyles';

// Mapbox token - updating to user's token
mapboxgl.accessToken = 'pk.eyJ1Ijoia3Jpc210YXR0b28iLCJhIjoiY2x0bGh2cjAxMTl2MzJtcDY2cTR1aXY4dCJ9.qG3BOVZeFRKcmNgtiMd9uw';

interface Server {
  id: string;
  name: string;
}

const FlightMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  
  const [activeServer, setActiveServer] = useState<Server | null>(null);
  const [servers, setServers] = useState<Server[]>([
    { id: "casual", name: SERVER_TYPES.CASUAL },
    { id: "training", name: SERVER_TYPES.TRAINING },
    { id: "expert", name: SERVER_TYPES.EXPERT }
  ]);
  const [availableServers, setAvailableServers] = useState<ServerInfo[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [flightRoute, setFlightRoute] = useState<FlightTrackPoint[]>([]);
  const serversInitialized = useRef(false);
  
  // Initialize map
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
  }, []);

  // Load available servers on mount
  useEffect(() => {
    const fetchAvailableServers = async () => {
      setInitializing(true);
      try {
        const serverData = await getServers();
        setAvailableServers(serverData);
        serversInitialized.current = true;
        
        // Set default server once we have server data
        if (serverData.length > 0) {
          // Wait a bit to ensure server mappings are set
          setTimeout(() => {
            setActiveServer({ id: "casual", name: SERVER_TYPES.CASUAL });
          }, 500);
        }
      } catch (error) {
        console.error("Failed to fetch available servers", error);
        toast.error("Failed to connect to Infinite Flight API.");
      } finally {
        setInitializing(false);
      }
    };

    fetchAvailableServers();
  }, []);

  // Load flights for active server
  useEffect(() => {
    const fetchFlights = async () => {
      if (!activeServer) return;
      
      setLoading(true);
      try {
        // Make sure server IDs are initialized before fetching flights
        if (!serversInitialized.current) {
          await getServers();
          serversInitialized.current = true;
        }
        
        console.log(`Fetching flights for server: ${activeServer.id}`);
        const flightData = await getFlights(activeServer.id);
        console.log(`Retrieved ${flightData.length} flights`);
        setFlights(flightData);
        
        // Clear selected flight when changing server
        setSelectedFlight(null);
        setFlightRoute([]);
      } catch (error) {
        console.error("Failed to fetch flights", error);
        toast.error("Failed to load flights for this server.");
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
    
    // Poll for updated flight data every 15 seconds
    const interval = setInterval(fetchFlights, 15000);
    return () => clearInterval(interval);
  }, [activeServer]);

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
      if (map.current && flight) {
        map.current.flyTo({
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

  // Handle server change
  const handleServerChange = (serverId: string) => {
    console.log(`Selected server: ${serverId}`);
    const server = servers.find(s => s.id === serverId);
    if (server) setActiveServer(server);
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
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Aircraft Markers */}
      {map.current && (
        <>
          <AircraftMarker 
            map={map.current} 
            flights={flights} 
            onFlightSelect={handleFlightSelect} 
          />
          <FlightRoute 
            map={map.current} 
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
