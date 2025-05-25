
import React from 'react';
import { AirportStatus } from '@/services/flight/worldService';
import { AirportInfo } from '@/services/flight/airportInfoService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Plane, Users, Radio, MapPin, Globe, Clock, Building } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface EnhancedAirportDetailsProps {
  airport?: AirportStatus;
  airportInfo?: AirportInfo;
  loading?: boolean;
  onClose: () => void;
}

const EnhancedAirportDetails: React.FC<EnhancedAirportDetailsProps> = ({ 
  airport, 
  airportInfo,
  loading,
  onClose 
}) => {
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
      return date.toLocaleTimeString('de-DE', { 
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
      1: 'Kleine Flugplätze',
      2: 'Regionale Flughäfen',
      3: 'Große Flughäfen',
      4: 'Internationale Flughäfen'
    };
    return classes[classNumber as keyof typeof classes] || 'Unbekannt';
  };

  const displayName = airportInfo?.name || airport?.airportName || 'Flughafen';
  const displayIcao = airportInfo?.icao || airport?.airportIcao || '';

  return (
    <div className="absolute top-4 left-4 z-20 w-96 max-h-[80vh] overflow-y-auto">
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl border">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">
                {displayIcao} {airportInfo?.iata && `/ ${airportInfo.iata}`}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {displayName}
              </p>
              {airportInfo && (
                <p className="text-xs text-gray-500 mt-1">
                  {airportInfo.city}, {airportInfo.state}, {airportInfo.country.name}
                </p>
              )}
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
          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Lade Flughafendaten...</span>
            </div>
          )}

          {/* Flight Activity - only if airport status available */}
          {airport && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-blue-600 transform rotate-45" />
                  <span className="text-sm font-medium text-blue-800">Ankommende</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{airport.inboundFlightsCount}</p>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-green-600 transform -rotate-45" />
                  <span className="text-sm font-medium text-green-800">Abfliegende</span>
                </div>
                <p className="text-2xl font-bold text-green-900">{airport.outboundFlightsCount}</p>
              </div>
            </div>
          )}

          {/* Airport Information */}
          {airportInfo && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Flughafendaten
              </h3>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Klasse:</span>
                  <p className="font-medium">{getAirportClass(airportInfo.class)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Höhe:</span>
                  <p className="font-medium">{airportInfo.elevation} ft</p>
                </div>
                <div>
                  <span className="text-gray-600">Frequenzen:</span>
                  <p className="font-medium">{airportInfo.frequenciesCount}</p>
                </div>
                <div>
                  <span className="text-gray-600">Zeitzone:</span>
                  <p className="font-medium text-xs">{airportInfo.timezone}</p>
                </div>
              </div>

              {/* Features */}
              <div>
                <span className="text-gray-600 text-sm">Ausstattung:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {airportInfo.has3dBuildings && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">3D Gebäude</span>
                  )}
                  {airportInfo.hasJetbridges && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Fluggastbrücken</span>
                  )}
                  {airportInfo.hasSafedockUnits && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Safedock</span>
                  )}
                  {airportInfo.hasTaxiwayRouting && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">Rollweg-Routing</span>
                  )}
                </div>
              </div>

              {/* Coordinates */}
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                <div>Lat: {airportInfo.latitude.toFixed(6)}</div>
                <div>Lng: {airportInfo.longitude.toFixed(6)}</div>
              </div>
            </div>
          )}

          {/* ATC Facilities - only if airport status available */}
          {airport && airport.atcFacilities.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Radio className="h-4 w-4 text-gray-600" />
                <h3 className="font-semibold text-gray-900">ATC Dienste</h3>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs py-2">Typ</TableHead>
                      <TableHead className="text-xs py-2">Controller</TableHead>
                      <TableHead className="text-xs py-2">Start</TableHead>
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

export default EnhancedAirportDetails;
