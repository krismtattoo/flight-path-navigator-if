
import { useCallback, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { Flight, FlightTrackPoint } from '@/services/flight';
import { useRouteSource } from './useRouteSource';
import { useRouteCompletionStatus } from './useRouteCompletionStatus';
import { useRouteUpdater } from './useRouteUpdater';

interface UseRouteDataProps {
  routePoints: FlightTrackPoint[];
  selectedFlight: Flight | null;
}

export function useRouteData({ routePoints, selectedFlight }: UseRouteDataProps) {
  const { routeRef, handleSourceReady } = useRouteSource();
  const { isRouteComplete } = useRouteCompletionStatus(routePoints);
  const { validRoutePoints, updateRoute: updateRouteImpl } = useRouteUpdater(routePoints, selectedFlight);
  
  // Create a wrapper for updateRoute that uses our routeRef
  const updateRoute = useCallback(() => {
    updateRouteImpl(routeRef);
  }, [updateRouteImpl, routeRef]);
  
  // Update route when dependencies change
  useEffect(() => {
    updateRoute();
  }, [updateRoute]);

  return {
    validRoutePoints,
    isRouteComplete,
    handleSourceReady,
    updateRoute
  };
}
