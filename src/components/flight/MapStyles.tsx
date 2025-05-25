
import React from 'react';

const MapStyles = () => {
  return (
    <style>{`
      /* CartoDB Positron map container styles */
      .leaflet-container {
        background-color: #ffffff;
        font-family: inherit;
      }
      
      /* Light styling for CartoDB Positron tiles */
      .leaflet-tile {
        filter: brightness(1.05) contrast(1.05) saturate(0.95);
        image-rendering: optimizeQuality;
      }
      
      .leaflet-tile-container img {
        filter: brightness(1.1) contrast(1.02) saturate(0.9);
      }
      
      /* SIMPLIFIED aircraft marker styles - removed problematic animations */
      .aircraft-marker {
        will-change: auto;
        backface-visibility: visible;
        transform-style: flat;
        transition: none;
        pointer-events: auto;
        cursor: pointer;
        z-index: 500;
      }
      
      .aircraft-marker svg,
      .aircraft-svg {
        shape-rendering: geometricPrecision;
        image-rendering: crisp-edges;
        image-rendering: -webkit-optimize-contrast;
        image-rendering: optimize-contrast;
        transform: translateZ(0);
        transition: none;
        filter-rendering: optimizeQuality;
        vector-effect: non-scaling-stroke;
      }
      
      /* SIMPLIFIED selected marker styles - no animations */
      .aircraft-marker-selected {
        z-index: 1000 !important;
        position: relative;
      }
      
      /* SAFE hover effect - no scaling that could cause issues */
      .aircraft-marker:hover {
        z-index: 999;
        opacity: 0.8;
      }
      
      /* Remove all problematic animations */
      .aircraft-marker,
      .aircraft-marker svg,
      .aircraft-marker-selected,
      .aircraft-marker-selected svg {
        animation: none !important;
        transform-origin: center center;
      }
      
      .leaflet-marker-icon {
        pointer-events: auto;
        contain: none;
        transform: translateZ(0);
        position: relative;
      }
      
      /* Ensure proper cleanup of marker icons */
      .leaflet-marker-icon.aircraft-marker {
        border: none;
        background: transparent;
        outline: none;
      }
      
      .leaflet-control-container {
        contain: layout;
      }
      
      /* Clean control styling for CartoDB Positron */
      .leaflet-control-zoom {
        border: none;
        box-shadow: 0 2px 10px rgba(0,0,0,0.15);
      }
      
      .leaflet-control-zoom a {
        background-color: rgba(255,255,255,0.95);
        color: #333;
        border: none;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      
      .leaflet-control-zoom a:hover {
        background-color: #fff;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      }
      
      /* Enhanced route line styles for smooth gradients and curves */
      .leaflet-interactive {
        cursor: pointer;
      }
      
      /* Smooth route line optimizations with enhanced anti-aliasing */
      .leaflet-interactive path {
        shape-rendering: geometricPrecision;
        vector-effect: non-scaling-stroke;
        stroke-linecap: round;
        stroke-linejoin: round;
        image-rendering: optimizeQuality;
        filter: none;
      }
      
      /* Route line anti-aliasing and ultra-smooth rendering */
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
      
      /* Enhanced smoothing for polylines */
      .leaflet-overlay-pane polyline,
      .leaflet-overlay-pane path[stroke] {
        stroke-linecap: round;
        stroke-linejoin: round;
        shape-rendering: geometricPrecision;
        image-rendering: optimizeQuality;
        vector-effect: non-scaling-stroke;
        filter: none;
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
      
      /* Ultra-smooth line rendering enhancements */
      svg path[stroke] {
        stroke-linecap: round;
        stroke-linejoin: round;
        shape-rendering: geometricPrecision;
        image-rendering: optimizeQuality;
        vector-effect: non-scaling-stroke;
      }
      
      /* Disable any pixelation or aliasing */
      .leaflet-overlay-pane * {
        image-rendering: optimizeQuality;
        shape-rendering: geometricPrecision;
      }
      
      /* CRITICAL: Prevent ghost markers from CSS transforms */
      .leaflet-marker-pane {
        position: relative;
        z-index: 600;
      }
      
      /* Ensure markers don't leave trails */
      .leaflet-marker-pane .leaflet-marker-icon {
        position: absolute;
        z-index: auto;
      }
      
      /* Force proper cleanup of marker transformations */
      .leaflet-zoom-anim .leaflet-marker-icon {
        transition: none !important;
        animation: none !important;
      }
      
      /* Clean map overlay for CartoDB Positron */
      .leaflet-control-attribution {
        background-color: rgba(255, 255, 255, 0.9);
        color: #333;
        font-size: 11px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      
      .leaflet-control-attribution a {
        color: #0078A8;
      }
    `}</style>
  );
};

export default MapStyles;
