
import React from 'react';
import { Card } from '@/components/ui/card';
import { Plane } from 'lucide-react';

interface FlightCountProps {
  count: number;
}

const FlightCount: React.FC<FlightCountProps> = ({ count }) => {
  return (
    <div className="absolute bottom-4 left-4 z-10">
      <Card className="shadow-md bg-slate-800/95 backdrop-blur-sm border-slate-700 px-3 py-2">
        <p className="text-sm flex items-center gap-2 text-white">
          <span className="text-flight-light-blue">
            <Plane className="h-4 w-4" />
          </span>
          <span>{count} aircraft online</span>
        </p>
      </Card>
    </div>
  );
};

export default FlightCount;
