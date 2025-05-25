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
import StaticBlueMap from './flight/StaticBlueMap';

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
  
  // Critical: Track selection in progress to prevent race conditions
  const [selectionInProgress, setSelectionInProgress] = useState<string | null>(null);
  
  const handleMapInit = useCallback((initializedMap: L.Map) => {
    console.log("🗺️ Static blue map initialized in FlightMap component");
    
    setMap(initializedMap);
    setMapLoaded(true);
  }, []);

  // Improved flight selection handler with immediate state protection
  const handleFlightSelect = useCallback(async (flight: Flight) => {
    console.log(`🎯 Flight selected: ${flight.flightId} - Starting selection process`);
    
    // CRITICAL: Set selection in progress IMMEDIATELY to protect marker
    setSelectionInProgress(flight.flightId);
    
    // CRITICAL: Set selected flight IMMEDIATELY (synchronous)
    setSelectedFlight(flight);
    
    console.log(`🛡️ PROTECTION ACTIVATED for flight ${flight.flightId}`);
    
    if (!activeServer) {
      setSelectionInProgress(null);
      return;
    }
    
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
      
      console.log(`✅ Selection process completed for flight ${flight.flightId}`);
    } catch (error) {
      console.error("❌ Failed to fetch flight route:", error);
      toast.error("Failed to load flight route.");
    } finally {
      // Clear selection in progress after a delay to ensure marker stability
      setTimeout(() => {
        setSelectionInProgress(null);
        console.log(`🔓 Selection process finished for flight ${flight.flightId}`);
      }, 2000); // 2 second delay to ensure stability
    }
  }, [activeServer, map]);

  // Improved close handler
  const handleCloseFlightDetails = useCallback(() => {
    console.log("🔄 Closing flight details");
    
    // Clear the details panel and routes
    setFlownRoute([]);
    setFlightPlan([]);
    
    // Clear selection after a short delay to allow smooth transition
    setTimeout(() => {
      console.log("🔄 Clearing selected flight");
      setSelectedFlight(null);
      setSelectionInProgress(null);
    }, 1000);
  }, []);

  // Clear selection when changing servers
  useEffect(() => {
    console.log("🔄 Server changed, clearing flight selection immediately");
    setSelectedFlight(null);
    setFlownRoute([]);
    setFlightPlan([]);
    setSelectionInProgress(null);
  }, [activeServer]);

  // Enhanced selected flight ID calculation
  const selectedFlightId = useMemo(() => {
    // Return either the selected flight ID or the one in progress
    const id = selectedFlight?.flightId || selectionInProgress || null;
    console.log(`🎯 Current selected/protected flight ID: ${id}`);
    return id;
  }, [selectedFlight, selectionInProgress]);

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
      
      {/* Static Blue Map Container */}
      <StaticBlueMap onMapInit={handleMapInit} />
      
      {/* Aircraft Markers and Flight Route - only render when map is loaded */}
      {map && mapLoaded && (
        <>
          <LeafletAircraftMarker 
            map={map} 
            flights={memoizedFlights} 
            onFlightSelect={handleFlightSelect}
            selectedFlightId={selectedFlightId}
            selectionInProgress={selectionInProgress}
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
