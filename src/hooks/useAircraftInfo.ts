
import { useState, useEffect } from 'react';
import { getAircraftInfo, getLiveryInfo, AircraftInfo } from '@/services/flight/aircraftService';

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
      setAircraftInfo({ loading: true });

      try {
        // Try to get aircraft info first (includes both aircraft and livery info)
        const aircraftData = await getAircraftInfo(aircraftId);
        
        if (isMounted) {
          if (aircraftData) {
            setAircraftInfo({
              aircraftName: aircraftData.aircraftName,
              liveryName: aircraftData.liveryName,
              loading: false
            });
          } else {
            // Fallback: try to get livery info separately
            const liveryData = await getLiveryInfo(liveryId);
            setAircraftInfo({
              liveryName: liveryData?.liveryName,
              loading: false,
              error: !liveryData ? 'Could not load aircraft details' : undefined
            });
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to fetch aircraft info:', error);
          setAircraftInfo({
            loading: false,
            error: 'Failed to load aircraft details'
          });
        }
      }
    };

    if (aircraftId && liveryId) {
      fetchAircraftInfo();
    } else {
      setAircraftInfo({ loading: false });
    }

    return () => {
      isMounted = false;
    };
  }, [aircraftId, liveryId]);

  return aircraftInfo;
}
