
import React from 'react';
import { Card } from '@/components/ui/card';

interface LoadingIndicatorProps {
  message: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message }) => {
  return (
    <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-10">
      <Card className="shadow-md bg-white/90 backdrop-blur-sm px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-flight-dark-blue"></div>
          <p>{message}</p>
        </div>
      </Card>
    </div>
  );
};

export default LoadingIndicator;
