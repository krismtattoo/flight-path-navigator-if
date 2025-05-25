
import React, { useState } from 'react';
import { X, ChevronUp, ChevronDown, Plane, MapPin, Clock, Gauge } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flight } from '@/services/flight';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileFlightDetailsProps {
  flight: Flight;
  serverID: string;
  onClose: () => void;
}

const MobileFlightDetails: React.FC<MobileFlightDetailsProps> = ({
  flight,
  serverID,
  onClose
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const formatAltitude = (altitude: number) => {
    return `${Math.round(altitude).toLocaleString()} ft`;
  };

  const formatSpeed = (speed: number) => {
    return `${Math.round(speed)} kts`;
  };

  return (
    <>
      {/* Backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      {/* Bottom Sheet */}
      <div className={`
        fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-300 ease-out
        ${isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-120px)]'}
      `}>
        <Card className="bg-white rounded-t-xl shadow-2xl border-0 max-h-[80vh] overflow-hidden">
          {/* Header - Always Visible */}
          <div 
            className="p-4 cursor-pointer select-none border-b bg-gray-50"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Plane className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{flight.callsign}</h3>
                  <p className="text-sm text-gray-600">{flight.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="min-h-[44px] min-w-[44px] p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
                {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </div>
            </div>
            
            {/* Quick Stats - Always Visible */}
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1 text-sm">
                <Gauge className="w-4 h-4 text-gray-500" />
                <span>{formatSpeed(flight.speed)}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{formatAltitude(flight.altitude)}</span>
              </div>
            </div>
          </div>

          {/* Expandable Content */}
          {isExpanded && (
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {/* Aircraft Info */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3 text-gray-900">Flugzeug Information</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Flugzeug:</span>
                      <p className="font-medium">{flight.aircraft || 'Unbekannt'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Livery:</span>
                      <p className="font-medium">{flight.livery || 'Standard'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Geschwindigkeit:</span>
                      <p className="font-medium">{formatSpeed(flight.speed)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Höhe:</span>
                      <p className="font-medium">{formatAltitude(flight.altitude)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Kurs:</span>
                      <p className="font-medium">{Math.round(flight.heading)}°</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Vertikalrate:</span>
                      <p className="font-medium">{Math.round(flight.verticalSpeed)} ft/min</p>
                    </div>
                  </div>
                </div>

                {/* Flight Status */}
                <div>
                  <h4 className="font-medium mb-3 text-gray-900">Flugstatus</h4>
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
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="text-gray-600">Breitengrad:</span>
                      <p className="font-medium">{flight.latitude.toFixed(6)}°</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Längengrad:</span>
                      <p className="font-medium">{flight.longitude.toFixed(6)}°</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
};

export default MobileFlightDetails;
