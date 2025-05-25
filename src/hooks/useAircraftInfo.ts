
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
      console.log('🔍 useAircraftInfo - Fetching aircraft info:', { aircraftId, liveryId });
      setAircraftInfo({ loading: true });

      if (!aircraftId && !liveryId) {
        console.log('❌ useAircraftInfo - No aircraft or livery ID provided');
        setAircraftInfo({
          loading: false,
          error: 'No aircraft/livery ID'
        });
        return;
      }

      try {
        // Try to get aircraft info first (includes both aircraft and livery info)
        if (aircraftId) {
          console.log('🔍 useAircraftInfo - Trying to get aircraft info for:', aircraftId);
          const aircraftData = await getAircraftInfo(aircraftId);
          
          if (isMounted) {
            if (aircraftData) {
              console.log('✅ useAircraftInfo - Aircraft data received:', aircraftData);
              setAircraftInfo({
                aircraftName: aircraftData.aircraftName,
                liveryName: aircraftData.liveryName,
                loading: false
              });
              return;
            } else {
              console.log('❌ useAircraftInfo - No aircraft data returned');
            }
          }
        }

        // Fallback: try to get livery info separately
        if (liveryId && isMounted) {
          console.log('🔍 useAircraftInfo - Trying to get livery info for:', liveryId);
          const liveryData = await getLiveryInfo(liveryId);
          if (liveryData) {
            console.log('✅ useAircraftInfo - Livery data received:', liveryData);
            setAircraftInfo({
              liveryName: liveryData.liveryName,
              loading: false
            });
          } else {
            console.log('❌ useAircraftInfo - No livery data returned');
            setAircraftInfo({
              loading: false,
              error: 'Aircraft details not found'
            });
          }
        } else {
          setAircraftInfo({
            loading: false,
            error: 'Aircraft details not available'
          });
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
