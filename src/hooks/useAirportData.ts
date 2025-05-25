
import { useState, useEffect } from 'react';
import { AirportStatus, getWorldStatus } from '@/services/flight/worldService';
import { toast } from 'sonner';

interface UseAirportDataProps {
  activeServerId: string | null;
}

export function useAirportData({ activeServerId }: UseAirportDataProps) {
  const [airports, setAirports] = useState<AirportStatus[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAirports = async () => {
      if (!activeServerId) return;
      
      setLoading(true);
      try {
        console.log(`Fetching airports for server: ${activeServerId}`);
        const airportData = await getWorldStatus(activeServerId);
        console.log(`Retrieved ${airportData.length} active airports`);
        setAirports(airportData);
      } catch (error) {
        console.error("Failed to fetch airports:", error);
        toast.error("Failed to load airport data.");
        setAirports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAirports();
    
    // Poll for updated airport data every 30 seconds
    const interval = setInterval(fetchAirports, 30000);
    return () => clearInterval(interval);
  }, [activeServerId]);

  return {
    airports,
    loading
  };
}
