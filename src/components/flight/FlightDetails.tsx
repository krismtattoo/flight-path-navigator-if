
import React, { useState, useEffect } from 'react';
import { X, Plane, MapPin, Clock, User, Navigation, Gauge, Zap, Route, Fuel, BarChart3, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Flight, FlightTrackPoint } from '@/services/flight';
import { toast } from "sonner";
import PerformanceChart from './PerformanceChart';

interface FlightDetailsProps {
  flight: Flight;
  serverID: string;
  flownRoute: FlightTrackPoint[];
  flightPlan: FlightTrackPoint[];
  onClose: () => void;
}

const FlightDetails: React.FC<FlightDetailsProps> = ({ flight, serverID, flownRoute, flightPlan, onClose }) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'route' | 'performance' | 'pilot'>('overview');

  // Helper function to format flight time
  const formatFlightTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Helper function to get aircraft status
  const getAircraftStatus = (): { status: string; color: string } => {
    if (flight.altitude < 100 && flight.speed < 50) {
      return { status: 'On Ground', color: 'bg-gray-500' };
    } else if (flight.speed < 80) {
      return { status: 'Taxiing', color: 'bg-yellow-500' };
    } else if (flight.altitude < 1000) {
      return { status: 'Departing', color: 'bg-blue-500' };
    } else if (flight.speed > 200) {
      return { status: 'Cruising', color: 'bg-green-500' };
    } else {
      return { status: 'Climbing', color: 'bg-purple-500' };
    }
  };

  const aircraftStatus = getAircraftStatus();

  // Generate mock performance data based on current flight data
  const generatePerformanceData = () => {
    const data = [];
    const now = new Date();
    
    // Generate 10 data points over the last hour
    for (let i = 9; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 6 * 60 * 1000); // 6 minutes apart
      const variation = Math.random() * 0.2 - 0.1; // ±10% variation
      
      data.push({
        time: time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        altitude: Math.max(0, flight.altitude + (flight.altitude * variation)),
        speed: Math.max(0, flight.speed + (flight.speed * variation * 0.5)),
        verticalSpeed: (Math.random() - 0.5) * 1000, // Random vertical speed
        heading: flight.heading
      });
    }
    
    return data;
  };

  // Section renderers
  const renderOverviewSection = () => (
    <div className="space-y-6">
      {/* Aircraft & Flight Status */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Plane className="w-5 h-5 text-blue-400" />
            Aircraft & Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Aircraft</p>
              <p className="text-white font-medium">{flight.aircraft}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Livery</p>
              <p className="text-white font-medium">{flight.livery}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-400">Status:</p>
            <Badge className={`${aircraftStatus.color} text-white border-none`}>
              {aircraftStatus.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Flight Data Grid - All three in one row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center mb-2">
              <Gauge className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-xl font-bold text-white">{Math.round(flight.altitude)}</p>
            <p className="text-xs text-gray-400">Altitude (ft)</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-xl font-bold text-white">{Math.round(flight.speed)}</p>
            <p className="text-xs text-gray-400">Speed (kts)</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center mb-2">
              <Navigation className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-xl font-bold text-white">{Math.round(flight.heading)}°</p>
            <p className="text-xs text-gray-400">Heading</p>
          </CardContent>
        </Card>
      </div>

      {/* Flight Information */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Route className="w-5 h-5 text-green-400" />
            Flight Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Flight Plan</p>
              <p className="text-white font-medium">{flightPlan.length > 0 ? `${flightPlan.length} waypoints` : 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Track</p>
              <p className="text-white font-medium">{Math.round(flight.heading)}°</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Ground Speed</p>
              <p className="text-white font-medium">{Math.round(flight.speed)} kts</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Vertical Speed</p>
              <p className="text-white font-medium">N/A ft/min</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Position Information */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-400" />
            Position
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Latitude</p>
              <p className="text-white font-mono text-sm">{flight.latitude.toFixed(6)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Longitude</p>
              <p className="text-white font-mono text-sm">{flight.longitude.toFixed(6)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRouteSection = () => (
    <div className="space-y-6">
      {/* Route Overview */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Route className="w-5 h-5 text-white" />
            </div>
            Flight Route Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Route Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <p className="text-sm text-gray-300">Flight Plan</p>
              </div>
              <p className="text-xl font-bold text-white">
                {flightPlan.length > 0 ? `${flightPlan.length} Waypoints` : 'Not Filed'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {flightPlan.length > 0 ? 'Active route' : 'Visual flight'}
              </p>
            </div>
            
            <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <p className="text-sm text-gray-300">Track History</p>
              </div>
              <p className="text-xl font-bold text-white">
                {flownRoute.length > 0 ? `${flownRoute.length} Points` : 'No Data'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {flownRoute.length > 0 ? 'Recording active' : 'No history'}
              </p>
            </div>
          </div>

          {/* Current Position */}
          <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-red-400" />
              <p className="text-sm font-medium text-gray-300">Current Position</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Latitude</p>
                <p className="text-white font-mono">{flight.latitude.toFixed(6)}°</p>
              </div>
              <div>
                <p className="text-gray-400">Longitude</p>
                <p className="text-white font-mono">{flight.longitude.toFixed(6)}°</p>
              </div>
              <div>
                <p className="text-gray-400">Heading</p>
                <p className="text-white font-medium">{Math.round(flight.heading)}°</p>
              </div>
              <div>
                <p className="text-gray-400">Altitude</p>
                <p className="text-white font-medium">{Math.round(flight.altitude)} ft</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Flight Plan Waypoints */}
      {flightPlan.length > 0 ? (
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Navigation className="w-5 h-5 text-white" />
              </div>
              Flight Plan Details
              <Badge className="bg-green-600 text-white border-none ml-auto">
                {flightPlan.length} Waypoints
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {flightPlan.map((waypoint, index) => (
                  <div key={index} className="group relative">
                    {/* Connection line */}
                    {index < flightPlan.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-8 bg-gradient-to-b from-blue-400 to-indigo-500"></div>
                    )}
                    
                    <div className="bg-slate-700/40 hover:bg-slate-700/60 transition-all duration-200 rounded-xl p-4 border border-slate-600/50 hover:border-blue-500/50">
                      <div className="flex items-center gap-4">
                        {/* Waypoint number */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            {index + 1}
                          </div>
                        </div>
                        
                        {/* Waypoint details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-semibold truncate">
                              {waypoint.waypointName || `Waypoint ${index + 1}`}
                            </h4>
                            <Badge variant="outline" className="text-xs border-slate-500 text-slate-300">
                              #{String(index + 1).padStart(2, '0')}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-gray-400 text-xs">Position</p>
                              <p className="text-white font-mono text-xs">
                                {waypoint.latitude.toFixed(4)}, {waypoint.longitude.toFixed(4)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs">Altitude</p>
                              <div className="flex items-center gap-1">
                                <Gauge className="w-3 h-3 text-blue-400" />
                                <p className="text-white font-medium">{Math.round(waypoint.altitude)} ft</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600 shadow-xl">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center">
                <Route className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">No Flight Plan Filed</h3>
                <p className="text-gray-400 text-sm max-w-sm mx-auto">
                  This flight is operating under visual flight rules (VFR) or the pilot hasn't filed a flight plan with the system.
                </p>
              </div>
              <div className="flex justify-center">
                <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                  VFR Flight
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderPerformanceSection = () => (
    <div className="space-y-4">
      <PerformanceChart 
        data={generatePerformanceData()}
        currentAltitude={flight.altitude}
        currentSpeed={flight.speed}
      />
      
      {/* Performance Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-4 h-4 text-blue-400" />
              <p className="text-sm text-gray-400">Max Altitude</p>
            </div>
            <p className="text-xl font-bold text-white">{Math.round(flight.altitude)} ft</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-green-400" />
              <p className="text-sm text-gray-400">Max Speed</p>
            </div>
            <p className="text-xl font-bold text-white">{Math.round(flight.speed)} kts</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPilotSection = () => (
    <div className="space-y-4">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" />
            Pilot Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-400">Display Name</p>
            <p className="text-white font-medium">{flight.username}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400">Username</p>
            <p className="text-white font-medium">{flight.username}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400">Virtual Organization</p>
            <p className="text-white font-medium">{flight.virtualOrganization || 'None'}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400">Flight ID</p>
            <p className="text-white font-mono text-sm">{flight.flightId}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="fixed top-20 right-4 w-96 z-50">
      <Card className="bg-slate-900 border-slate-700 shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <CardHeader className="pb-4 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl font-bold text-white truncate">
                {flight.callsign}
              </CardTitle>
              <p className="text-sm text-gray-400 mt-1">{flight.aircraft}</p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-slate-800 ml-2 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex gap-1 mt-4 bg-slate-800 p-1 rounded-lg">
            <Button
              onClick={() => setActiveSection('overview')}
              variant={activeSection === 'overview' ? 'default' : 'ghost'}
              size="sm"
              className={`flex-1 text-xs h-8 ${
                activeSection === 'overview' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'text-gray-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Plane className="w-3 h-3 mr-1" />
              Overview
            </Button>
            <Button
              onClick={() => setActiveSection('route')}
              variant={activeSection === 'route' ? 'default' : 'ghost'}
              size="sm"
              className={`flex-1 text-xs h-8 ${
                activeSection === 'route' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'text-gray-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Route className="w-3 h-3 mr-1" />
              Route
            </Button>
            <Button
              onClick={() => setActiveSection('performance')}
              variant={activeSection === 'performance' ? 'default' : 'ghost'}
              size="sm"
              className={`flex-1 text-xs h-8 ${
                activeSection === 'performance' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'text-gray-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <BarChart3 className="w-3 h-3 mr-1" />
              Performance
            </Button>
            <Button
              onClick={() => setActiveSection('pilot')}
              variant={activeSection === 'pilot' ? 'default' : 'ghost'}
              size="sm"
              className={`flex-1 text-xs h-8 ${
                activeSection === 'pilot' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'text-gray-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <User className="w-3 h-3 mr-1" />
              Pilot
            </Button>
          </div>
        </CardHeader>

        {/* Content with improved scrollbar */}
        <CardContent className="p-6 overflow-y-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent hover:scrollbar-thumb-slate-500">
          {activeSection === 'overview' && renderOverviewSection()}
          {activeSection === 'route' && renderRouteSection()}
          {activeSection === 'performance' && renderPerformanceSection()}
          {activeSection === 'pilot' && renderPilotSection()}
        </CardContent>
      </Card>
    </div>
  );
};

export default FlightDetails;
