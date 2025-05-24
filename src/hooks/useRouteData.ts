
import { useCallback, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { Flight, FlightTrackPoint } from '@/services/flight';
import { useRouteSource } from './useRouteSource';
import { useRouteCompletionStatus } from './useRouteCompletionStatus';
import { useRouteUpdater } from './useRouteUpdater';

interface UseRouteDataProps {
  flownRoute: FlightTrackPoint[];
  flightPlan: FlightTrackPoint[];
  selectedFlight: Flight | null;
}

export function useRouteData({ flownRoute, flightPlan, selectedFlight }: UseRouteDataProps) {
  const { routeRef, handleSourceReady } = useRouteSource();
  const { isRouteComplete } = useRouteCompletionStatus([...flownRoute, ...flightPlan]);
  const { validFlownRoute, validFlightPlan, updateRoute: updateRouteImpl } = useRouteUpdater(flownRoute, flightPlan, selectedFlight);
  
  // Create a wrapper for updateRoute that uses our routeRef
  const updateRoute = useCallback(() => {
    updateRouteImpl(routeRef);
  }, [updateRouteImpl, routeRef]);
  
  // Update route when dependencies change
  useEffect(() => {
    updateRoute();
  }, [updateRoute]);

  return {
    validFlownRoute,
    validFlightPlan,
    isRouteComplete,
    handleSourceReady,
    updateRoute
  };
}
