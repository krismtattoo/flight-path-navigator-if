
import React from 'react';

const MapStyles = () => {
  return (
    <style>{`
      /* Minimalist Elegant Dark Blue Map Theme */
      .leaflet-container {
        background: linear-gradient(135deg, #0a1628 0%, #1e3a8a 50%, #0f172a 100%);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      
      .minimalist-elegant-map {
        background: transparent;
      }
      
      /* Ultra-minimalist tile styling with elegant blue filter */
      .minimalist-blue-tiles {
        filter: 
          grayscale(100%) 
          brightness(0.3) 
          contrast(2) 
          hue-rotate(220deg) 
          saturate(0.8)
          opacity(0.7);
        mix-blend-mode: screen;
      }
      
      /* Enhanced aircraft markers for elegant look */
      .aircraft-marker {
        will-change: transform;
        backface-visibility: hidden;
        transform-style: preserve-3d;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: auto;
        cursor: pointer;
        filter: drop-shadow(0 2px 8px rgba(96, 165, 250, 0.3));
      }
      
      .aircraft-marker svg,
      .aircraft-svg {
        shape-rendering: geometricPrecision;
        image-rendering: crisp-edges;
        transform: translateZ(0);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        filter-rendering: optimizeQuality;
        vector-effect: non-scaling-stroke;
      }
      
      .aircraft-marker-selected {
        z-index: 1000 !important;
        animation: elegant-pulse 2.5s ease-in-out infinite;
        filter: drop-shadow(0 0 20px rgba(147, 197, 253, 0.8)) drop-shadow(0 0 40px rgba(147, 197, 253, 0.4));
      }
      
      .aircraft-marker-glow svg {
        animation: elegant-glow 2s ease-in-out infinite alternate;
      }
      
      .aircraft-marker:hover {
        transform: scale(1.15);
        z-index: 999;
        filter: drop-shadow(0 0 16px rgba(147, 197, 253, 0.6));
      }
      
      @keyframes elegant-pulse {
        0%, 100% {
          transform: scale(1);
          filter: drop-shadow(0 0 20px rgba(147, 197, 253, 0.8)) drop-shadow(0 0 40px rgba(147, 197, 253, 0.4));
        }
        50% {
          transform: scale(1.08);
          filter: drop-shadow(0 0 24px rgba(147, 197, 253, 1)) drop-shadow(0 0 48px rgba(147, 197, 253, 0.6));
        }
      }
      
      @keyframes elegant-glow {
        0% {
          filter: drop-shadow(0 0 20px rgba(147, 197, 253, 0.8)) drop-shadow(0 0 40px rgba(147, 197, 253, 0.4));
        }
        100% {
          filter: drop-shadow(0 0 28px rgba(147, 197, 253, 1)) drop-shadow(0 0 56px rgba(147, 197, 253, 0.7));
        }
      }
      
      .leaflet-marker-icon {
        pointer-events: auto;
        contain: layout style paint;
        transform: translateZ(0);
      }
      
      /* Elegant Zoom Controls */
      .leaflet-control-zoom {
        border: none;
        box-shadow: 
          0 8px 32px rgba(10, 22, 40, 0.4),
          0 2px 8px rgba(10, 22, 40, 0.3),
          inset 0 1px 0 rgba(147, 197, 253, 0.1);
        background: rgba(10, 22, 40, 0.85);
        backdrop-filter: blur(12px);
        border-radius: 12px;
        border: 1px solid rgba(147, 197, 253, 0.2);
      }
      
      .leaflet-control-zoom a {
        background: rgba(10, 22, 40, 0.9);
        color: #93c5fd;
        border: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-weight: 500;
        width: 34px;
        height: 34px;
        line-height: 32px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .leaflet-control-zoom a:hover {
        background: rgba(147, 197, 253, 0.15);
        color: #bfdbfe;
        transform: scale(1.05);
        box-shadow: inset 0 0 12px rgba(147, 197, 253, 0.2);
      }
      
      .leaflet-control-zoom a:first-child {
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
      }
      
      .leaflet-control-zoom a:last-child {
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
      }
      
      /* Ultra-smooth route lines for elegant design */
      .leaflet-interactive path {
        shape-rendering: geometricPrecision;
        vector-effect: non-scaling-stroke;
        stroke-linecap: round;
        stroke-linejoin: round;
        image-rendering: optimizeQuality;
        filter: drop-shadow(0 1px 3px rgba(10, 22, 40, 0.3));
      }
      
      .leaflet-overlay-pane svg {
        shape-rendering: geometricPrecision;
        image-rendering: optimizeQuality;
        filter: none;
      }
      
      .leaflet-overlay-pane path {
        stroke-linecap: round;
        stroke-linejoin: round;
        vector-effect: non-scaling-stroke;
        image-rendering: optimizeQuality;
        shape-rendering: geometricPrecision;
      }
      
      /* Enhanced polyline smoothing */
      .leaflet-overlay-pane polyline,
      .leaflet-overlay-pane path[stroke] {
        stroke-linecap: round;
        stroke-linejoin: round;
        shape-rendering: geometricPrecision;
        image-rendering: optimizeQuality;
        vector-effect: non-scaling-stroke;
        filter: drop-shadow(0 1px 2px rgba(10, 22, 40, 0.2));
      }
      
      .leaflet-tile {
        filter: none;
        image-rendering: optimizeQuality;
      }
      
      /* Elegant tile enhancement */
      .leaflet-tile-container img {
        filter: 
          grayscale(100%) 
          brightness(0.3) 
          contrast(2) 
          hue-rotate(220deg) 
          saturate(0.8)
          opacity(0.7);
        mix-blend-mode: screen;
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
      
      /* Ultra-smooth line rendering */
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
      
      /* Elegant attribution styling */
      .leaflet-control-attribution {
        background: rgba(10, 22, 40, 0.75);
        backdrop-filter: blur(8px);
        color: #94a3b8;
        border-radius: 8px;
        font-size: 11px;
        border: 1px solid rgba(147, 197, 253, 0.15);
        box-shadow: 0 4px 16px rgba(10, 22, 40, 0.3);
      }
      
      .leaflet-control-attribution a {
        color: #93c5fd;
        transition: color 0.2s ease;
      }
      
      .leaflet-control-attribution a:hover {
        color: #bfdbfe;
      }
      
      /* Remove any unwanted map decorations */
      .leaflet-container .leaflet-control-container .leaflet-routing-container-hide {
        display: none;
      }
      
      /* Elegant gradient overlay for depth */
      .leaflet-container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at center, transparent 0%, rgba(10, 22, 40, 0.1) 100%);
        pointer-events: none;
        z-index: 1000;
      }
    `}</style>
  );
};

export default MapStyles;
