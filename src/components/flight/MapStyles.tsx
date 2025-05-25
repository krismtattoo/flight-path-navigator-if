
import React from 'react';

const MapStyles = () => {
  return (
    <style>{`
      /* Dark Blue Map Theme */
      .leaflet-container {
        background-color: #0f1629;
        font-family: inherit;
      }
      
      .dark-blue-map {
        background-color: #0f1629;
      }
      
      /* Dark blue filter for tiles */
      .dark-blue-tiles {
        filter: hue-rotate(220deg) saturate(1.2) brightness(0.8) contrast(1.1);
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
        filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.8)) !important;
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
          filter: drop-shadow(0 0 12px rgba(96, 165, 250, 0.8)) drop-shadow(0 0 20px rgba(96, 165, 250, 0.4));
        }
        100% {
          filter: drop-shadow(0 0 16px rgba(96, 165, 250, 1)) drop-shadow(0 0 28px rgba(96, 165, 250, 0.6));
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
      
      /* Dark Blue Zoom Controls */
      .leaflet-control-zoom {
        border: none;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        background: rgba(15, 22, 41, 0.9);
        border-radius: 6px;
      }
      
      .leaflet-control-zoom a {
        background-color: rgba(15, 22, 41, 0.95);
        color: #e2e8f0;
        border: 1px solid rgba(96, 165, 250, 0.3);
        transition: all 0.2s ease;
      }
      
      .leaflet-control-zoom a:hover {
        background-color: rgba(96, 165, 250, 0.2);
        color: #96c7f2;
        border-color: rgba(96, 165, 250, 0.6);
      }
      
      .leaflet-control-zoom a:first-child {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
      }
      
      .leaflet-control-zoom a:last-child {
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
      }
      
      /* Enhanced route line styles for dark background */
      .leaflet-interactive {
        cursor: pointer;
      }
      
      /* Smooth route line optimizations with enhanced anti-aliasing for dark theme */
      .leaflet-interactive path {
        shape-rendering: geometricPrecision;
        vector-effect: non-scaling-stroke;
        stroke-linecap: round;
        stroke-linejoin: round;
        image-rendering: optimizeQuality;
        filter: none;
      }
      
      /* Route line anti-aliasing and ultra-smooth rendering for dark background */
      .leaflet-overlay-pane svg {
        shape-rendering: geometricPrecision;
        image-rendering: optimizeQuality;
        image-rendering: -webkit-optimize-contrast;
        image-rendering: optimize-contrast;
        filter: none;
      }
      
      .leaflet-overlay-pane path {
        stroke-linecap: round;
        stroke-linejoin: round;
        vector-effect: non-scaling-stroke;
        image-rendering: optimizeQuality;
        shape-rendering: geometricPrecision;
        filter: none;
      }
      
      /* Enhanced smoothing for polylines on dark background */
      .leaflet-overlay-pane polyline,
      .leaflet-overlay-pane path[stroke] {
        stroke-linecap: round;
        stroke-linejoin: round;
        shape-rendering: geometricPrecision;
        image-rendering: optimizeQuality;
        vector-effect: non-scaling-stroke;
        filter: none;
      }
      
      .leaflet-tile {
        filter: none;
        image-rendering: optimizeQuality;
      }
      
      /* Dark blue tile enhancement */
      .leaflet-tile-container img {
        filter: hue-rotate(220deg) saturate(1.2) brightness(0.8) contrast(1.1);
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
      
      /* Ultra-smooth line rendering enhancements for dark theme */
      svg path[stroke] {
        stroke-linecap: round;
        stroke-linejoin: round;
        shape-rendering: geometricPrecision;
        image-rendering: optimizeQuality;
        vector-effect: non-scaling-stroke;
      }
      
      /* Disable any pixelation or aliasing on dark background */
      .leaflet-overlay-pane * {
        image-rendering: optimizeQuality;
        shape-rendering: geometricPrecision;
      }
      
      /* Attribution styling for dark theme */
      .leaflet-control-attribution {
        background-color: rgba(15, 22, 41, 0.8);
        color: #94a3b8;
        border-radius: 4px;
        font-size: 11px;
      }
      
      .leaflet-control-attribution a {
        color: #96c7f2;
      }
      
      .leaflet-control-attribution a:hover {
        color: #bfdbfe;
      }
    `}</style>
  );
};

export default MapStyles;
