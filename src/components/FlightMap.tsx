import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Flight, FlightTrackPoint } from '@/services/flight';
import { getFlightRoute } from '@/services/flight';
import { toast } from "sonner";
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
import FlightSearch from './flight/FlightSearch';
import SearchButton from './flight/SearchButton';

// Import custom hooks
import { useFlightData } from '@/hooks/useFlightData';
import { useFlightSearch, SearchResult } from '@/hooks/useFlightSearch';

// Import airport data types
import { Airport } from '@/data/airportData';

const FlightMap: React.FC = () => {
  const { 
    activeServer, 
    servers, 
    flights, 
    loading, 
    initializing, 
    handleServerChange 
  } = useFlightData();
  
  // Search functionality
  const {
    query,
    setQuery,
    searchResults,
    isOpen,
    setIsOpen,
    clearSearch,
    openSearch,
    isSearching,
    debouncedQuery
  } = useFlightSearch({ flights });
  
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
  const [airportMarkers, setAirportMarkers] = useState<L.Marker[]>([]);
  
  // Critical: Track selection in progress to prevent race conditions
  const [selectionInProgress, setSelectionInProgress] = useState<string | null>(null);
  
  const handleMapInit = useCallback((initializedMap: L.Map) => {
    console.log("🗺️ Native Leaflet map initialized in FlightMap component");
    
    setMap(initializedMap);
    setMapLoaded(true);
  }, []);

  // Handle search result selection
  const handleSelectSearchResult = useCallback((result: SearchResult) => {
    if (!map) return;

    console.log(`🔍 Search result selected:`, result);

    if (result.type === 'aircraft' || result.type === 'user') {
      const flight = result.data as Flight;
      
      // Select the flight
      handleFlightSelect(flight);
      
      // Focus map on flight
      map.flyTo([flight.latitude, flight.longitude], 12, {
        animate: true,
        duration: 1.5
      });
      
    } else if (result.type === 'airport') {
      const airport = result.data as Airport;
      
      // Clear any existing airport markers
      airportMarkers.forEach(marker => map.removeLayer(marker));
      
      // Create airport marker
      const airportIcon = L.divIcon({
        html: `
          <div class="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shadow-lg">
            ✈
          </div>
        `,
        className: 'airport-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([airport.latitude, airport.longitude], { 
        icon: airportIcon 
      })
        .bindPopup(`
          <div class="text-center">
            <h3 class="font-bold text-lg">${airport.icao} / ${airport.iata}</h3>
            <p class="text-sm">${airport.name}</p>
            <p class="text-xs text-gray-600">${airport.city}, ${airport.country}</p>
          </div>
        `)
        .addTo(map)
        .openPopup();

      setAirportMarkers([marker]);
      
      // Focus map on airport
      map.flyTo([airport.latitude, airport.longitude], 10, {
        animate: true,
        duration: 1.5
      });
    }

    clearSearch();
  }, [map, airportMarkers, clearSearch]);

  // Improved flight selection handler with immediate state protection
  const handleFlightSelect = useCallback(async (flight: Flight) => {
    console.log(`🎯 Flight selected: ${flight.flightId} - Starting selection process`);
    
    // Clear any airport markers when selecting a flight
    airportMarkers.forEach(marker => map?.removeLayer(marker));
    setAirportMarkers([]);
    
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
  }, [activeServer, map, airportMarkers]);

  // Improved close handler
  const handleCloseFlightDetails = useCallback(() => {
    console.log("🔄 Closing flight details");
    
    // Clear the details panel and routes
    setFlownRoute([]);
    setFlightPlan([]);
    
    // Clear airport markers
    airportMarkers.forEach(marker => map?.removeLayer(marker));
    setAirportMarkers([]);
    
    // Clear selection after a short delay to allow smooth transition
    setTimeout(() => {
      console.log("🔄 Clearing selected flight");
      setSelectedFlight(null);
      setSelectionInProgress(null);
    }, 1000);
  }, [airportMarkers, map]);

  // Clear selection when changing servers
  useEffect(() => {
    console.log("🔄 Server changed, clearing flight selection immediately");
    setSelectedFlight(null);
    setFlownRoute([]);
    setFlightPlan([]);
    setSelectionInProgress(null);
    
    // Clear airport markers
    airportMarkers.forEach(marker => map?.removeLayer(marker));
    setAirportMarkers([]);
  }, [activeServer, airportMarkers, map]);

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
      
      {/* Search Button */}
      <SearchButton onClick={openSearch} />
      
      {/* Search Dialog */}
      <FlightSearch
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        query={query}
        onQueryChange={setQuery}
        searchResults={searchResults}
        onSelectResult={handleSelectSearchResult}
        isSearching={isSearching}
        debouncedQuery={debouncedQuery}
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
