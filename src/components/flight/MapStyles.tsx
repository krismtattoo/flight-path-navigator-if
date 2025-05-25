
import React from 'react';

const MapStyles = () => {
  return (
    <style>{`
      /* Leaflet map container styles */
      .leaflet-container {
        background-color: #f8f9fa;
        font-family: inherit;
      }
      
      .aircraft-marker {
        will-change: transform;
        backface-visibility: hidden;
        transform-style: preserve-3d;
        transition: all 0.2s ease-out;
        pointer-events: auto;
        cursor: pointer;
      }
      
      .aircraft-marker svg,
      .aircraft-svg {
        shape-rendering: geometricPrecision;
        image-rendering: crisp-edges;
        image-rendering: -webkit-optimize-contrast;
        image-rendering: optimize-contrast;
        transform: translateZ(0);
        transition: all 0.2s ease-out;
        filter-rendering: optimizeQuality;
        vector-effect: non-scaling-stroke;
      }
      
      .aircraft-marker-selected {
        z-index: 1000 !important;
        animation: aircraft-pulse 2s ease-in-out infinite;
      }
      
      .aircraft-marker-glow svg {
        animation: glow-pulse 1.5s ease-in-out infinite alternate;
      }
      
      .aircraft-marker:hover {
        transform: scale(1.1);
        z-index: 999;
      }
      
      .aircraft-marker:hover svg {
        filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6)) !important;
      }
      
      @keyframes aircraft-pulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }
      
      @keyframes glow-pulse {
        0% {
          filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.8)) drop-shadow(0 0 20px rgba(59, 130, 246, 0.4));
        }
        100% {
          filter: drop-shadow(0 0 16px rgba(59, 130, 246, 1)) drop-shadow(0 0 28px rgba(59, 130, 246, 0.6));
        }
      }
      
      .leaflet-marker-icon {
        pointer-events: auto;
        contain: layout style paint;
        transform: translateZ(0);
      }
      
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
      
      /* Enhanced route line styles for smooth gradients */
      .leaflet-interactive {
        cursor: pointer;
      }
      
      /* Smooth route line optimizations */
      .leaflet-interactive path {
        shape-rendering: geometricPrecision;
        vector-effect: non-scaling-stroke;
      }
      
      /* Route line anti-aliasing and smoothing */
      .leaflet-overlay-pane svg {
        shape-rendering: geometricPrecision;
      }
      
      .leaflet-overlay-pane path {
        stroke-linecap: round;
        stroke-linejoin: round;
        vector-effect: non-scaling-stroke;
      }
      
      .leaflet-tile {
        filter: none;
        image-rendering: optimizeQuality;
      }
      
      .leaflet-tile-container img {
        filter: brightness(1.1) contrast(1.05);
      }
      
      .aircraft-marker svg path {
        vector-effect: non-scaling-stroke;
      }
      
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
