import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  
  // Debug log for flights changes
  useEffect(() => {
    console.log(`🛩️ FlightMap - Flights updated: ${flights.length} flights`);
    if (flights.length > 0) {
      console.log(`📋 First 3 flights: ${flights.slice(0, 3).map(f => f.flightId).join(', ')}`);
    }
  }, [flights]);
  
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [flownRoute, setFlownRoute] = useState<FlightTrackPoint[]>([]);
  const [flightPlan, setFlightPlan] = useState<FlightTrackPoint[]>([]);
  const [isTrackingMode, setIsTrackingMode] = useState(false);
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleMapInit = useCallback((initializedMap: mapboxgl.Map) => {
    console.log("🗺️ Map initialized in FlightMap component");
    setMap(initializedMap);
    
    // Set mapLoaded to true when the map is fully loaded
    if (initializedMap.loaded()) {
      console.log("🗺️ Map already loaded on init");
      setMapLoaded(true);
    } else {
      console.log("🗺️ Waiting for map to load");
      initializedMap.once('load', () => {
        console.log("🗺️ Map load event fired");
        setMapLoaded(true);
      });
    }

    // Add event listeners for user interaction to exit tracking mode
    const exitTrackingMode = () => {
      if (isTrackingMode) {
        setIsTrackingMode(false);
        if (trackingIntervalRef.current) {
          clearInterval(trackingIntervalRef.current);
          trackingIntervalRef.current = null;
        }
        console.log("🔄 Exited tracking mode due to user interaction");
      }
    };

    initializedMap.on('dragstart', exitTrackingMode);
    initializedMap.on('zoomstart', exitTrackingMode);
    initializedMap.on('rotatestart', exitTrackingMode);
  }, [isTrackingMode]);

  // Start tracking mode for selected flight
  const startTrackingMode = useCallback((flight: Flight) => {
    if (!map) return;
    
    setIsTrackingMode(true);
    console.log(`🎯 Starting tracking mode for flight ${flight.flightId}`);
    
    // Clear any existing tracking interval
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
    }
    
    // Update aircraft position every 2 seconds while in tracking mode
    trackingIntervalRef.current = setInterval(() => {
      const currentFlight = flights.find(f => f.flightId === flight.flightId);
      if (currentFlight && map) {
        map.easeTo({
          center: [currentFlight.longitude, currentFlight.latitude],
          duration: 1500
        });
      }
    }, 2000);
  }, [map, flights]);

  // Stop tracking mode
  const stopTrackingMode = useCallback(() => {
    setIsTrackingMode(false);
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
    console.log("🔄 Tracking mode stopped");
  }, []);

  // Handle flight selection
  const handleFlightSelect = async (flight: Flight) => {
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
      
      // Focus on the flight with closer zoom and start tracking
      if (map && flight) {
        map.flyTo({
          center: [flight.longitude, flight.latitude],
          zoom: 9, // Closer zoom instead of 7
          speed: 1.2
        });
        
        // Start tracking mode after a short delay to allow the flyTo to complete
        setTimeout(() => {
          startTrackingMode(flight);
        }, 1500);
      }
    } catch (error) {
      console.error("❌ Failed to fetch flight route:", error);
      toast.error("Failed to load flight route.");
    }
  };

  // Cleanup tracking mode on unmount
  useEffect(() => {
    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
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
          onClose={() => {
            console.log("🔄 Closing flight details");
            setSelectedFlight(null);
            setFlownRoute([]);
            setFlightPlan([]);
            stopTrackingMode();
          }} 
        />
      )}
      
      {/* Flight Count */}
      <FlightCount count={flights.length} />
      
      {/* Tracking Mode Indicator */}
      {isTrackingMode && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Verfolgungsmodus aktiv</span>
            <button 
              onClick={stopTrackingMode}
              className="ml-2 text-white hover:text-gray-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {/* Map Container */}
      <MapContainer onMapInit={handleMapInit} />
      
      {/* Aircraft Markers and Flight Route - only render when map is loaded */}
      {map && mapLoaded && (
        <>
          <AircraftMarker 
            map={map} 
            flights={flights} 
            onFlightSelect={handleFlightSelect} 
          />
          <FlightRoute 
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

export default FlightMap;
