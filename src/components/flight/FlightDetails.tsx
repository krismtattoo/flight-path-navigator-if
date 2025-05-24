import React, { useState, useEffect } from 'react';
import { Flight } from '@/services/flight';
import { X, Calendar, MapPin, Plane, User, BarChart3 } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { getFlightRoute } from '@/services/flight/routeService';
import { toast } from "sonner";

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
  const [showMore, setShowMore] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'flightplan' | 'graphs' | 'stats'>('details');
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

  // Load flight plan data when switching to flightplan tab
  useEffect(() => {
    if (activeTab === 'flightplan' && !flightPlanData && !loadingFlightPlan) {
      loadFlightPlanData();
    }
  }, [activeTab, flight, serverID]);

  const loadFlightPlanData = async () => {
    setLoadingFlightPlan(true);
    try {
      console.log(`Loading flight plan for flight ${flight.flightId} on server ${serverID}`);
      const routeData = await getFlightRoute(serverID, flight.flightId);
      
      console.log('Flight plan route data received:', routeData);
      
      if (routeData.flightPlan && routeData.flightPlan.length > 0) {
        const flightPlanPoints = routeData.flightPlan;
        
        // Enhanced waypoint classification with better logic
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

        // Determine departure and destination from waypoints
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

        // Calculate cruising altitude (highest altitude in flight plan)
        const cruisingAltitude = Math.max(...waypoints.map(wp => wp.altitude || 0));

        setFlightPlanData({
          waypoints,
          departure,
          destination,
          cruisingAltitude: cruisingAltitude > 0 ? cruisingAltitude : undefined,
          flightPlanId: flight.flightId,
          flightPlanType: 'IFR', // Default assumption for structured flight plans
          lastUpdate: new Date().toISOString()
        });
        
        console.log(`Successfully loaded flight plan with ${waypoints.length} waypoints`);
        toast.success(`Flight plan loaded with ${waypoints.length} waypoints`);
      } else {
        console.log('No flight plan data available for this flight');
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

  // Improved waypoint type determination with better logic and geographical context
  const determineWaypointType = (name: string, index: number, totalCount: number, lat: number, lng: number): string => {
    const upperName = name.toUpperCase();
    
    // First and last waypoints
    if (index === 0) return 'departure';
    if (index === totalCount - 1) return 'destination';
    
    // Airport identifiers (4-letter ICAO codes) - high priority
    if (/^[A-Z]{4}$/.test(upperName)) {
      return 'airport';
    }
    
    // SID patterns (Standard Instrument Departure) - improved detection
    if (upperName.includes('SID') || 
        upperName.includes('DEP') ||
        upperName.includes('DEPARTURE') ||
        upperName.startsWith('RW') ||
        upperName.includes('RUNWAY') ||
        /^[A-Z]{2,5}\d[A-Z]?$/.test(upperName) || // Patterns like "KORD1", "LOOP2A"
        (index <= 3 && /\d[A-Z]?$/.test(upperName))) { // Early waypoints with number-letter endings
      return 'sid';
    }
    
    // STAR patterns (Standard Terminal Arrival Route) - improved detection
    if (upperName.includes('STAR') || 
        upperName.includes('ARR') ||
        upperName.includes('ARRIVAL') ||
        (index >= totalCount - 4 && /\d[A-Z]?$/.test(upperName))) { // Late waypoints with number-letter endings
      return 'star';
    }
    
    // Approach patterns - enhanced detection
    if (upperName.includes('APPR') || 
        upperName.includes('APP') ||
        upperName.includes('ILS') ||
        upperName.includes('RNAV') ||
        upperName.includes('VOR') ||
        upperName.includes('NDB') ||
        upperName.includes('GPS') ||
        upperName.includes('LOC') ||
        upperName.includes('FINAL') ||
        upperName.startsWith('I-') ||
        /^[A-Z]{2,4}\d{2}[LRC]?$/.test(upperName) || // Pattern like "ILS28L"
        (index >= totalCount - 3)) { // Very late waypoints likely approach
      return 'approach';
    }
    
    // Navigation fixes (typically 5-letter identifiers)
    if (/^[A-Z]{5}$/.test(upperName)) {
      return 'fix';
    }
    
    // VOR/DME stations (typically 3-letter identifiers)
    if (/^[A-Z]{3}$/.test(upperName)) {
      return 'navaid';
    }
    
    // En-route waypoints based on position in flight plan
    if (index > 5 && index < totalCount - 5) {
      return 'enroute';
    }
    
    // Default waypoint
    return 'waypoint';
  };

  // Enhanced color and label system for waypoint types
  const getWaypointTypeStyle = (type: string) => {
    switch (type) {
      case 'departure':
        return { bg: 'bg-green-600', text: 'DEP', color: 'text-white', icon: '🛫' };
      case 'destination':
        return { bg: 'bg-red-600', text: 'ARR', color: 'text-white', icon: '🛬' };
      case 'sid':
        return { bg: 'bg-blue-600', text: 'SID', color: 'text-white', icon: '↗️' };
      case 'star':
        return { bg: 'bg-orange-600', text: 'STAR', color: 'text-white', icon: '↘️' };
      case 'approach':
        return { bg: 'bg-purple-600', text: 'APP', color: 'text-white', icon: '🎯' };
      case 'airport':
        return { bg: 'bg-yellow-600', text: 'APT', color: 'text-black', icon: '🏢' };
      case 'fix':
        return { bg: 'bg-teal-600', text: 'FIX', color: 'text-white', icon: '📍' };
      case 'navaid':
        return { bg: 'bg-indigo-600', text: 'NAV', color: 'text-white', icon: '📡' };
      case 'enroute':
        return { bg: 'bg-cyan-600', text: 'ENR', color: 'text-white', icon: '✈️' };
      default:
        return { bg: 'bg-gray-600', text: 'WPT', color: 'text-white', icon: '📌' };
    }
  };

  // Simulate user stats (in real implementation, this would come from API)
  const mockUserStats = {
    groups: ['IFATC', 'Editor', 'Mod', 'Staff'],
    violations: { level1: 14, level2: 0, level3: 0 },
    live: { flights: 255, flightTime: '314h 32m', experience: 257390, landings: 192 },
    atc: { operations: 932, rank: 'Observer', currentGrade: 'Grade 3' }
  };

  useEffect(() => {
    // Reset state when flight changes
    setShowMore(false);
    setActiveTab('details');
    setFlightPlanData(null);
  }, [flight]);

  const renderFlightPlan = () => {
    if (loadingFlightPlan) {
      return (
        <div className="text-center text-gray-400 py-8">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full mb-2"></div>
          <p>Loading flight plan...</p>
        </div>
      );
    }

    if (!flightPlanData || flightPlanData.waypoints.length === 0) {
      return (
        <div className="text-center text-gray-400 py-8">
          <MapPin size={48} className="mx-auto mb-2" />
          <p>No flight plan available</p>
          <p className="text-sm">This aircraft has not filed a flight plan</p>
        </div>
      );
    }

    // Group waypoints by type for better organization
    const waypointsByType = flightPlanData.waypoints.reduce((acc, waypoint) => {
      const type = waypoint.type || 'waypoint';
      if (!acc[type]) acc[type] = [];
      acc[type].push(waypoint);
      return acc;
    }, {} as Record<string, typeof flightPlanData.waypoints>);

    // Order of sections for logical flow
    const typeOrder = ['departure', 'sid', 'enroute', 'fix', 'navaid', 'star', 'approach', 'destination', 'airport', 'waypoint'];

    return (
      <div className="space-y-4">
        {/* Flight Plan Header Info */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4 mb-3">
            {flightPlanData.departure && (
              <div>
                <h4 className="text-sm font-medium text-green-400 mb-1">Departure</h4>
                <div className="text-lg font-bold">{flightPlanData.departure.icao}</div>
                <div className="text-xs text-gray-400">{flightPlanData.departure.name}</div>
                <div className="text-xs text-gray-500">
                  {flightPlanData.departure.latitude.toFixed(4)}, {flightPlanData.departure.longitude.toFixed(4)}
                </div>
              </div>
            )}
            {flightPlanData.destination && (
              <div>
                <h4 className="text-sm font-medium text-red-400 mb-1">Destination</h4>
                <div className="text-lg font-bold">{flightPlanData.destination.icao}</div>
                <div className="text-xs text-gray-400">{flightPlanData.destination.name}</div>
                <div className="text-xs text-gray-500">
                  {flightPlanData.destination.latitude.toFixed(4)}, {flightPlanData.destination.longitude.toFixed(4)}
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-600">
            {flightPlanData.flightPlanType && (
              <div className="text-center">
                <span className="text-xs text-gray-400">Flight Rules: </span>
                <span className="text-sm font-medium text-blue-400">{flightPlanData.flightPlanType}</span>
              </div>
            )}
            {flightPlanData.cruisingAltitude && (
              <div className="text-center">
                <span className="text-xs text-gray-400">Cruising Alt: </span>
                <span className="text-sm font-medium text-blue-400">{Math.round(flightPlanData.cruisingAltitude)} ft</span>
              </div>
            )}
          </div>
        </div>
        
        <Separator className="bg-gray-600" />
        
        {/* Organized Flight Plan Route by Type */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
            <Plane size={16} className="mr-2" />
            Flight Plan Route ({flightPlanData.waypoints.length} waypoints)
          </h4>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {typeOrder.map(type => {
              const waypointsOfType = waypointsByType[type];
              if (!waypointsOfType || waypointsOfType.length === 0) return null;
              
              const typeStyle = getWaypointTypeStyle(type);
              
              return (
                <div key={type} className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    <span className="text-lg mr-2">{typeStyle.icon}</span>
                    <span className={`px-2 py-1 text-xs rounded font-medium ${typeStyle.bg} ${typeStyle.color} mr-2`}>
                      {typeStyle.text}
                    </span>
                    <span className="text-sm font-medium text-gray-300 capitalize">
                      {type === 'sid' ? 'Standard Instrument Departure' :
                       type === 'star' ? 'Standard Terminal Arrival' :
                       type === 'navaid' ? 'Navigation Aid' :
                       type === 'enroute' ? 'En-Route Waypoints' :
                       type} ({waypointsOfType.length})
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    {waypointsOfType.map((waypoint, index) => (
                      <div key={index} className="flex items-center justify-between py-1 px-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${typeStyle.bg.replace('bg-', 'bg-')}`}></div>
                          <div>
                            <span className="font-medium text-white text-sm">{waypoint.name}</span>
                            {waypoint.identifier && waypoint.identifier !== waypoint.name && (
                              <span className="text-xs text-gray-400 ml-1">({waypoint.identifier})</span>
                            )}
                            <div className="text-xs text-gray-400">
                              {waypoint.latitude.toFixed(4)}, {waypoint.longitude.toFixed(4)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {waypoint.altitude && waypoint.altitude > 0 && (
                            <span className="px-2 py-1 bg-teal-600 text-xs rounded text-white font-medium">
                              {Math.round(waypoint.altitude)}ft
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Flight Plan Metadata */}
        {(flightPlanData.flightPlanId || flightPlanData.lastUpdate) && (
          <div className="text-center pt-2 border-t border-gray-600">
            {flightPlanData.flightPlanId && (
              <div className="text-xs text-gray-500 mb-1">Flight Plan ID: {flightPlanData.flightPlanId}</div>
            )}
            {flightPlanData.lastUpdate && (
              <div className="text-xs text-gray-500">Last Update: {new Date(flightPlanData.lastUpdate).toLocaleString()}</div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderGraphs = () => (
    <div className="space-y-4">
      <div className="text-center text-gray-400">
        <BarChart3 size={48} className="mx-auto mb-2" />
        <p>Flight Graphs</p>
        <p className="text-sm">Altitude, Speed, VS</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="bg-teal-600 text-white px-3 py-2 rounded text-sm font-medium">
            {Math.round(flight.speed)}kts GS
          </div>
          <div className="bg-orange-500 text-white px-3 py-2 rounded text-sm font-medium">
            N/A fpm
          </div>
          <div className="bg-red-500 text-white px-3 py-2 rounded text-sm font-medium">
            {Math.round(flight.altitude)}ft MSL
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserStats = () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-lg font-bold mb-2">{flight.username}'s stats</h4>
        
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-300 mb-2">Groups</h5>
          <div className="flex flex-wrap gap-2">
            {mockUserStats.groups.map((group, index) => (
              <span key={index} className={`px-2 py-1 text-xs rounded font-medium ${
                group === 'IFATC' ? 'bg-green-600 text-white' :
                group === 'Editor' ? 'bg-orange-500 text-white' :
                group === 'Mod' ? 'bg-purple-600 text-white' :
                'bg-blue-500 text-white'
              }`}>
                {group} ✕
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h5 className="text-sm font-medium text-gray-300 mb-2">Violations</h5>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Level 1</span>
                <span className="font-bold">{mockUserStats.violations.level1}</span>
              </div>
              <div className="flex justify-between">
                <span>Level 2</span>
                <span className="font-bold">{mockUserStats.violations.level2}</span>
              </div>
              <div className="flex justify-between">
                <span>Level 3</span>
                <span className="font-bold">{mockUserStats.violations.level3}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-gray-300 mb-2">Live</h5>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Flights</span>
                <span className="font-bold">{mockUserStats.live.flights}</span>
              </div>
              <div className="flex justify-between">
                <span>Flight Time</span>
                <span className="font-bold">{mockUserStats.live.flightTime}</span>
              </div>
              <div className="flex justify-between">
                <span>Experience</span>
                <span className="font-bold">{mockUserStats.live.experience.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Landings</span>
                <span className="font-bold">{mockUserStats.live.landings}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h5 className="text-sm font-medium text-gray-300 mb-2">ATC</h5>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span>Operations</span>
              <span className="font-bold">{mockUserStats.atc.operations}</span>
            </div>
            <div className="flex justify-between">
              <span>Rank</span>
              <span className="font-bold">{mockUserStats.atc.rank}</span>
            </div>
            <div className="flex justify-between col-span-2">
              <span>Grade</span>
              <span className="font-bold">{mockUserStats.atc.currentGrade}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="absolute top-16 right-0 p-4 z-10 w-96 max-h-[85vh] overflow-y-auto">
      <div className="bg-[#151920] border border-gray-700 rounded-md shadow-xl text-white">
        <div className="flex justify-between items-center border-b border-gray-700 p-4">
          <div className="flex flex-col">
            <div className="flex space-x-2 items-baseline">
              <span className="font-bold text-xl">{flight.callsign}</span>
              <span className="text-sm text-gray-400">{flight.username}</span>
            </div>
            <div className="text-xs text-gray-300">{serverID}</div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-400 hover:text-white" 
            onClick={onClose}
          >
            <X size={18} />
          </Button>
        </div>
        
        <div className="p-4 border-b border-gray-700">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-400">Aircraft</span>
            <span className="font-medium">{flight.aircraft}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-400">Livery</span>
            <span className="font-medium">{flight.livery}</span>
          </div>
          {flight.virtualOrganization && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">VA/Group</span>
              <span className="font-medium">{flight.virtualOrganization}</span>
            </div>
          )}
        </div>
        
        <div className="p-4 border-b border-gray-700">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-gray-400">Altitude</div>
              <div className="font-medium text-lg">{Math.round(flight.altitude)} ft</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Speed</div>
              <div className="font-medium text-lg">{Math.round(flight.speed)} kts</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Heading</div>
              <div className="font-medium text-lg">{Math.round(flight.heading)}°</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Last Update</div>
              <div className="font-medium">{formatTime(flight.lastReportTime)}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-700">
          <div className="flex">
            <Button
              variant={activeTab === 'details' ? 'default' : 'ghost'}
              size="sm"
              className={`flex-1 rounded-none text-xs ${
                activeTab === 'details' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </Button>
            <Button
              variant={activeTab === 'flightplan' ? 'default' : 'ghost'}
              size="sm"
              className={`flex-1 rounded-none text-xs ${
                activeTab === 'flightplan' 
                  ? 'bg-teal-600 hover:bg-teal-700' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              onClick={() => setActiveTab('flightplan')}
            >
              <MapPin size={14} className="mr-1" />
              Flight Plan
            </Button>
          </div>
          <div className="flex">
            <Button
              variant={activeTab === 'graphs' ? 'default' : 'ghost'}
              size="sm"
              className={`flex-1 rounded-none text-xs ${
                activeTab === 'graphs' 
                  ? 'bg-orange-600 hover:bg-orange-700' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              onClick={() => setActiveTab('graphs')}
            >
              <BarChart3 size={14} className="mr-1" />
              Graphs
            </Button>
            <Button
              variant={activeTab === 'stats' ? 'default' : 'ghost'}
              size="sm"
              className={`flex-1 rounded-none text-xs ${
                activeTab === 'stats' 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              onClick={() => setActiveTab('stats')}
            >
              <User size={14} className="mr-1" />
              User Stats
            </Button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'details' && (
            <div>
              <Button 
                variant="outline" 
                className="w-full text-sm border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-300 mb-3"
                onClick={() => setShowMore(!showMore)}
              >
                {showMore ? 'Show Less' : 'Show More'}
              </Button>
              
              {showMore && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Flight ID</span>
                    <span className="text-xs text-gray-300 font-mono">{flight.flightId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">User ID</span>
                    <span className="text-xs text-gray-300 font-mono">{flight.userId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Position</span>
                    <span className="text-xs text-gray-300 font-mono">
                      {flight.latitude.toFixed(4)}, {flight.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'flightplan' && renderFlightPlan()}
          {activeTab === 'graphs' && renderGraphs()}
          {activeTab === 'stats' && renderUserStats()}
        </div>
      </div>
    </div>
  );
};

export default FlightDetails;
