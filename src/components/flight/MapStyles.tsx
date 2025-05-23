
import React from 'react';

const MapStyles = () => {
  return (
    <style>{`
      .mapboxgl-map {
        background-color: #f8fafc;
      }
      
      .aircraft-marker {
        transition: all 0.3s ease;
      }
      
      .aircraft-marker:hover {
        transform: scale(1.1) !important;
      }
      
      .animate-pulse-subtle {
        animation: pulse-highlight 2s infinite;
      }
      
      @keyframes pulse-highlight {
        0% {
          transform: scale(1.2);
          opacity: 1;
        }
        50% {
          transform: scale(1.3);
          opacity: 0.9;
        }
        100% {
          transform: scale(1.2);
          opacity: 1;
        }
      }
    `}</style>
  );
};

export default MapStyles;
