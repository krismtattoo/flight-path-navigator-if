
import React from 'react';

const MapStyles = () => {
  return (
    <style jsx global>{`
      .mapboxgl-map {
        background-color: #151920;
      }
      
      .aircraft-marker {
        filter: brightness(1.2);
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
