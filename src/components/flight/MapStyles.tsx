
import React from 'react';

const MapStyles: React.FC = () => {
  return (
    <style>
      {`.aircraft-marker {
        transition: transform 0.5s ease;
      }
      .animate-pulse-subtle {
        animation: pulse-subtle 2s infinite;
      }
      @keyframes pulse-subtle {
        0% { opacity: 0.8; }
        50% { opacity: 1; }
        100% { opacity: 0.8; }
      }`}
    </style>
  );
};

export default MapStyles;
