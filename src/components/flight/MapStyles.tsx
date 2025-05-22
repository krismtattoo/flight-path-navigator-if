
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
      }
      .waypoint-popup .mapboxgl-popup-content {
        background-color: rgba(255,255,255,0.9);
        padding: 8px;
        font-size: 12px;
        border-radius: 4px;
        border-left: 3px solid #2271B3;
      }
      .mapboxgl-popup {
        z-index: 5;
      }`}
    </style>
  );
};

export default MapStyles;
