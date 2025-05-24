
import React, { useState, useEffect } from 'react';
import { Flight } from '@/services/flight';
import { X, Calendar, MapPin, Plane, User, BarChart3 } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

interface FlightDetailsProps {
  flight: Flight;
  serverID: string;
  onClose: () => void;
}

const FlightDetails: React.FC<FlightDetailsProps> = ({ flight, serverID, onClose }) => {
  const [showMore, setShowMore] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'flightplan' | 'graphs' | 'stats'>('details');
  
  // Format last report time
  const formatTime = (timestamp: number): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Unknown';
    }
  };

  // Simulate flight plan data (in real implementation, this would come from API)
  const mockFlightPlan = {
    departure: 'KLAX',
    arrival: 'EDDF',
    takeoffTime: '6:31',
    eta: '17:42',
    route: ['KMIA', 'FOLZZ3', 'JAMBA', 'KBOLA', 'MARCK', 'FOLZZ', 'GOZZR', 'TOC', 'SUMRS', 'FLUPS', 'ALOBI', 'BEXUM', 'LUNKR']
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
  }, [flight]);

  const renderFlightPlan = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Departure</h4>
          <div className="space-y-1">
            <div className="text-lg font-bold">{mockFlightPlan.departure}</div>
            <div className="text-sm text-gray-400">Takeoff</div>
            <div className="text-sm font-medium">{mockFlightPlan.takeoffTime}</div>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Arrival</h4>
          <div className="space-y-1">
            <div className="text-lg font-bold">{mockFlightPlan.arrival}</div>
            <div className="text-sm text-gray-400">ETA</div>
            <div className="text-sm font-medium">{mockFlightPlan.eta}</div>
          </div>
        </div>
      </div>
      
      <Separator className="bg-gray-600" />
      
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3">Route</h4>
        <div className="space-y-2">
          {mockFlightPlan.route.map((waypoint, index) => (
            <div key={index} className="flex items-center justify-between py-1">
              <span className="font-medium">{waypoint}</span>
              <div className="flex items-center space-x-2">
                {index < 3 && (
                  <span className="px-2 py-1 bg-orange-600 text-xs rounded text-white">
                    {index === 1 ? 'SID' : index === 0 ? 'WP' : '@5.000ft'}
                  </span>
                )}
                {index >= 3 && index < mockFlightPlan.route.length - 3 && (
                  <span className="px-2 py-1 bg-teal-600 text-xs rounded text-white">
                    @{21900 + (index * 2000)}ft
                  </span>
                )}
                {index >= mockFlightPlan.route.length - 3 && (
                  <span className="px-2 py-1 bg-gray-600 text-xs rounded text-white">
                    WP
                  </span>
                )}
                <div className="w-4 h-4 text-teal-400">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 14l5-5 5 5z"/>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGraphs = () => (
    <div className="space-y-4">
      <div className="text-center text-gray-400">
        <BarChart3 size={48} className="mx-auto mb-2" />
        <p>Flight Graphs</p>
        <p className="text-sm">Altitude, Speed, VS</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="bg-teal-600 text-white px-3 py-2 rounded text-sm font-medium">
            270kts GS
          </div>
          <div className="bg-orange-500 text-white px-3 py-2 rounded text-sm font-medium">
            3.310 fpm
          </div>
          <div className="bg-red-500 text-white px-3 py-2 rounded text-sm font-medium">
            2.582ft MSL
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
    <div className="absolute top-16 right-0 p-4 z-10 w-80 max-h-[80vh] overflow-y-auto">
      <div className="bg-[#151920] border border-gray-700 rounded-md shadow-xl text-white">
        <div className="flex justify-between items-center border-b border-gray-700 p-3">
          <div className="flex flex-col">
            <div className="flex space-x-2 items-baseline">
              <span className="font-bold text-lg">{flight.callsign}</span>
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
        
        <div className="p-3 border-b border-gray-700">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-400">Aircraft</span>
            <span className="font-medium">{flight.aircraft}</span>
          </div>
          <div className="flex justify-between mb-1">
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
        
        <div className="p-3 border-b border-gray-700">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-sm text-gray-400">Altitude</div>
              <div className="font-medium">{Math.round(flight.altitude)} ft</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Speed</div>
              <div className="font-medium">{Math.round(flight.speed)} kts</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Heading</div>
              <div className="font-medium">{Math.round(flight.heading)}°</div>
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
        <div className="p-3">
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
