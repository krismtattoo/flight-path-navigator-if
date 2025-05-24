
import React from 'react';

const MapStyles = () => {
  return (
    <style>{`
      .mapboxgl-map {
        background-color: #f8fafc;
      }
      
      .aircraft-marker {
        /* Removed problematic transitions and hover effects */
        will-change: transform;
        backface-visibility: hidden;
        transform-style: preserve-3d;
      }
      
      .aircraft-marker-selected {
        z-index: 1000 !important;
      }
      
      /* Prevent marker from interfering with map interactions */
      .mapboxgl-marker {
        pointer-events: auto;
      }
      
      .mapboxgl-marker .aircraft-marker {
        pointer-events: auto;
      }
    `}</style>
  );
};

export default MapStyles;
