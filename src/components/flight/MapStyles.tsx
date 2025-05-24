
import React from 'react';

const MapStyles = () => {
  return (
    <style>{`
      .mapboxgl-map {
        background-color: #1a202c;
      }
      
      .aircraft-marker {
        will-change: transform;
        backface-visibility: hidden;
        transform-style: preserve-3d;
        /* Optimized for smooth animations */
        transition: none;
      }
      
      .aircraft-marker-selected {
        z-index: 1000 !important;
      }
      
      /* Optimize marker interactions */
      .mapboxgl-marker {
        pointer-events: auto;
        /* Reduce paint events */
        contain: layout style paint;
      }
      
      .mapboxgl-marker .aircraft-marker {
        pointer-events: auto;
        /* GPU acceleration for better performance */
        transform: translateZ(0);
      }
      
      /* Optimize map canvas performance */
      .mapboxgl-canvas {
        /* Enable hardware acceleration */
        transform: translateZ(0);
      }
      
      /* Reduce repaints on map interactions */
      .mapboxgl-control-container {
        contain: layout;
      }
    `}</style>
  );
};

export default MapStyles;
