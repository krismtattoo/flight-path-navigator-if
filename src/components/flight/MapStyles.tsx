
import React from 'react';

const MapStyles = () => {
  return (
    <style>{`
      .mapboxgl-map {
        background-color: #0a0e1a;
      }
      
      .aircraft-marker {
        filter: brightness(1.5) hue-rotate(15deg);
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
