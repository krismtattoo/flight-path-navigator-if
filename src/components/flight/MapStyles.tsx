
import React from 'react';

const MapStyles = () => {
  return (
    <style>{`
      /* Leaflet map container styles */
      .leaflet-container {
        background-color: #1a202c;
        font-family: inherit;
      }
      
      /* Aircraft marker optimizations */
      .aircraft-marker {
        will-change: transform;
        backface-visibility: hidden;
        transform-style: preserve-3d;
        transition: none;
        pointer-events: auto;
        cursor: pointer;
      }
      
      .aircraft-marker svg {
        shape-rendering: optimizeSpeed;
        transform: translateZ(0);
        transition: transform 0.1s ease-out;
        image-rendering: crisp-edges;
      }
      
      .aircraft-marker-selected {
        z-index: 1000 !important;
      }
      
      .aircraft-marker-selected svg {
        filter: drop-shadow(0 0 8px rgba(255,255,255,0.8)) !important;
      }
      
      /* Leaflet marker optimizations */
      .leaflet-marker-icon {
        pointer-events: auto;
        contain: layout style paint;
        transform: translateZ(0);
      }
      
      /* Leaflet controls styling */
      .leaflet-control-container {
        contain: layout;
      }
      
      .leaflet-control-zoom {
        border: none;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      }
      
      .leaflet-control-zoom a {
        background-color: rgba(255,255,255,0.9);
        color: #333;
        border: none;
      }
      
      .leaflet-control-zoom a:hover {
        background-color: #fff;
      }
      
      /* Route line optimizations */
      .leaflet-interactive {
        cursor: pointer;
      }
      
      /* Tile layer optimizations */
      .leaflet-tile {
        filter: none;
        image-rendering: optimizeQuality;
      }
      
      /* Dark theme for map tiles */
      .leaflet-tile-container img {
        filter: brightness(0.8) contrast(1.1);
      }
      
      /* SVG-specific optimizations for aircraft markers */
      .aircraft-marker svg path {
        vector-effect: non-scaling-stroke;
      }
      
      /* Performance optimizations */
      .leaflet-zoom-animated {
        transform: translateZ(0);
      }
      
      .leaflet-layer {
        transform: translateZ(0);
      }
    `}</style>
  );
};

export default MapStyles;
