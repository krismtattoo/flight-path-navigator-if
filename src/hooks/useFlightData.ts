
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { getFlights, getServers, SERVER_TYPES, Flight, ServerInfo } from '@/services/flight';

interface Server {
  id: string;
  name: string;
}

export function useFlightData() {
  const [activeServer, setActiveServer] = useState<Server | null>(null);
  const [servers] = useState<Server[]>([
    { id: "casual", name: SERVER_TYPES.CASUAL },
    { id: "training", name: SERVER_TYPES.TRAINING },
    { id: "expert", name: SERVER_TYPES.EXPERT }
  ]);
  const [availableServers, setAvailableServers] = useState<ServerInfo[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [serversInitialized, setServersInitialized] = useState(false);

  // Load available servers on mount
  useEffect(() => {
    const fetchAvailableServers = async () => {
      setInitializing(true);
      try {
        const serverData = await getServers();
        setAvailableServers(serverData);
        setServersInitialized(true);
        
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
        if (!serversInitialized) {
          await getServers();
          setServersInitialized(true);
        }
        
        console.log(`Fetching flights for server: ${activeServer.id}`);
        const flightData = await getFlights(activeServer.id);
        console.log(`Retrieved ${flightData.length} flights`);
        setFlights(flightData);
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
  }, [activeServer, serversInitialized]);

  // Handle server change
  const handleServerChange = (serverId: string) => {
    console.log(`Selected server: ${serverId}`);
    const server = servers.find(s => s.id === serverId);
    if (server) setActiveServer(server);
  };

  return {
    activeServer,
    servers,
    flights,
    loading,
    initializing,
    handleServerChange
  };
}
