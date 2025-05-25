
import React, { useState, useEffect } from 'react';
import { X, Plane, MapPin, Clock, Gauge, User, Navigation } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flight, FlightTrackPoint } from '@/services/flight';
import { getFlightRoute } from '@/services/flight';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileFlightDetails from './MobileFlightDetails';

interface FlightDetailsProps {
  flight: Flight;
  serverID: string;
  onClose: () => void;
}

const FlightDetails: React.FC<FlightDetailsProps> = ({ flight, serverID, onClose }) => {
  const [flightRoute, setFlightRoute] = useState<{
    flownRoute: FlightTrackPoint[];
    flightPlan: FlightTrackPoint[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchRoute = async () => {
      if (!flight?.flightId || !serverID) return;
      
      setLoading(true);
      try {
        const routeData = await getFlightRoute(serverID, flight.flightId);
        setFlightRoute(routeData);
      } catch (error) {
        console.error('Failed to fetch flight route:', error);
        setFlightRoute(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [flight?.flightId, serverID]);

  // Render mobile version
  if (isMobile) {
    return (
      <MobileFlightDetails
        flight={flight}
        serverID={serverID}
        onClose={onClose}
      />
    );
  }

  // Desktop version
  const formatAltitude = (altitude: number) => {
    return `${Math.round(altitude).toLocaleString()} ft`;
  };

  const formatSpeed = (speed: number) => {
    return `${Math.round(speed)} kts`;
  };

  return (
    <div className="absolute top-4 left-4 z-20 w-80 max-h-[calc(100vh-2rem)] overflow-hidden">
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl border border-gray-200">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Plane className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{flight.callsign}</h3>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {flight.username}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(100vh-8rem)]">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2 m-2">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="route">Route</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="p-4 space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Gauge className="w-4 h-4" />
                    Geschwindigkeit
                  </div>
                  <div className="font-semibold">{formatSpeed(flight.speed)}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <MapPin className="w-4 h-4" />
                    Höhe
                  </div>
                  <div className="font-semibold">{formatAltitude(flight.altitude)}</div>
                </div>
              </div>

              {/* Aircraft Info */}
              <div>
                <h4 className="font-medium mb-3 text-gray-900">Flugzeug</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Typ:</span>
                    <span className="font-medium">{flight.aircraft || 'Unbekannt'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Livery:</span>
                    <span className="font-medium">{flight.livery || 'Standard'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kurs:</span>
                    <span className="font-medium flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      {Math.round(flight.heading)}°
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vertikalrate:</span>
                    <span className="font-medium">{Math.round(flight.verticalSpeed)} ft/min</span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h4 className="font-medium mb-3 text-gray-900">Status</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={flight.altitude < 200 ? "secondary" : "default"}>
                    {flight.altitude < 200 ? "Am Boden" : "In der Luft"}
                  </Badge>
                  {flight.speed > 200 && (
                    <Badge variant="outline">Reiseflug</Badge>
                  )}
                </div>
              </div>

              {/* Position */}
              <div>
                <h4 className="font-medium mb-3 text-gray-900">Position</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Breitengrad:</span>
                    <span className="font-medium font-mono">{flight.latitude.toFixed(6)}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Längengrad:</span>
                    <span className="font-medium font-mono">{flight.longitude.toFixed(6)}°</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="route" className="p-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : flightRoute ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Geflogene Route</h4>
                    <p className="text-sm text-gray-600">
                      {flightRoute.flownRoute.length} Wegpunkte
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Flugplan</h4>
                    <p className="text-sm text-gray-600">
                      {flightRoute.flightPlan.length} Wegpunkte
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Keine Routendaten verfügbar</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default FlightDetails;
