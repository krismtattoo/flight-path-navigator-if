
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
      
      /* SIMPLIFIED aircraft marker styles */
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
      
      .leaflet-interactive {
        cursor: pointer;
      }
      
      /* ULTRA-SMOOTH route line styles - complete anti-aliasing system */
      .leaflet-interactive path,
      .ultra-smooth-route {
        shape-rendering: geometricPrecision !important;
        vector-effect: non-scaling-stroke !important;
        stroke-linecap: round !important;
        stroke-linejoin: round !important;
        image-rendering: optimizeQuality !important;
        image-rendering: -webkit-optimize-contrast !important;
        image-rendering: optimize-contrast !important;
        filter: none !important;
        -webkit-transform: translateZ(0) !important;
        transform: translateZ(0) !important;
        will-change: auto !important;
        backface-visibility: hidden !important;
      }
      
      /* Enhanced SVG rendering for ultra-smooth lines */
      .leaflet-overlay-pane svg {
        shape-rendering: geometricPrecision !important;
        image-rendering: optimizeQuality !important;
        image-rendering: -webkit-optimize-contrast !important;
        image-rendering: optimize-contrast !important;
        filter: none !important;
        -webkit-transform: translateZ(0) !important;
        transform: translateZ(0) !important;
        backface-visibility: hidden !important;
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
      }
      
      /* Perfect line rendering - no pixelation */
      .leaflet-overlay-pane path,
      .leaflet-overlay-pane polyline {
        stroke-linecap: round !important;
        stroke-linejoin: round !important;
        vector-effect: non-scaling-stroke !important;
        image-rendering: optimizeQuality !important;
        shape-rendering: geometricPrecision !important;
        filter: none !important;
        -webkit-transform: translateZ(0) !important;
        transform: translateZ(0) !important;
        backface-visibility: hidden !important;
      }
      
      /* Ultra-smooth polyline rendering */
      .leaflet-overlay-pane path[stroke] {
        stroke-linecap: round !important;
        stroke-linejoin: round !important;
        shape-rendering: geometricPrecision !important;
        image-rendering: optimizeQuality !important;
        vector-effect: non-scaling-stroke !important;
        filter: none !important;
        -webkit-transform: translateZ(0) !important;
        transform: translateZ(0) !important;
      }
      
      /* Specific ultra-smooth route class */
      .ultra-smooth-route path {
        stroke-linecap: round !important;
        stroke-linejoin: round !important;
        shape-rendering: geometricPrecision !important;
        image-rendering: optimizeQuality !important;
        vector-effect: non-scaling-stroke !important;
        filter: none !important;
        -webkit-transform: translateZ(0) !important;
        transform: translateZ(0) !important;
        backface-visibility: hidden !important;
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
      
      /* Global SVG anti-aliasing */
      svg path[stroke] {
        stroke-linecap: round !important;
        stroke-linejoin: round !important;
        shape-rendering: geometricPrecision !important;
        image-rendering: optimizeQuality !important;
        vector-effect: non-scaling-stroke !important;
      }
      
      /* Hardware acceleration for smooth rendering */
      .leaflet-overlay-pane * {
        image-rendering: optimizeQuality !important;
        shape-rendering: geometricPrecision !important;
        -webkit-transform: translateZ(0) !important;
        transform: translateZ(0) !important;
        backface-visibility: hidden !important;
      }
      
      /* Prevent ghost markers */
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
      
      .leaflet-control-attribution {
        background-color: rgba(255, 255, 255, 0.9);
        color: #333;
        font-size: 11px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      
      .leaflet-control-attribution a {
        color: #0078A8;
      }
      
      /* Ultimate smoothing - browser-specific optimizations */
      @supports (image-rendering: -webkit-optimize-contrast) {
        .leaflet-overlay-pane path,
        .ultra-smooth-route path {
          image-rendering: -webkit-optimize-contrast !important;
        }
      }
      
      @supports (image-rendering: optimize-contrast) {
        .leaflet-overlay-pane path,
        .ultra-smooth-route path {
          image-rendering: optimize-contrast !important;
        }
      }
      
      /* Force GPU acceleration for ultra-smooth lines */
      .leaflet-overlay-pane {
        -webkit-transform: translateZ(0) !important;
        transform: translateZ(0) !important;
        -webkit-perspective: 1000 !important;
        perspective: 1000 !important;
        -webkit-backface-visibility: hidden !important;
        backface-visibility: hidden !important;
      }
    `}</style>
  );
};

export default MapStyles;
