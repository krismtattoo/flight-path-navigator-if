
import React, { useState } from 'react';
import { Flight } from '@/services/flight';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plane, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AirportFlightListProps {
  inboundFlights: Flight[];
  outboundFlights: Flight[];
  onFlightSelect: (flight: Flight) => void;
}

const AirportFlightList: React.FC<AirportFlightListProps> = ({
  inboundFlights,
  outboundFlights,
  onFlightSelect
}) => {
  const [showInbound, setShowInbound] = useState(false);
  const [showOutbound, setShowOutbound] = useState(false);

  const formatAltitude = (altitude: number): string => {
    return `${Math.round(altitude).toLocaleString()} ft`;
  };

  const formatSpeed = (speed: number): string => {
    return `${Math.round(speed)} kts`;
  };

  const FlightRow: React.FC<{ flight: Flight; type: 'inbound' | 'outbound' }> = ({ flight, type }) => (
    <TableRow 
      className="border-slate-600 hover:bg-slate-700/50 transition-colors cursor-pointer"
      onClick={() => onFlightSelect(flight)}
    >
      <TableCell className="text-xs py-2 font-medium text-blue-300">
        {flight.callsign}
      </TableCell>
      <TableCell className="text-xs py-2 text-gray-300">
        {flight.aircraft || 'Unknown'}
      </TableCell>
      <TableCell className="text-xs py-2 text-gray-300">
        {formatAltitude(flight.altitude)}
      </TableCell>
      <TableCell className="text-xs py-2 text-gray-300">
        {formatSpeed(flight.speed)}
      </TableCell>
      <TableCell className="text-xs py-2">
        <div className="flex items-center gap-1">
          <Plane className={`h-3 w-3 ${type === 'inbound' ? 'text-blue-400 rotate-45' : 'text-green-400 -rotate-45'}`} />
          <span className={`text-xs ${type === 'inbound' ? 'text-blue-300' : 'text-green-300'}`}>
            {type === 'inbound' ? 'Arrival' : 'Departure'}
          </span>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-3">
      {/* Inbound Flights */}
      {inboundFlights.length > 0 && (
        <Card className="bg-slate-800/60 border border-slate-600 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-300 flex items-center gap-2">
                <Plane className="h-4 w-4 transform rotate-45" />
                Arriving Flights ({inboundFlights.length})
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInbound(!showInbound)}
                className="h-6 w-6 p-0 text-blue-400 hover:text-blue-300 hover:bg-slate-700/50"
              >
                {showInbound ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            </div>
          </CardHeader>
          {showInbound && (
            <CardContent className="pt-0">
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg overflow-hidden">
                <ScrollArea className="h-48">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-600">
                        <TableHead className="text-xs py-1 text-blue-300">Callsign</TableHead>
                        <TableHead className="text-xs py-1 text-blue-300">Aircraft</TableHead>
                        <TableHead className="text-xs py-1 text-blue-300">Altitude</TableHead>
                        <TableHead className="text-xs py-1 text-blue-300">Speed</TableHead>
                        <TableHead className="text-xs py-1 text-blue-300">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inboundFlights.map((flight) => (
                        <FlightRow 
                          key={flight.flightId} 
                          flight={flight} 
                          type="inbound" 
                        />
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Outbound Flights */}
      {outboundFlights.length > 0 && (
        <Card className="bg-slate-800/60 border border-slate-600 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-300 flex items-center gap-2">
                <Plane className="h-4 w-4 transform -rotate-45" />
                Departing Flights ({outboundFlights.length})
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOutbound(!showOutbound)}
                className="h-6 w-6 p-0 text-green-400 hover:text-green-300 hover:bg-slate-700/50"
              >
                {showOutbound ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            </div>
          </CardHeader>
          {showOutbound && (
            <CardContent className="pt-0">
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg overflow-hidden">
                <ScrollArea className="h-48">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-600">
                        <TableHead className="text-xs py-1 text-green-300">Callsign</TableHead>
                        <TableHead className="text-xs py-1 text-green-300">Aircraft</TableHead>
                        <TableHead className="text-xs py-1 text-green-300">Altitude</TableHead>
                        <TableHead className="text-xs py-1 text-green-300">Speed</TableHead>
                        <TableHead className="text-xs py-1 text-green-300">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {outboundFlights.map((flight) => (
                        <FlightRow 
                          key={flight.flightId} 
                          flight={flight} 
                          type="outbound" 
                        />
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* No flights message */}
      {inboundFlights.length === 0 && outboundFlights.length === 0 && (
        <div className="bg-slate-800/60 border border-slate-600 rounded-lg p-4 text-center backdrop-blur-sm">
          <MapPin className="h-8 w-8 text-gray-500 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No active flights at this airport</p>
        </div>
      )}
    </div>
  );
};

export default AirportFlightList;
