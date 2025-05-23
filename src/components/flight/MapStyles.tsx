
import React from 'react';

const MapStyles = () => {
  return (
    <style>{`
      .mapboxgl-map {
        background-color: #f8fafc;
      }
      
      .aircraft-marker {
        transition: filter 0.3s ease;
      }
      
      .animate-pulse-subtle {
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
        100% {
          transform: scale(1);
        }
      }
    `}</style>
  );
};

export default MapStyles;
