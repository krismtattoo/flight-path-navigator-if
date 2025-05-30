
import React from 'react';
import { Map, Radar, Satellite, Activity, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FlightControlPanelProps {
  viewMode: 'standard' | 'radar' | 'satellite';
  onViewModeChange: (mode: 'standard' | 'radar' | 'satellite') => void;
  isLoading: boolean;
}

const FlightControlPanel: React.FC<FlightControlPanelProps> = ({
  viewMode,
  onViewModeChange,
  isLoading
}) => {
  const viewModes = [
    { id: 'standard', label: 'STANDARD', icon: Map },
    { id: 'radar', label: 'RADAR', icon: Radar },
    { id: 'satellite', label: 'SATELLITE', icon: Satellite }
  ] as const;

  return (
    <div className="absolute top-20 left-6 z-40 glass-panel rounded-xl p-4 entrance-animation">
      <div className="space-y-4">
        {/* View Mode Controls */}
        <div>
          <h3 className="subtitle-aviation text-sm mb-3">VIEW MODE</h3>
          <div className="space-y-2">
            {viewModes.map((mode) => {
              const Icon = mode.icon;
              const isActive = viewMode === mode.id;
              
              return (
                <Button
                  key={mode.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => onViewModeChange(mode.id)}
                  disabled={isLoading}
                  className={`
                    w-full justify-start font-aviation text-xs tracking-wider
                    ${isActive 
                      ? 'status-active border-glow' 
                      : 'btn-aviation-outline'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {mode.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* System Status */}
        <div className="border-t border-aviation-sky/20 pt-4">
          <h3 className="subtitle-aviation text-sm mb-3">SYSTEM STATUS</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">RADAR</span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-radar-amber animate-pulse' : 'bg-radar-green'}`}></div>
                <span className="font-aviation">{isLoading ? 'SCANNING' : 'ACTIVE'}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">COMMS</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-radar-green rounded-full animate-pulse"></div>
                <span className="font-aviation">ONLINE</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">NAV</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-radar-green rounded-full"></div>
                <span className="font-aviation">LOCKED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-t border-aviation-sky/20 pt-4">
          <h3 className="subtitle-aviation text-sm mb-3">QUICK ACTIONS</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start btn-aviation-outline text-xs"
            >
              <Activity className="w-4 h-4 mr-2" />
              REFRESH DATA
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start btn-aviation-outline text-xs"
            >
              <Globe className="w-4 h-4 mr-2" />
              CENTER MAP
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightControlPanel;
