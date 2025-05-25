
import React from 'react';

const MapStyles = () => {
  return (
    <style>{`
      /* Static Blue World Map Background */
      .static-blue-world-map {
        background: 
          radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 40%),
          radial-gradient(circle at 75% 75%, rgba(96, 165, 250, 0.1) 0%, transparent 40%),
          linear-gradient(135deg, #0a1628 0%, #1e3a8a 25%, #0f172a 50%, #1e40af 75%, #0a1628 100%);
        position: relative;
      }
      
      /* World Map SVG Overlay with Clear Continents */
      .world-map-overlay {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 500'%3E%3Cpath fill='none' stroke='%2360a5f0' stroke-width='1.5' opacity='0.7' d='M150 200 L180 190 L220 200 L250 190 L280 200 L300 210 L320 200 L350 210 L380 200 L400 210 L420 200 L450 210 L480 200 L500 210 L520 200 L550 210 L580 200 L600 210 L620 200 L640 210 L660 200 L680 210 L700 200 L720 210 L740 200 L760 210 L780 200 L800 210 L820 200 L850 210 Z'/%3E%3Cpath fill='none' stroke='%2360a5f0' stroke-width='1.5' opacity='0.6' d='M100 250 L130 240 L160 250 L190 240 L220 250 L250 240 L280 250 L310 240 L340 250 L370 240 L400 250 L430 240 L460 250 L490 240 L520 250 L550 240 L580 250 L610 240 L640 250 L670 240 L700 250 L730 240 L760 250 L790 240 L820 250 L850 240 L880 250 Z'/%3E%3Cpath fill='none' stroke='%2360a5f0' stroke-width='1' opacity='0.5' d='M50 300 L80 290 L110 300 L140 290 L170 300 L200 290 L230 300 L260 290 L290 300 L320 290 L350 300 L380 290 L410 300 L440 290 L470 300 L500 290 L530 300 L560 290 L590 300 L620 290 L650 300 L680 290 L710 300 L740 290 L770 300 L800 290 L830 300 L860 290 L890 300 L920 290 L950 300 Z'/%3E%3C/svg%3E");
        background-size: 100% 100%;
        background-repeat: no-repeat;
        background-position: center;
        opacity: 0.8;
        pointer-events: none;
      }
      
      /* Add major continent outlines with CSS shapes */
      .world-map-overlay::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: 
          /* Europe */
          radial-gradient(ellipse 120px 80px at 48% 35%, transparent 45%, rgba(96, 165, 250, 0.6) 46%, rgba(96, 165, 250, 0.6) 54%, transparent 55%),
          /* Africa */
          radial-gradient(ellipse 100px 160px at 52% 55%, transparent 45%, rgba(96, 165, 250, 0.5) 46%, rgba(96, 165, 250, 0.5) 54%, transparent 55%),
          /* North America */
          radial-gradient(ellipse 140px 120px at 25% 40%, transparent 45%, rgba(96, 165, 250, 0.5) 46%, rgba(96, 165, 250, 0.5) 54%, transparent 55%),
          /* South America */
          radial-gradient(ellipse 80px 140px at 30% 70%, transparent 45%, rgba(96, 165, 250, 0.5) 46%, rgba(96, 165, 250, 0.5) 54%, transparent 55%),
          /* Asia */
          radial-gradient(ellipse 180px 120px at 70% 40%, transparent 45%, rgba(96, 165, 250, 0.4) 46%, rgba(96, 165, 250, 0.4) 54%, transparent 55%),
          /* Australia */
          radial-gradient(ellipse 60px 40px at 80% 75%, transparent 45%, rgba(96, 165, 250, 0.5) 46%, rgba(96, 165, 250, 0.5) 54%, transparent 55%);
        opacity: 0.9;
      }
      
      /* Add grid lines for better orientation */
      .world-map-overlay::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: 
          linear-gradient(rgba(96, 165, 250, 0.2) 1px, transparent 1px),
          linear-gradient(90deg, rgba(96, 165, 250, 0.2) 1px, transparent 1px);
        background-size: 80px 80px;
        opacity: 0.4;
      }
      
      /* Static Elegant Map Container */
      .leaflet-container {
        background: transparent !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      
      .static-elegant-map {
        background: transparent;
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
      
      .leaflet-tile {
        display: none;
      }
      
      .leaflet-tile-container {
        display: none;
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
      
      .leaflet-container .leaflet-control-container .leaflet-routing-container-hide {
        display: none;
      }
    `}</style>
  );
};

export default MapStyles;
