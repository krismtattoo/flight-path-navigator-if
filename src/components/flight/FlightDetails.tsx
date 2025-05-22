
import React, { useState, useEffect } from 'react';
import { Flight } from '@/services/flight';
import { X } from 'lucide-react';
import { Button } from '../ui/button';

interface FlightDetailsProps {
  flight: Flight;
  serverID: string;
  onClose: () => void;
}

const FlightDetails: React.FC<FlightDetailsProps> = ({ flight, serverID, onClose }) => {
  const [showMore, setShowMore] = useState(false);
  
  // Format last report time
  const formatTime = (timestamp: number): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Unknown';
    }
  };

  useEffect(() => {
    // Reset state when flight changes
    setShowMore(false);
  }, [flight]);

  return (
    <div className="absolute top-16 right-0 p-4 z-10 w-80 max-h-[80vh] overflow-y-auto">
      <div className="bg-[#151920] border border-gray-700 rounded-md shadow-xl text-white">
        <div className="flex justify-between items-center border-b border-gray-700 p-3">
          <div className="flex flex-col">
            <div className="flex space-x-2 items-baseline">
              <span className="font-bold text-lg">{flight.callsign}</span>
              <span className="text-sm text-gray-400">{flight.username}</span>
            </div>
            <div className="text-xs text-gray-300">{serverID}</div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-400 hover:text-white" 
            onClick={onClose}
          >
            <X size={18} />
          </Button>
        </div>
        
        <div className="p-3 border-b border-gray-700">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-400">Aircraft</span>
            <span className="font-medium">{flight.aircraft}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-400">Livery</span>
            <span className="font-medium">{flight.livery}</span>
          </div>
          {flight.virtualOrganization && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">VA/Group</span>
              <span className="font-medium">{flight.virtualOrganization}</span>
            </div>
          )}
        </div>
        
        <div className="p-3 border-b border-gray-700">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-sm text-gray-400">Altitude</div>
              <div className="font-medium">{Math.round(flight.altitude)} ft</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Speed</div>
              <div className="font-medium">{Math.round(flight.speed)} kts</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Heading</div>
              <div className="font-medium">{Math.round(flight.heading)}°</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Last Update</div>
              <div className="font-medium">{formatTime(flight.lastReportTime)}</div>
            </div>
          </div>
        </div>
        
        <div className="p-3">
          <Button 
            variant="outline" 
            className="w-full text-sm border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-300"
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? 'Show Less' : 'Show More'}
          </Button>
          
          {showMore && (
            <div className="mt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Flight ID</span>
                <span className="text-xs text-gray-300 font-mono">{flight.flightId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">User ID</span>
                <span className="text-xs text-gray-300 font-mono">{flight.userId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Position</span>
                <span className="text-xs text-gray-300 font-mono">
                  {flight.latitude.toFixed(4)}, {flight.longitude.toFixed(4)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlightDetails;
