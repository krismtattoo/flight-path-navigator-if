
import React, { useMemo } from 'react';
import { Flight } from '@/services/flight';
import { Plane, Navigation } from 'lucide-react';

interface RadarDisplayProps {
  flights: Flight[];
  onFlightSelect: (flight: Flight) => void;
  selectedFlightId: string | null;
}

const RadarDisplay: React.FC<RadarDisplayProps> = ({
  flights,
  onFlightSelect,
  selectedFlightId
}) => {
  // Calculate radar scope dimensions
  const radarSize = 400;
  const centerX = radarSize / 2;
  const centerY = radarSize / 2;
  const maxRadius = radarSize / 2 - 20;

  // Convert flights to radar positions
  const radarFlights = useMemo(() => {
    if (flights.length === 0) return [];

    // Calculate bounds
    const lats = flights.map(f => f.latitude);
    const lngs = flights.map(f => f.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const latRange = maxLat - minLat || 1;
    const lngRange = maxLng - minLng || 1;
    const maxRange = Math.max(latRange, lngRange);

    return flights.map(flight => {
      const x = centerX + ((flight.longitude - centerLng) / maxRange) * maxRadius;
      const y = centerY - ((flight.latitude - centerLat) / maxRange) * maxRadius;
      
      return {
        ...flight,
        x: Math.max(20, Math.min(radarSize - 20, x)),
        y: Math.max(20, Math.min(radarSize - 20, y))
      };
    });
  }, [flights, radarSize, centerX, centerY, maxRadius]);

  const getAltitudeColor = (altitude: number) => {
    if (altitude > 35000) return '#00FF41'; // High altitude - green
    if (altitude > 20000) return '#FFB000'; // Medium altitude - amber
    if (altitude > 10000) return '#0EA5E9'; // Low altitude - blue
    return '#FF0040'; // Very low/ground - red
  };

  return (
    <div className="absolute inset-0 z-30 bg-radar-background">
      {/* Radar Display */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div 
          className="relative border-2 border-radar-green rounded-full radar-grid"
          style={{ width: radarSize, height: radarSize }}
        >
          {/* Radar Rings */}
          {[0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <div
              key={index}
              className="absolute border border-radar-green/30 rounded-full"
              style={{
                width: `${ratio * 100}%`,
                height: `${ratio * 100}%`,
                top: `${(1 - ratio) * 50}%`,
                left: `${(1 - ratio) * 50}%`,
              }}
            />
          ))}

          {/* Radar Sweep */}
          <div className="absolute inset-0 radar-sweep rounded-full"></div>

          {/* Center Cross */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-0.5 bg-radar-green"></div>
            <div className="w-0.5 h-8 bg-radar-green absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>

          {/* Aircraft Blips */}
          {radarFlights.map((flight) => (
            <div
              key={flight.flightId}
              className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                selectedFlightId === flight.flightId ? 'scale-150' : 'hover:scale-125'
              }`}
              style={{
                left: flight.x,
                top: flight.y,
              }}
              onClick={() => onFlightSelect(flight)}
            >
              <div 
                className="w-3 h-3 rounded-full animate-pulse-subtle border border-white/50"
                style={{ 
                  backgroundColor: getAltitudeColor(flight.altitude),
                  boxShadow: `0 0 10px ${getAltitudeColor(flight.altitude)}`
                }}
              />
              
              {/* Flight Info on Hover */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                <div className="font-aviation">{flight.flightId}</div>
                <div>{Math.round(flight.altitude)}ft</div>
                <div>{Math.round(flight.speed)}kts</div>
              </div>
            </div>
          ))}
        </div>

        {/* Radar Info Panel */}
        <div className="absolute top-4 right-4 glass-panel p-4 rounded-lg">
          <h3 className="font-aviation text-radar-green text-sm mb-2">RADAR SCOPE</h3>
          <div className="space-y-1 text-xs font-aviation">
            <div className="flex justify-between">
              <span className="text-gray-400">CONTACTS:</span>
              <span className="text-radar-green">{flights.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">RANGE:</span>
              <span className="text-radar-green">AUTO</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">MODE:</span>
              <span className="text-radar-green">SEARCH</span>
            </div>
          </div>
        </div>

        {/* Altitude Legend */}
        <div className="absolute bottom-4 right-4 glass-panel p-4 rounded-lg">
          <h3 className="font-aviation text-radar-green text-sm mb-2">ALTITUDE</h3>
          <div className="space-y-2 text-xs font-aviation">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#00FF41]"></div>
              <span>FL350+</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#FFB000]"></div>
              <span>FL200-350</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#0EA5E9]"></div>
              <span>FL100-200</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#FF0040]"></div>
              <span>Below FL100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadarDisplay;
