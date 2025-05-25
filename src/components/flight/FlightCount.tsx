
import React from 'react';
import { Plane } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface FlightCountProps {
  count: number;
}

const FlightCount: React.FC<FlightCountProps> = ({ count }) => {
  return (
    <div className="absolute bottom-4 left-4 z-10">
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200 px-3 py-2 sm:px-4 sm:py-3">
        <div className="flex items-center gap-2 text-sm sm:text-base">
          <Plane className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          <span className="font-medium text-gray-800">
            <span className="hidden sm:inline">Flugzeuge: </span>
            {count.toLocaleString()}
          </span>
        </div>
      </Card>
    </div>
  );
};

export default FlightCount;
