
import { useState, useEffect } from 'react';
import { FlightTrackPoint } from '@/services/flight';

export function useRouteCompletionStatus(routePoints: FlightTrackPoint[]) {
  const [isRouteComplete, setIsRouteComplete] = useState(false);
  
  // Effect to check if route is complete (has start and end points)
  useEffect(() => {
    if (routePoints && routePoints.length > 0) {
      const firstPoint = routePoints[0];
      const lastPoint = routePoints[routePoints.length - 1];
      
      // Check if we have distinct start and end points
      if (firstPoint && lastPoint && 
          (firstPoint.latitude !== lastPoint.latitude || 
           firstPoint.longitude !== lastPoint.longitude)) {
        setIsRouteComplete(true);
      } else {
        setIsRouteComplete(false);
      }
    } else {
      setIsRouteComplete(false);
    }
  }, [routePoints]);

  return { isRouteComplete };
}
