
import React from 'react';
import { AirportStatus } from '@/services/flight/worldService';
import { AirportInfo } from '@/services/flight/airportInfoService';
import { Flight } from '@/services/flight';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Plane, Users, Radio, MapPin, Globe, Clock, Building } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AirportFlightList from './AirportFlightList';
import { useAirportFlights } from '@/hooks/useAirportFlights';

interface EnhancedAirportDetailsProps {
  airport?: AirportStatus;
  airportInfo?: AirportInfo;
  flights?: Flight[];
  loading?: boolean;
  onClose: () => void;
  onFlightSelect?: (flight: Flight) => void;
}

const EnhancedAirportDetails: React.FC<EnhancedAirportDetailsProps> = ({ 
  airport, 
  airportInfo,
  flights = [],
  loading,
  onClose,
  onFlightSelect
}) => {
  // Get inbound and outbound flights for this airport
  const { inboundFlights, outboundFlights } = useAirportFlights({ 
    airport: airport || null, 
    flights 
  });

  const getATCTypeLabel = (type: number): string => {
    const types = {
      0: 'Ground',
      1: 'Tower', 
      2: 'Unicom',
      3: 'Clearance',
      4: 'Approach',
      5: 'Departure',
      6: 'Center',
      7: 'ATIS',
      8: 'Aircraft',
      9: 'Recorded',
      10: 'Unknown',
      11: 'Unused'
    };
    return types[type as keyof typeof types] || 'Unknown';
  };

  const formatTime = (timeString: string): string => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'UTC'
      }) + ' UTC';
    } catch {
      return timeString;
    }
  };

  const getAirportClass = (classNumber: number): string => {
    const classes = {
      1: 'Small Airfields',
      2: 'Regional Airports',
      3: 'Major Airports',
      4: 'International Airports'
    };
    return classes[classNumber as keyof typeof classes] || 'Unknown';
  };

  const handleFlightSelect = (flight: Flight) => {
    if (onFlightSelect) {
      onFlightSelect(flight);
      // Close airport details when selecting a flight
      onClose();
    }
  };

  const displayName = airportInfo?.name || airport?.airportName || 'Airport';
  const displayIcao = airportInfo?.icao || airport?.airportIcao || '';

  return (
    <div className="absolute top-4 left-4 z-20 w-96 h-[80vh]">
      <Card className="bg-slate-900/95 backdrop-blur-sm shadow-2xl border border-slate-700 text-white h-full flex flex-col">
        <CardHeader className="pb-4 border-b border-slate-700 flex-shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-bold text-white">
                {displayIcao} {airportInfo?.iata && `/ ${airportInfo.iata}`}
              </CardTitle>
              <p className="text-sm text-gray-300 mt-1">
                {displayName}
              </p>
              {airportInfo && (
                <p className="text-xs text-gray-400 mt-1">
                  {airportInfo.city}, {airportInfo.state}, {airportInfo.country.name}
                </p>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <ScrollArea className="flex-1">
          <CardContent className="space-y-4 pt-4 pr-3">
            {loading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                <span className="ml-2 text-sm text-gray-300">Loading airport data...</span>
              </div>
            )}

            {/* Flight Activity Summary */}
            {airport && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-600/20 border border-blue-500/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Plane className="h-4 w-4 text-blue-400 transform rotate-45" />
                    <span className="text-xs font-medium text-blue-300">Arrivals</span>
                  </div>
                  <p className="text-xl font-bold text-blue-100">{airport.inboundFlightsCount}</p>
                </div>
                
                <div className="bg-green-600/20 border border-green-500/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Plane className="h-4 w-4 text-green-400 transform -rotate-45" />
                    <span className="text-xs font-medium text-green-300">Departures</span>
                  </div>
                  <p className="text-xl font-bold text-green-100">{airport.outboundFlightsCount}</p>
                </div>
              </div>
            )}

            {/* Airport Information */}
            {airportInfo && (
              <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Building className="h-4 w-4 text-gray-400" />
                  <h3 className="font-semibold text-gray-200">Airport Information</h3>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location:</span>
                    <span className="text-gray-200">{airportInfo.city}, {airportInfo.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Country:</span>
                    <span className="text-gray-200">{airportInfo.country.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-gray-200">{getAirportClass(airportInfo.class)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Coordinates:</span>
                    <span className="text-gray-200 font-mono text-xs">
                      {airportInfo.latitude.toFixed(4)}, {airportInfo.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ATC Facilities */}
            {airport && airport.atcFacilities.length > 0 && (
              <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Radio className="h-4 w-4 text-gray-400" />
                  <h3 className="font-semibold text-gray-200">ATC Services</h3>
                </div>
                
                <div className="space-y-2">
                  {airport.atcFacilities.map((facility, index) => (
                    <div key={index} className="flex justify-between items-center py-1">
                      <div>
                        <span className="text-sm font-medium text-blue-300">
                          {getATCTypeLabel(facility.type)}
                        </span>
                        <p className="text-xs text-gray-400">{facility.username || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-300">{formatTime(facility.startTime)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Flight Lists */}
            {(inboundFlights.length > 0 || outboundFlights.length > 0) && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Plane className="h-4 w-4 text-gray-400" />
                  <h3 className="font-semibold text-gray-200">Flight Activity</h3>
                </div>
                <AirportFlightList
                  inboundFlights={inboundFlights}
                  outboundFlights={outboundFlights}
                  onFlightSelect={handleFlightSelect}
                />
              </div>
            )}

            {/* No Data Message */}
            {!loading && !airport && !airportInfo && (
              <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6 text-center">
                <MapPin className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No airport data available</p>
              </div>
            )}
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
};

export default EnhancedAirportDetails;
