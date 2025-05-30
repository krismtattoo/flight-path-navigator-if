
import React from 'react';
import { Radar, Search, Plane, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Server {
  id: string;
  name: string;
}

interface AviationHeaderProps {
  servers: Server[];
  activeServer: Server | null;
  onServerChange: (server: Server) => void;
  flightCount: number;
  onSearchClick: () => void;
}

const AviationHeader: React.FC<AviationHeaderProps> = ({
  servers,
  activeServer,
  onServerChange,
  flightCount,
  onSearchClick
}) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-50 glass-panel-dark entrance-animation">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Brand and Status */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Radar className="w-8 h-8 text-aviation-sky animate-pulse" />
              <div className="absolute inset-0 bg-aviation-sky/20 rounded-full animate-ping"></div>
            </div>
            <div>
              <h1 className="title-aviation text-xl">AVIATION RADAR</h1>
              <p className="text-aviation-sky/60 text-xs font-aviation tracking-wider">
                FLIGHT TRACKING SYSTEM
              </p>
            </div>
          </div>
          
          {/* Flight Count Display */}
          <div className="hud-element px-4 py-2 rounded-lg">
            <div className="flex items-center space-x-2">
              <Plane className="w-4 h-4" />
              <span className="text-sm font-bold">{flightCount}</span>
              <span className="text-xs opacity-75">AIRCRAFT</span>
            </div>
          </div>
          
          {/* Server Status */}
          {activeServer && (
            <div className="hud-element px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4" />
                <span className="text-sm font-bold">{activeServer.name}</span>
                <div className="w-2 h-2 bg-radar-green rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
        </div>

        {/* Center: Server Selection */}
        <div className="flex items-center space-x-2">
          {servers.map((server) => (
            <Button
              key={server.id}
              variant={activeServer?.id === server.id ? "default" : "outline"}
              size="sm"
              onClick={() => onServerChange(server)}
              className={`
                font-aviation text-xs tracking-wider transition-all duration-300
                ${activeServer?.id === server.id 
                  ? 'btn-aviation border-glow' 
                  : 'btn-aviation-outline hover:border-glow'
                }
              `}
            >
              {server.name}
            </Button>
          ))}
        </div>

        {/* Right: Search */}
        <div className="flex items-center">
          <Button
            onClick={onSearchClick}
            size="sm"
            className="btn-aviation glow-effect"
          >
            <Search className="w-4 h-4 mr-2" />
            <span className="font-aviation tracking-wider">SEARCH</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AviationHeader;
