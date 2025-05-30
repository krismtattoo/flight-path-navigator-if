
import React from 'react';
import { Plane } from 'lucide-react';

interface FlightCountProps {
  count: number;
  loading?: boolean;
}

const FlightCount: React.FC<FlightCountProps> = ({ count, loading = false }) => {
  return (
    <div className="hud-element px-4 py-2 rounded-lg">
      <div className="flex items-center space-x-2">
        <Plane className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
        <span className="text-sm font-bold">{loading ? '...' : count}</span>
        <span className="text-xs opacity-75">AIRCRAFT</span>
      </div>
    </div>
  );
};

export default FlightCount;
