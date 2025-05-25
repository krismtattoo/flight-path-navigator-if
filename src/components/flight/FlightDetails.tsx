
import React, { useState, useEffect } from 'react';
import { X, Plane, User, MapPin, Clock, Gauge, Navigation, Building } from 'lucide-react';
import { Flight } from '@/services/flight';
import { useAircraftInfo } from '@/hooks/useAircraftInfo';
import { Card, CardContent } from '../ui/card';
import PerformanceChart from './PerformanceChart';

interface FlightDetailsProps {
  flight: Flight;
  serverID: string;
  onClose: () => void;
}

const FlightDetails: React.FC<FlightDetailsProps> = ({ flight, serverID, onClose }) => {
  const { aircraftName, liveryName, loading: aircraftLoading } = useAircraftInfo(flight.aircraftId, flight.liveryId);
  const [showPerformanceChart, setShowPerformanceChart] = useState(false);

  // Auto-show performance chart after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPerformanceChart(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const formatLastUpdate = (timestamp: number) => {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    
    if (diffSeconds < 60) {
      return `vor ${diffSeconds}s`;
    } else if (diffMinutes < 60) {
      return `vor ${diffMinutes}m`;
    } else {
      const diffHours = Math.floor(diffMinutes / 60);
      return `vor ${diffHours}h ${diffMinutes % 60}m`;
    }
  };

  return (
    <div className="absolute top-20 left-4 w-96 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl z-50 max-h-[calc(100vh-100px)] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-t-2xl border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">{flight.callsign}</h2>
              <p className="text-blue-100 text-sm">{flight.username}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Flight Info */}
      <div className="p-4 space-y-4">
        {/* Basic Info Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center mb-2">
                <Gauge className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-white font-semibold">{Math.round(flight.speed)}</p>
              <p className="text-gray-400 text-xs">Knots</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center mb-2">
                <Navigation className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-white font-semibold">{Math.round(flight.altitude).toLocaleString()}</p>
              <p className="text-gray-400 text-xs">Feet</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-gray-300 text-sm font-medium">Pilot</p>
              <p className="text-white text-sm truncate">{flight.username}</p>
              {flight.virtualOrganization && (
                <p className="text-blue-400 text-xs truncate">{flight.virtualOrganization}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
            <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-gray-300 text-sm font-medium">Flugzeug</p>
              <p className="text-white text-sm truncate">
                {aircraftLoading ? "Lädt..." : (aircraftName || flight.aircraft)}
              </p>
              <p className="text-gray-400 text-xs truncate">{liveryName || flight.livery}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-gray-300 text-sm font-medium">Position</p>
              <p className="text-white text-xs font-mono">
                {flight.latitude.toFixed(4)}, {flight.longitude.toFixed(4)}
              </p>
              <p className="text-gray-400 text-xs">Kurs: {Math.round(flight.heading)}°</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-gray-300 text-sm font-medium">Letztes Update</p>
              <p className="text-white text-sm">{formatLastUpdate(flight.lastReportTime)}</p>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        {showPerformanceChart && (
          <div className="mt-6">
            <PerformanceChart flight={flight} />
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightDetails;
