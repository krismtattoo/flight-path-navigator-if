
import { useState } from 'react';
import { AirportInfo, getAirportInfo } from '@/services/flight/airportInfoService';
import { toast } from 'sonner';

export function useAirportInfo() {
  const [airportInfo, setAirportInfo] = useState<AirportInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAirportInfo = async (icao: string) => {
    if (!icao) return;
    
    setLoading(true);
    try {
      const info = await getAirportInfo(icao);
      setAirportInfo(info);
    } catch (error) {
      console.error("Failed to fetch airport info:", error);
      toast.error(`Failed to load information for ${icao}.`);
      setAirportInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const clearAirportInfo = () => {
    setAirportInfo(null);
  };

  return {
    airportInfo,
    loading,
    fetchAirportInfo,
    clearAirportInfo
  };
}
