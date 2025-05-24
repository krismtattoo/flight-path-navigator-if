
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
      
      .aircraft-marker svg {
        /* Optimized SVG rendering */
        shape-rendering: optimizeSpeed;
        /* GPU acceleration for SVG */
        transform: translateZ(0);
        /* Smooth SVG transforms */
        transition: transform 0.1s ease-out;
        /* Prevent SVG blurriness */
        image-rendering: crisp-edges;
      }
      
      .aircraft-marker-selected {
        z-index: 1000 !important;
      }
      
      .aircraft-marker-selected svg {
        /* Enhanced glow for selected aircraft */
        filter: drop-shadow(0 0 8px rgba(255,255,255,0.8)) !important;
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
      
      /* SVG-specific optimizations */
      .aircraft-marker svg path {
        /* Optimize path rendering */
        vector-effect: non-scaling-stroke;
      }
    `}</style>
  );
};

export default MapStyles;
