
import React from 'react';

const MapStyles = () => {
  return (
    <style>{`
      /* CartoDB Dark Matter map container styles */
      .leaflet-container {
        background-color: #1a1a1a;
        font-family: inherit;
      }
      
      /* Dark styling for CartoDB Dark Matter tiles */
      .leaflet-tile {
        filter: brightness(0.9) contrast(1.1) saturate(1.1);
        image-rendering: optimizeQuality;
      }
      
      .leaflet-tile-container img {
        filter: brightness(0.95) contrast(1.05) saturate(1.05);
      }
      
      /* ... keep existing code (aircraft marker styles) */
      
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
      
      .aircraft-marker-selected {
        z-index: 1000 !important;
        position: relative;
      }
      
      .aircraft-marker:hover {
        z-index: 999;
        opacity: 0.8;
      }
      
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
      
      .leaflet-marker-icon.aircraft-marker {
        border: none;
        background: transparent;
        outline: none;
      }
      
      .leaflet-control-container {
        contain: layout;
      }
      
      /* Dark control styling for CartoDB Dark Matter */
      .leaflet-control-zoom {
        border: none;
        box-shadow: 0 2px 10px rgba(0,0,0,0.4);
      }
      
      .leaflet-control-zoom a {
        background-color: rgba(45, 45, 45, 0.95);
        color: #ffffff;
        border: none;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      }
      
      .leaflet-control-zoom a:hover {
        background-color: rgba(60, 60, 60, 1);
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      }
      
      /* ... keep existing code (route line styles and other marker optimizations) */
      
      .leaflet-interactive {
        cursor: pointer;
      }
      
      .leaflet-interactive path {
        shape-rendering: geometricPrecision;
        vector-effect: non-scaling-stroke;
        stroke-linecap: round;
        stroke-linejoin: round;
        image-rendering: optimizeQuality;
        filter: none;
      }
      
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
      
      svg path[stroke] {
        stroke-linecap: round;
        stroke-linejoin: round;
        shape-rendering: geometricPrecision;
        image-rendering: optimizeQuality;
        vector-effect: non-scaling-stroke;
      }
      
      .leaflet-overlay-pane * {
        image-rendering: optimizeQuality;
        shape-rendering: geometricPrecision;
      }
      
      .leaflet-marker-pane {
        position: relative;
        z-index: 600;
      }
      
      .leaflet-marker-pane .leaflet-marker-icon {
        position: absolute;
        z-index: auto;
      }
      
      .leaflet-zoom-anim .leaflet-marker-icon {
        transition: none !important;
        animation: none !important;
      }
      
      /* Dark map overlay for CartoDB Dark Matter */
      .leaflet-control-attribution {
        background-color: rgba(45, 45, 45, 0.9);
        color: #cccccc;
        font-size: 11px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      }
      
      .leaflet-control-attribution a {
        color: #66B2FF;
      }
    `}</style>
  );
};

export default MapStyles;
