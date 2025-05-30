import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Flight, FlightTrackPoint } from '@/services/flight';
import { getFlightRoute } from '@/services/flight';
import { toast } from "sonner";
import L from 'leaflet';

// Import our redesigned components
import AviationHeader, { Server } from './flight/AviationHeader';
import FlightControlPanel from './flight/FlightControlPanel';
import RadarDisplay from './flight/RadarDisplay';
import FlightDetails from './flight/FlightDetails';
import LoadingIndicator from './flight/LoadingIndicator';
import MapStyles from './flight/MapStyles';
import NativeLeafletMap from './flight/NativeLeafletMap';
import LeafletAircraftMarker from './flight/LeafletAircraftMarker';
import LeafletFlightRoute from './flight/LeafletFlightRoute';
import FlightSearch from './flight/FlightSearch';
import EnhancedAirportDetails from './flight/EnhancedAirportDetails';
import UnifiedAirportMarkers, { UnifiedAirportData } from './flight/UnifiedAirportMarkers';
import FlightCount from './flight/FlightCount';
import { useFlightData } from '@/hooks/useFlightData';
import { useFlightSearch, SearchResult } from '@/hooks/useFlightSearch';
import { useAirportData } from '@/hooks/useAirportData';
import { useAirportInfo } from '@/hooks/useAirportInfo';
import { Airport, airports } from '@/data/airportData';

const FlightMap: React.FC = () => {
  const { 
    activeServer, 
    servers, 
    flights, 
    loading, 
    initializing, 
    handleServerChange: originalHandleServerChange 
  } = useFlightData();
  
  // Create a wrapper function to handle the server change with proper typing
  const handleServerChange = useCallback((server: Server) => {
    // Find the matching server from the original servers list
    const matchingServer = servers.find(s => s.id === server.id);
    if (matchingServer) {
      originalHandleServerChange(matchingServer);
    }
  }, [servers, originalHandleServerChange]);
  
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
  const [viewMode, setViewMode] = useState<'standard' | 'radar' | 'satellite'>('standard');
  
  // Critical: Track selection in progress to prevent race conditions
  const [selectionInProgress, setSelectionInProgress] = useState<string | null>(null);
  
  // Airport data hook
  const { airports: liveAirports, loading: airportsLoading } = useAirportData({ 
    activeServerId: activeServer?.id || null 
  });
  
  // Unified airport selection state
  const [selectedAirportData, setSelectedAirportData] = useState<UnifiedAirportData | null>(null);
  
  // Airport info hook
  const { airportInfo, loading: airportInfoLoading, fetchAirportInfo, clearAirportInfo } = useAirportInfo();

  const handleMapInit = useCallback((initializedMap: L.Map) => {
    console.log("🗺️ Aviation radar map initialized");
    
    setMap(initializedMap);
    setMapLoaded(true);
  }, []);

  // Close airport details handler
  const handleCloseAirportDetails = useCallback(() => {
    console.log("🔄 Closing airport details");
    setSelectedAirportData(null);
    clearAirportInfo();
  }, [clearAirportInfo]);

  // Enhanced close handler to also clear airport selection
  const handleCloseFlightDetails = useCallback(() => {
    console.log("🔄 Closing flight details");
    
    // Clear the details panel and routes
    setFlownRoute([]);
    setFlightPlan([]);
    
    // Clear airport markers
    airportMarkers.forEach(marker => map?.removeLayer(marker));
    setAirportMarkers([]);
    
    // Clear selections after a short delay to allow smooth transition
    setTimeout(() => {
      console.log("🔄 Clearing selected flight");
      setSelectedFlight(null);
      setSelectionInProgress(null);
    }, 1000);
  }, [airportMarkers, map]);

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
          <div class="bg-radar-green text-black rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shadow-lg glow-effect">
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
          <div class="text-center bg-aviation-navy text-white p-3 rounded-lg">
            <h3 class="font-aviation font-bold text-lg text-aviation-sky">${airport.icao} / ${airport.iata}</h3>
            <p class="text-sm">${airport.name}</p>
            <p class="text-xs text-gray-400">${airport.city}, ${airport.country}</p>
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

  // Handle unified airport selection
  const handleUnifiedAirportSelect = useCallback((airportData: UnifiedAirportData) => {
    console.log(`🏢 Unified airport selected: ${airportData.icao}`, airportData);
    setSelectedAirportData(airportData);
    
    // Fetch detailed airport information if we have static data
    if (airportData.staticData) {
      fetchAirportInfo(airportData.icao);
    } else {
      clearAirportInfo();
    }
    
    // Clear any selected flight when selecting an airport
    if (selectedFlight) {
      handleCloseFlightDetails();
    }
    
    // Focus map on airport
    if (map) {
      let coords: [number, number] | null = null;
      
      if (airportData.liveData && airportData.liveData.atcFacilities.length > 0) {
        const facility = airportData.liveData.atcFacilities[0];
        coords = [facility.latitude, facility.longitude];
      } else if (airportData.staticData) {
        coords = [airportData.staticData.latitude, airportData.staticData.longitude];
      }
      
      if (coords) {
        map.flyTo(coords, 10, {
          animate: true,
          duration: 1.5
        });
      }
    }
  }, [map, selectedFlight, handleCloseFlightDetails, fetchAirportInfo, clearAirportInfo]);

  // Enhanced airport details with flight selection
  const handleAirportFlightSelect = useCallback((flight: Flight) => {
    console.log(`🛩️ Flight selected from airport panel: ${flight.flightId}`);
    
    // Close airport details
    handleCloseAirportDetails();
    
    // Select the flight
    handleFlightSelect(flight);
  }, [handleCloseAirportDetails, handleFlightSelect]);

  // FIXED: Clear selection when changing servers (removed problematic dependencies)
  useEffect(() => {
    console.log("🔄 Server changed, clearing flight selection immediately");
    setSelectedFlight(null);
    setFlownRoute([]);
    setFlightPlan([]);
    setSelectionInProgress(null);
    
    // Clear airport markers using current state
    setAirportMarkers(prevMarkers => {
      prevMarkers.forEach(marker => {
        if (map) {
          map.removeLayer(marker);
        }
      });
      return [];
    });
  }, [activeServer]); // ONLY activeServer as dependency

  // Enhanced selected flight ID calculation
  const selectedFlightId = useMemo(() => {
    // Return either the selected flight ID or the one in progress
    const id = selectedFlight?.flightId || selectionInProgress || null;
    console.log(`🎯 Current selected/protected flight ID: ${id}`);
    return id;
  }, [selectedFlight, selectionInProgress]);

  return (
    <div className="relative h-screen w-full bg-gradient-to-br from-aviation-navy via-slate-900 to-aviation-navy">
      {/* Aviation Header */}
      <AviationHeader 
        servers={servers}
        activeServer={activeServer}
        onServerChange={handleServerChange}
        flightCount={flights.length}
        onSearchClick={openSearch}
      />
      
      {/* Flight Control Panel */}
      <FlightControlPanel 
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isLoading={loading || initializing || !mapLoaded || airportsLoading}
      />
      
      {/* Radar Display */}
      {viewMode === 'radar' && (
        <RadarDisplay 
          flights={memoizedFlights}
          onFlightSelect={handleFlightSelect}
          selectedFlightId={selectedFlightId}
        />
      )}
      
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
      {(loading || initializing || !mapLoaded || airportsLoading) && (
        <LoadingIndicator 
          message={initializing ? "Establishing radar contact..." : 
                  !mapLoaded ? "Initializing navigation..." : 
                  airportsLoading ? "Loading airport data..." :
                  "Acquiring flight data..."} 
        />
      )}
      
      {/* Enhanced Airport Details */}
      {selectedAirportData && (
        <EnhancedAirportDetails 
          airport={selectedAirportData.liveData}
          airportInfo={airportInfo || undefined}
          flights={memoizedFlights}
          loading={airportInfoLoading}
          onClose={handleCloseAirportDetails}
          onFlightSelect={handleAirportFlightSelect}
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
      <FlightCount count={flights.length} loading={loading} />
      
      {/* Native Leaflet Map Container */}
      <NativeLeafletMap onMapInit={handleMapInit} />
      
      {/* Aircraft Markers, Airport Markers and Flight Route */}
      {map && mapLoaded && viewMode !== 'radar' && (
        <>
          <LeafletAircraftMarker 
            map={map} 
            flights={memoizedFlights} 
            onFlightSelect={handleFlightSelect}
            selectedFlightId={selectedFlightId}
            selectionInProgress={selectionInProgress}
          />
          <UnifiedAirportMarkers
            map={map}
            liveAirports={liveAirports}
            staticAirports={airports}
            onAirportSelect={handleUnifiedAirportSelect}
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
