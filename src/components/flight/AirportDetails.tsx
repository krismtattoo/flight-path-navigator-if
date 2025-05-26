
import React from 'react';
import { AirportStatus } from '@/services/flight/worldService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Plane, Users, Radio } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AirportDetailsProps {
  airport: AirportStatus;
  onClose: () => void;
}

const AirportDetails: React.FC<AirportDetailsProps> = ({ airport, onClose }) => {
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

  return (
    <div className="absolute top-4 left-4 z-20 w-96 max-h-[80vh] overflow-y-auto">
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl border">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">
                {airport.airportIcao}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {airport.airportName}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Flight Activity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Plane className="h-4 w-4 text-blue-600 transform rotate-45" />
                <span className="text-sm font-medium text-blue-800">Arrivals</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{airport.inboundFlightsCount}</p>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Plane className="h-4 w-4 text-green-600 transform -rotate-45" />
                <span className="text-sm font-medium text-green-800">Departures</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{airport.outboundFlightsCount}</p>
            </div>
          </div>

          {/* ATC Facilities */}
          {airport.atcFacilities.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Radio className="h-4 w-4 text-gray-600" />
                <h3 className="font-semibold text-gray-900">ATC Services</h3>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs py-2">Type</TableHead>
                      <TableHead className="text-xs py-2">Controller</TableHead>
                      <TableHead className="text-xs py-2">Start Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {airport.atcFacilities.map((facility, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-xs py-2 font-medium">
                          {getATCTypeLabel(facility.type)}
                        </TableCell>
                        <TableCell className="text-xs py-2">
                          {facility.username || 'N/A'}
                        </TableCell>
                        <TableCell className="text-xs py-2">
                          {formatTime(facility.startTime)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AirportDetails;
