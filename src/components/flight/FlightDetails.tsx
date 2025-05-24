import React, { useState, useEffect } from 'react';
import { Flight } from '@/services/flight';
import { X, Plane, MapPin, Clock, Gauge, Navigation, User, BarChart3, Route, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { getFlightRoute } from '@/services/flight/routeService';
import { toast } from "sonner";
import PerformanceChart from './PerformanceChart';

interface FlightDetailsProps {
  flight: Flight;
  serverID: string;
  onClose: () => void;
}

interface FlightPlanData {
  waypoints: Array<{
    name: string;
    latitude: number;
    longitude: number;
    altitude?: number;
    type?: string;
    identifier?: string;
  }>;
  departure?: {
    name: string;
    icao: string;
    latitude: number;
    longitude: number;
  };
  destination?: {
    name: string;
    icao: string;
    latitude: number;
    longitude: number;
  };
  cruisingAltitude?: number;
  flightPlanId?: string;
  flightPlanType?: string;
  lastUpdate?: string;
}

const FlightDetails: React.FC<FlightDetailsProps> = ({ flight, serverID, onClose }) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'route' | 'performance' | 'pilot'>('overview');
  const [flightPlanData, setFlightPlanData] = useState<FlightPlanData | null>(null);
  const [loadingFlightPlan, setLoadingFlightPlan] = useState(false);
  
  // Format last report time
  const formatTime = (timestamp: number): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Unknown';
    }
  };

  // Generate mock performance data for demonstration
  const generatePerformanceData = () => {
    const now = new Date();
    const data = [];
    
    for (let i = 9; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60000); // 1 minute intervals
      const baseAltitude = flight.altitude;
      const baseSpeed = flight.speed;
      
      // Add some realistic variation
      const altitudeVariation = (Math.random() - 0.5) * 200;
      const speedVariation = (Math.random() - 0.5) * 20;
      const verticalSpeed = (Math.random() - 0.5) * 1000; // -500 to +500 fpm
      
      data.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        altitude: Math.max(0, baseAltitude + altitudeVariation),
        speed: Math.max(0, baseSpeed + speedVariation),
        verticalSpeed: verticalSpeed,
        heading: flight.heading + (Math.random() - 0.5) * 10
      });
    }
    
    return data;
  };

  // Load flight plan data when switching to route section
  useEffect(() => {
    if (activeSection === 'route' && !flightPlanData && !loadingFlightPlan) {
      loadFlightPlanData();
    }
  }, [activeSection, flight, serverID]);

  const loadFlightPlanData = async () => {
    setLoadingFlightPlan(true);
    try {
      const routeData = await getFlightRoute(serverID, flight.flightId);
      
      if (routeData.flightPlan && routeData.flightPlan.length > 0) {
        const flightPlanPoints = routeData.flightPlan;
        
        const waypoints = flightPlanPoints.map((point, index) => {
          const waypointName = (point as any).waypointName || `WP${index + 1}`;
          return {
            name: waypointName,
            latitude: point.latitude,
            longitude: point.longitude,
            altitude: point.altitude || 0,
            identifier: waypointName.length === 4 || waypointName.length === 5 ? waypointName : undefined,
            type: determineWaypointType(waypointName, index, flightPlanPoints.length, point.latitude, point.longitude)
          };
        });

        let departure, destination;
        
        if (waypoints.length > 0) {
          const firstWaypoint = waypoints[0];
          departure = {
            name: firstWaypoint.identifier || firstWaypoint.name,
            icao: firstWaypoint.identifier || 'N/A',
            latitude: firstWaypoint.latitude,
            longitude: firstWaypoint.longitude
          };
        }
        
        if (waypoints.length > 1) {
          const lastWaypoint = waypoints[waypoints.length - 1];
          destination = {
            name: lastWaypoint.identifier || lastWaypoint.name,
            icao: lastWaypoint.identifier || 'N/A',
            latitude: lastWaypoint.latitude,
            longitude: lastWaypoint.longitude
          };
        }

        const cruisingAltitude = Math.max(...waypoints.map(wp => wp.altitude || 0));

        setFlightPlanData({
          waypoints,
          departure,
          destination,
          cruisingAltitude: cruisingAltitude > 0 ? cruisingAltitude : undefined,
          flightPlanId: flight.flightId,
          flightPlanType: 'IFR',
          lastUpdate: new Date().toISOString()
        });
        
        toast.success(`Flight plan loaded with ${waypoints.length} waypoints`);
      } else {
        setFlightPlanData({
          waypoints: [],
          departure: undefined,
          destination: undefined
        });
        toast.info('No flight plan filed for this aircraft');
      }
    } catch (error) {
      console.error('Failed to load flight plan:', error);
      setFlightPlanData({
        waypoints: [],
        departure: undefined,
        destination: undefined
      });
      toast.error('Failed to load flight plan data');
    } finally {
      setLoadingFlightPlan(false);
    }
  };

  const determineWaypointType = (name: string, index: number, totalCount: number, lat: number, lng: number): string => {
    const upperName = name.toUpperCase();
    
    if (index === 0) return 'departure';
    if (index === totalCount - 1) return 'destination';
    
    if (/^[A-Z]{4}$/.test(upperName)) {
      return 'airport';
    }
    
    if (upperName.includes('SID') || upperName.includes('DEP') || upperName.includes('DEPARTURE')) {
      return 'sid';
    }
    
    if (upperName.includes('STAR') || upperName.includes('ARR') || upperName.includes('ARRIVAL')) {
      return 'star';
    }
    
    if (upperName.includes('APPR') || upperName.includes('APP') || upperName.includes('ILS') || upperName.includes('RNAV')) {
      return 'approach';
    }
    
    if (/^[A-Z]{5}$/.test(upperName)) {
      return 'fix';
    }
    
    if (/^[A-Z]{3}$/.test(upperName)) {
      return 'navaid';
    }
    
    if (index > 5 && index < totalCount - 5) {
      return 'enroute';
    }
    
    return 'waypoint';
  };

  const getWaypointTypeStyle = (type: string) => {
    switch (type) {
      case 'departure':
        return { bg: 'bg-emerald-500', text: 'DEP', icon: '🛫' };
      case 'destination':
        return { bg: 'bg-red-500', text: 'ARR', icon: '🛬' };
      case 'sid':
        return { bg: 'bg-blue-500', text: 'SID', icon: '↗️' };
      case 'star':
        return { bg: 'bg-orange-500', text: 'STAR', icon: '↘️' };
      case 'approach':
        return { bg: 'bg-purple-500', text: 'APP', icon: '🎯' };
      case 'airport':
        return { bg: 'bg-yellow-500', text: 'APT', icon: '🏢' };
      case 'fix':
        return { bg: 'bg-teal-500', text: 'FIX', icon: '📍' };
      case 'navaid':
        return { bg: 'bg-indigo-500', text: 'NAV', icon: '📡' };
      case 'enroute':
        return { bg: 'bg-cyan-500', text: 'ENR', icon: '✈️' };
      default:
        return { bg: 'bg-gray-500', text: 'WPT', icon: '📌' };
    }
  };

  const mockUserStats = {
    groups: ['IFATC', 'Editor', 'Mod', 'Staff'],
    violations: { level1: 14, level2: 0, level3: 0 },
    live: { flights: 255, flightTime: '314h 32m', experience: 257390, landings: 192 },
    atc: { operations: 932, rank: 'Observer', currentGrade: 'Grade 3' }
  };

  const isOnGround = flight.altitude < 100 && flight.speed < 50;

  const renderOverviewSection = () => (
    <div className="space-y-6">
      {/* Aircraft Status Card */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Plane className="w-5 h-5" />
              Aircraft Status
            </CardTitle>
            <Badge variant={isOnGround ? "secondary" : "default"} className={isOnGround ? "bg-yellow-600" : "bg-green-600"}>
              {isOnGround ? "On Ground" : "Airborne"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-400">Aircraft Type</p>
              <p className="text-lg font-semibold text-white">{flight.aircraft}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-400">Registration</p>
              <p className="text-lg font-semibold text-white">{flight.callsign}</p>
            </div>
          </div>
          <Separator className="bg-slate-600" />
          <div className="space-y-1">
            <p className="text-sm text-gray-400">Livery</p>
            <p className="text-white">{flight.livery}</p>
          </div>
          {flight.virtualOrganization && (
            <div className="space-y-1">
              <p className="text-sm text-gray-400">Virtual Organization</p>
              <Badge variant="outline" className="text-blue-400 border-blue-400">
                {flight.virtualOrganization}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Flight Data Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Gauge className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">{Math.round(flight.altitude)}</p>
            <p className="text-sm text-gray-400">Altitude (ft)</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">{Math.round(flight.speed)}</p>
            <p className="text-sm text-gray-400">Speed (kts)</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Navigation className="w-6 h-6 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-white">{Math.round(flight.heading)}°</p>
            <p className="text-sm text-gray-400">Heading</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">{formatTime(flight.lastReportTime)}</p>
            <p className="text-sm text-gray-400">Last Update</p>
          </CardContent>
        </Card>
      </div>

      {/* Location Info */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Current Position
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Latitude</p>
              <p className="text-white font-mono">{flight.latitude.toFixed(6)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Longitude</p>
              <p className="text-white font-mono">{flight.longitude.toFixed(6)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRouteSection = () => {
    if (loadingFlightPlan) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full mb-4"></div>
            <p className="text-gray-400">Loading flight plan...</p>
          </div>
        </div>
      );
    }

    if (!flightPlanData || flightPlanData.waypoints.length === 0) {
      return (
        <div className="text-center py-12">
          <Route className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Flight Plan</h3>
          <p className="text-gray-400">This aircraft has not filed a flight plan</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Route Overview */}
        {(flightPlanData.departure || flightPlanData.destination) && (
          <Card className="bg-gradient-to-r from-blue-900 to-purple-900 border-blue-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                {flightPlanData.departure && (
                  <div className="text-center">
                    <div className="text-sm text-blue-200 mb-1">Departure</div>
                    <div className="text-2xl font-bold text-white">{flightPlanData.departure.icao}</div>
                    <div className="text-xs text-blue-300">{flightPlanData.departure.name}</div>
                  </div>
                )}
                
                <div className="flex-1 flex items-center justify-center px-4">
                  <div className="flex items-center">
                    <div className="w-8 h-0.5 bg-blue-400"></div>
                    <Plane className="w-6 h-6 text-blue-400 mx-2" />
                    <div className="w-8 h-0.5 bg-blue-400"></div>
                  </div>
                </div>

                {flightPlanData.destination && (
                  <div className="text-center">
                    <div className="text-sm text-blue-200 mb-1">Destination</div>
                    <div className="text-2xl font-bold text-white">{flightPlanData.destination.icao}</div>
                    <div className="text-xs text-blue-300">{flightPlanData.destination.name}</div>
                  </div>
                )}
              </div>
              
              {flightPlanData.cruisingAltitude && (
                <div className="text-center mt-4 pt-4 border-t border-blue-700">
                  <span className="text-sm text-blue-200">Cruising Altitude: </span>
                  <span className="text-white font-semibold">{Math.round(flightPlanData.cruisingAltitude)} ft</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Waypoints List */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Route className="w-5 h-5" />
              Flight Plan Route ({flightPlanData.waypoints.length} waypoints)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {flightPlanData.waypoints.map((waypoint, index) => {
                const typeStyle = getWaypointTypeStyle(waypoint.type || 'waypoint');
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{typeStyle.icon}</span>
                        <Badge className={`${typeStyle.bg} text-white text-xs`}>
                          {typeStyle.text}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-white font-semibold">{waypoint.name}</p>
                        <p className="text-xs text-gray-400">
                          {waypoint.latitude.toFixed(4)}, {waypoint.longitude.toFixed(4)}
                        </p>
                      </div>
                    </div>
                    {waypoint.altitude && waypoint.altitude > 0 && (
                      <Badge variant="outline" className="text-blue-400 border-blue-400">
                        {Math.round(waypoint.altitude)}ft
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPerformanceSection = () => {
    const performanceData = generatePerformanceData();
    
    return (
      <div className="space-y-6">
        <PerformanceChart 
          data={performanceData}
          currentAltitude={flight.altitude}
          currentSpeed={flight.speed}
        />
        
        {/* Additional Performance Metrics */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Zusätzliche Metriken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                  <span className="text-gray-300">Kurs</span>
                  <span className="text-white font-semibold">{Math.round(flight.heading)}°</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                  <span className="text-gray-300">Letztes Update</span>
                  <span className="text-white font-semibold">{formatTime(flight.lastReportTime)}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                  <span className="text-gray-300">Flugstatus</span>
                  <Badge variant={isOnGround ? "secondary" : "default"} className={isOnGround ? "bg-yellow-600" : "bg-green-600"}>
                    {isOnGround ? "Am Boden" : "In der Luft"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                  <span className="text-gray-300">Flugzeugtyp</span>
                  <span className="text-white font-semibold">{flight.aircraft}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPilotSection = () => (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            Pilot Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-lg font-semibold text-white">{flight.username}</p>
            <p className="text-sm text-gray-400">Flight ID: {flight.flightId}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400 mb-2">Groups</p>
            <div className="flex flex-wrap gap-2">
              {mockUserStats.groups.map((group, index) => (
                <Badge key={index} variant="outline" className={
                  group === 'IFATC' ? 'text-green-400 border-green-400' :
                  group === 'Editor' ? 'text-orange-400 border-orange-400' :
                  group === 'Mod' ? 'text-purple-400 border-purple-400' :
                  'text-blue-400 border-blue-400'
                }>
                  {group}
                </Badge>
              ))}
            </div>
          </div>

          <Separator className="bg-slate-600" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-2">Live Stats</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Flights</span>
                  <span className="text-white font-semibold">{mockUserStats.live.flights}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Flight Time</span>
                  <span className="text-white font-semibold">{mockUserStats.live.flightTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Landings</span>
                  <span className="text-white font-semibold">{mockUserStats.live.landings}</span>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-400 mb-2">Violations</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Level 1</span>
                  <span className="text-white font-semibold">{mockUserStats.violations.level1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Level 2</span>
                  <span className="text-white font-semibold">{mockUserStats.violations.level2}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Level 3</span>
                  <span className="text-white font-semibold">{mockUserStats.violations.level3}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  useEffect(() => {
    setActiveSection('overview');
    setFlightPlanData(null);
  }, [flight]);

  return (
    <div className="fixed top-4 right-4 w-96 max-h-[calc(100vh-2rem)] z-50">
      <Card className="bg-slate-900 border-slate-700 shadow-2xl">
        {/* Header */}
        <CardHeader className="border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h2 className="text-xl font-bold text-white">{flight.callsign}</h2>
              </div>
              <p className="text-sm text-gray-400">{flight.username} • {serverID}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-slate-700" 
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        {/* Navigation */}
        <div className="border-b border-slate-700 bg-slate-800">
          <div className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: Plane },
              { id: 'route', label: 'Route', icon: Route },
              { id: 'performance', label: 'Performance', icon: BarChart3 },
              { id: 'pilot', label: 'Pilot', icon: User }
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant="ghost"
                size="sm"
                className={`flex-1 rounded-none h-12 flex items-center gap-2 ${
                  activeSection === id 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'text-gray-400 hover:text-white hover:bg-slate-700'
                }`}
                onClick={() => setActiveSection(id as any)}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-6 overflow-y-auto max-h-[70vh]">
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
