import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Flight, FlightTrackPoint } from '@/services/flight';
import { getFlightRoute } from '@/services/flight';
import { toast } from "sonner";

// Import Leaflet types
import L from 'leaflet';

// Import our components
import ServerSelection from './flight/ServerSelection';
import FlightDetails from './flight/FlightDetails';
import FlightCount from './flight/FlightCount';
import LoadingIndicator from './flight/LoadingIndicator';
import MapStyles from './flight/MapStyles';
import NativeLeafletMap from './flight/NativeLeafletMap';
import LeafletAircraftMarker from './flight/LeafletAircraftMarker';
import LeafletFlightRoute from './flight/LeafletFlightRoute';

// Import custom hook
import { useFlightData } from '@/hooks/useFlightData';

const FlightMap: React.FC = () => {
  const { 
    activeServer, 
    servers, 
    flights, 
    loading, 
    initializing, 
    handleServerChange 
  } = useFlightData();
  
  // Memoize flights to prevent unnecessary re-renders
  const memoizedFlights = useMemo(() => flights, [flights]);
  
  // Debug log for flights changes
  useEffect(() => {
    console.log(`🛩️ FlightMap - Flights updated: ${flights.length} flights`);
    if (flights.length > 0) {
      console.log(`📋 First 3 flights: ${flights.slice(0, 3).map(f => f.flightId).join(', ')}`);
    }
  }, [flights]);
  
  const [map, setMap] = useState<L.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [flownRoute, setFlownRoute] = useState<FlightTrackPoint[]>([]);
  const [flightPlan, setFlightPlan] = useState<FlightTrackPoint[]>([]);
  
  const handleMapInit = useCallback((initializedMap: L.Map) => {
    console.log("🗺️ Native Leaflet map initialized in FlightMap component");
    
    setMap(initializedMap);
    setMapLoaded(true);
  }, []);

  // Optimized flight selection handler
  const handleFlightSelect = useCallback(async (flight: Flight) => {
    console.log(`🎯 Flight selected: ${flight.flightId}`);
    setSelectedFlight(flight);
    
    if (!activeServer) return;
    
    try {
      // Log debug information
      console.log(`🔍 Fetching route for flight ${flight.flightId} on server ${activeServer.id}`);
      
      const routeData = await getFlightRoute(activeServer.id, flight.flightId);
      console.log(`📍 Retrieved flight route data:`, routeData);
      
      setFlownRoute(routeData.flownRoute);
      setFlightPlan(routeData.flightPlan);
      
      // Focus map on flight with smooth animation
      if (map && flight) {
        map.flyTo([flight.latitude, flight.longitude], 9, {
          animate: true,
          duration: 1.0
        });
      }
    } catch (error) {
      console.error("❌ Failed to fetch flight route:", error);
      toast.error("Failed to load flight route.");
    }
  }, [activeServer, map]);

  // Optimized close handler
  const handleCloseFlightDetails = useCallback(() => {
    console.log("🔄 Closing flight details");
    setSelectedFlight(null);
    setFlownRoute([]);
    setFlightPlan([]);
  }, []);

  return (
    <div className="relative h-screen w-full bg-[#151920]">
      {/* Server Selection Tabs */}
      <ServerSelection 
        servers={servers} 
        onServerChange={handleServerChange} 
      />
      
      {/* Loading indicator */}
      {(loading || initializing || !mapLoaded) && (
        <LoadingIndicator 
          message={initializing ? "Connecting to Infinite Flight..." : 
                  !mapLoaded ? "Loading map..." : 
                  "Loading flights..."} 
        />
      )}
      
      {/* Flight Details */}
      {selectedFlight && activeServer && (
        <FlightDetails 
          flight={selectedFlight} 
          serverID={activeServer.id} 
          onClose={handleCloseFlightDetails} 
        />
      )}
      
      {/* Flight Count */}
      <FlightCount count={flights.length} />
      
      {/* Native Leaflet Map Container */}
      <NativeLeafletMap onMapInit={handleMapInit} />
      
      {/* Aircraft Markers and Flight Route - only render when map is loaded */}
      {map && mapLoaded && (
        <>
          <LeafletAircraftMarker 
            map={map} 
            flights={memoizedFlights} 
            onFlightSelect={handleFlightSelect}
            selectedFlightId={selectedFlight?.flightId || null}
          />
          <LeafletFlightRoute 
            map={map} 
            flownRoute={flownRoute}
            flightPlan={flightPlan}
            selectedFlight={selectedFlight} 
          />
        </>
      )}
      
      {/* Map Styles */}
      <MapStyles />
    </div>
  );
};

export default React.memo(FlightMap);
