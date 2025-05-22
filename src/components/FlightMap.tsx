
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFlights, getFlightRoute, getUserDetails, SERVER_TYPES, Flight, FlightTrackPoint } from '@/services/flightApi';
import { Skeleton } from '@/components/ui/skeleton';
import { Map, Plane } from 'lucide-react';

// For mapbox
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Mapbox token - would be better in env variable but for demo purposes
mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

interface Server {
  id: string;
  name: string;
}

interface FlightDetailsProps {
  flight: Flight | null;
  serverID: string;
  onClose: () => void;
}

// Component to display flight details
const FlightDetails: React.FC<FlightDetailsProps> = ({ flight, serverID, onClose }) => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserInfo = async () => {
      if (!flight) return;
      setLoading(true);
      try {
        const data = await getUserDetails(serverID, flight.userId);
        if (data) {
          setUserInfo(data);
        }
      } catch (error) {
        console.error("Failed to load user info", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserInfo();
  }, [flight, serverID]);

  if (!flight) return null;

  return (
    <Card className="absolute bottom-8 right-8 w-80 z-10 shadow-lg animate-fade-in bg-white/95 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-flight-dark-blue">{flight.callsign}</h3>
            <p className="text-sm text-gray-600">{flight.aircraft}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>
        
        <div className="mt-4 space-y-3">
          <div>
            <p className="text-xs text-gray-500">Altitude</p>
            <p className="font-medium">{Math.round(flight.altitude).toLocaleString()} ft</p>
          </div>
          
          <div>
            <p className="text-xs text-gray-500">Speed</p>
            <p className="font-medium">{Math.round(flight.speed).toLocaleString()} kts</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Heading</p>
            <p className="font-medium">{Math.round(flight.heading)}°</p>
          </div>

          <div className="border-t pt-3 mt-3">
            <h4 className="font-medium mb-2">User Information</h4>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : userInfo ? (
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-flight-light-blue flex items-center justify-center text-white font-bold">
                    {userInfo.username?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-medium">{userInfo.username}</p>
                    {userInfo.virtualOrganization && (
                      <p className="text-xs text-gray-600">{userInfo.virtualOrganization}</p>
                    )}
                  </div>
                </div>
                {userInfo.grade && (
                  <p className="text-sm">Grade: {userInfo.grade}</p>
                )}
              </div>
            ) : (
              <p className="text-sm italic text-gray-500">No user information available</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const FlightMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const routeRef = useRef<mapboxgl.Source | null>(null);
  
  const [activeServer, setActiveServer] = useState<Server | null>(null);
  const [servers, setServers] = useState<Server[]>([
    { id: "casual", name: SERVER_TYPES.CASUAL },
    { id: "training", name: SERVER_TYPES.TRAINING },
    { id: "expert", name: SERVER_TYPES.EXPERT }
  ]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [flightRoute, setFlightRoute] = useState<FlightTrackPoint[]>([]);
  
  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [0, 30], // Center on Atlantic for global view
      zoom: 2,
      minZoom: 1.5,
    });
    
    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add route source and layers
    map.current.on('load', () => {
      if (!map.current) return;
      
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        }
      });
      
      map.current.addLayer({
        id: 'route-traveled',
        type: 'line',
        source: 'route',
        filter: ['==', 'type', 'traveled'],
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#2271B3',
          'line-width': 4,
          'line-opacity': 0.8
        }
      });

      map.current.addLayer({
        id: 'route-remaining',
        type: 'line',
        source: 'route',
        filter: ['==', 'type', 'remaining'],
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#5DADEC',
          'line-width': 4,
          'line-opacity': 0.6,
          'line-dasharray': [0, 2, 2]
        }
      });
      
      routeRef.current = map.current.getSource('route') as mapboxgl.GeoJSONSource;
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Load flights for active server
  useEffect(() => {
    const fetchFlights = async () => {
      if (!activeServer) return;
      
      setLoading(true);
      try {
        const flightData = await getFlights(activeServer.id);
        setFlights(flightData);
        
        // Clear selected flight when changing server
        setSelectedFlight(null);
        updateRouteOnMap([]);
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

  // Update markers on map when flights change
  useEffect(() => {
    if (!map.current) return;
    
    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};
    
    // Create new markers for all flights
    flights.forEach(flight => {
      // Create a custom HTML element for the marker
      const el = document.createElement('div');
      el.className = 'aircraft-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%234BB4E6\' stroke=\'%23FFFFFF\' stroke-width=\'1\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\'/%3E%3C/svg%3E")';
      el.style.backgroundSize = 'cover';
      el.style.transform = `rotate(${flight.heading}deg)`;
      el.style.transformOrigin = 'center';
      el.style.cursor = 'pointer';
      el.classList.add('animate-pulse-subtle');
      
      // Create and add the marker to the map
      const marker = new mapboxgl.Marker({
        element: el,
        rotation: flight.heading,
        anchor: 'center'
      })
        .setLngLat([flight.longitude, flight.latitude])
        .addTo(map.current!);
      
      // Store reference to marker
      markersRef.current[flight.flightId] = marker;
      
      // Add click handler
      marker.getElement().addEventListener('click', () => {
        handleFlightSelect(flight);
      });
    });
  }, [flights]);

  // Handle flight selection
  const handleFlightSelect = async (flight: Flight) => {
    setSelectedFlight(flight);
    
    if (!activeServer) return;
    
    try {
      const routeData = await getFlightRoute(activeServer.id, flight.flightId);
      setFlightRoute(routeData);
      
      // Update route on map
      updateRouteOnMap(routeData);
      
      // Center and zoom to the flight
      if (map.current && flight) {
        map.current.flyTo({
          center: [flight.longitude, flight.latitude],
          zoom: 6,
          speed: 1.2
        });
      }
    } catch (error) {
      console.error("Failed to fetch flight route", error);
      toast.error("Failed to load flight route.");
    }
  };

  // Update route display on map
  const updateRouteOnMap = (routePoints: FlightTrackPoint[]) => {
    if (!map.current || !routeRef.current) return;
    
    if (routePoints.length === 0) {
      // Clear the route
      routeRef.current.setData({
        type: 'FeatureCollection',
        features: []
      });
      return;
    }
    
    // Find current position in route
    let currentPositionIndex = 0;
    if (selectedFlight) {
      // Find the closest point to current position
      const currentPos = {
        lat: selectedFlight.latitude,
        lng: selectedFlight.longitude
      };
      
      let minDist = Number.MAX_VALUE;
      routePoints.forEach((point, idx) => {
        const dist = Math.sqrt(
          Math.pow(point.latitude - currentPos.lat, 2) + 
          Math.pow(point.longitude - currentPos.lng, 2)
        );
        if (dist < minDist) {
          minDist = dist;
          currentPositionIndex = idx;
        }
      });
    }
    
    // Create GeoJSON for traveled and remaining route
    const traveledCoords = routePoints
      .slice(0, currentPositionIndex + 1)
      .map(p => [p.longitude, p.latitude]);
    
    const remainingCoords = routePoints
      .slice(currentPositionIndex)
      .map(p => [p.longitude, p.latitude]);
    
    // Update the route source
    routeRef.current.setData({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            type: 'traveled'
          },
          geometry: {
            type: 'LineString',
            coordinates: traveledCoords
          }
        },
        {
          type: 'Feature',
          properties: {
            type: 'remaining'
          },
          geometry: {
            type: 'LineString',
            coordinates: remainingCoords
          }
        }
      ]
    });
  };

  return (
    <div className="relative h-screen w-full">
      {/* Server Selection Tabs */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <Card className="shadow-lg bg-white/90 backdrop-blur-sm">
          <Tabs 
            defaultValue="casual" 
            className="w-[400px]"
            onValueChange={(value) => {
              const server = servers.find(s => s.id === value);
              if (server) setActiveServer(server);
            }}
          >
            <TabsList className="grid grid-cols-3 w-full">
              {servers.map(server => (
                <TabsTrigger key={server.id} value={server.id}>
                  {server.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </Card>
      </div>
      
      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10">
          <Card className="shadow-md bg-white/90 backdrop-blur-sm px-4 py-2">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-flight-dark-blue"></div>
              <p>Loading flights...</p>
            </div>
          </Card>
        </div>
      )}
      
      {/* Flight Info */}
      {selectedFlight && activeServer && (
        <FlightDetails 
          flight={selectedFlight} 
          serverID={activeServer.id} 
          onClose={() => {
            setSelectedFlight(null);
            updateRouteOnMap([]);
          }} 
        />
      )}
      
      {/* Flight Count */}
      <div className="absolute bottom-4 left-4 z-10">
        <Card className="shadow-md bg-white/90 backdrop-blur-sm px-3 py-2">
          <p className="text-sm flex items-center gap-2">
            <span className="text-flight-light-blue">
              <Plane className="h-4 w-4" />
            </span>
            <span>{flights.length} aircraft online</span>
          </p>
        </Card>
      </div>
      
      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* CSS for marker animation */}
      <style>
        {`.aircraft-marker {
          transition: transform 0.5s ease;
        }`}
      </style>
    </div>
  );
};

export default FlightMap;
