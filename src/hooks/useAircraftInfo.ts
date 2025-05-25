
import { useState, useEffect } from 'react';
import { getAircraftInfo, AircraftInfo } from '@/services/flight/aircraftService';

interface DetailedAircraftInfo {
  aircraftName?: string;
  liveryName?: string;
  loading: boolean;
  error?: string;
}

export function useAircraftInfo(aircraftId: string, liveryId: string): DetailedAircraftInfo {
  const [aircraftInfo, setAircraftInfo] = useState<DetailedAircraftInfo>({
    loading: true
  });

  useEffect(() => {
    let isMounted = true;

    const fetchAircraftInfo = async () => {
      console.log('🔍 useAircraftInfo - Fetching aircraft info:', { aircraftId, liveryId });
      setAircraftInfo({ loading: true });

      if (!aircraftId || !liveryId) {
        console.log('❌ useAircraftInfo - Missing aircraft or livery ID');
        setAircraftInfo({
          loading: false,
          error: 'No aircraft/livery ID'
        });
        return;
      }

      try {
        console.log(`🔍 useAircraftInfo - Getting aircraft info for: ${aircraftId}, livery: ${liveryId}`);
        const aircraftData = await getAircraftInfo(aircraftId, liveryId);
        
        if (isMounted) {
          if (aircraftData) {
            console.log('✅ useAircraftInfo - Aircraft data received:', aircraftData);
            setAircraftInfo({
              aircraftName: aircraftData.aircraftName,
              liveryName: aircraftData.liveryName,
              loading: false
            });
          } else {
            console.log('❌ useAircraftInfo - No aircraft data returned');
            setAircraftInfo({
              loading: false,
              error: 'Aircraft details not found'
            });
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('❌ useAircraftInfo - Failed to fetch aircraft info:', error);
          setAircraftInfo({
            loading: false,
            error: 'API request failed'
          });
        }
      }
    };

    fetchAircraftInfo();

    return () => {
      isMounted = false;
    };
  }, [aircraftId, liveryId]);

  return aircraftInfo;
}
