
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
      <Card className="bg-slate-900/95 backdrop-blur-sm shadow-2xl border border-slate-700 text-white">
        <CardHeader className="pb-4 border-b border-slate-700">
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
        
        <CardContent className="space-y-4 pt-4">
          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
              <span className="ml-2 text-sm text-gray-300">Lade Flughafendaten...</span>
            </div>
          )}

          {/* Flight Activity - only if airport status available */}
          {airport && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 p-3 rounded-lg backdrop-blur-sm hover:from-blue-600/30 hover:to-blue-800/30 transition-all duration-200">
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-blue-400 transform rotate-45" />
                  <span className="text-sm font-medium text-blue-300">Ankommende</span>
                </div>
                <p className="text-2xl font-bold text-blue-100">{airport.inboundFlightsCount}</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 p-3 rounded-lg backdrop-blur-sm hover:from-green-600/30 hover:to-green-800/30 transition-all duration-200">
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-green-400 transform -rotate-45" />
                  <span className="text-sm font-medium text-green-300">Abfliegende</span>
                </div>
                <p className="text-2xl font-bold text-green-100">{airport.outboundFlightsCount}</p>
              </div>
            </div>
          )}

          {/* Airport Information */}
          {airportInfo && (
            <div className="space-y-3">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                Flughafendaten
              </h3>
              
              <div className="bg-slate-800/60 border border-slate-600 rounded-lg p-3 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Klasse:</span>
                    <p className="font-medium text-gray-200">{getAirportClass(airportInfo.class)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Höhe:</span>
                    <p className="font-medium text-gray-200">{airportInfo.elevation} ft</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Frequenzen:</span>
                    <p className="font-medium text-gray-200">{airportInfo.frequenciesCount}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Zeitzone:</span>
                    <p className="font-medium text-xs text-gray-200">{airportInfo.timezone}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="mt-3">
                  <span className="text-gray-400 text-sm">Ausstattung:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {airportInfo.has3dBuildings && (
                      <span className="px-2 py-1 bg-blue-600/30 text-blue-300 text-xs rounded border border-blue-500/50">3D Gebäude</span>
                    )}
                    {airportInfo.hasJetbridges && (
                      <span className="px-2 py-1 bg-green-600/30 text-green-300 text-xs rounded border border-green-500/50">Fluggastbrücken</span>
                    )}
                    {airportInfo.hasSafedockUnits && (
                      <span className="px-2 py-1 bg-purple-600/30 text-purple-300 text-xs rounded border border-purple-500/50">Safedock</span>
                    )}
                    {airportInfo.hasTaxiwayRouting && (
                      <span className="px-2 py-1 bg-orange-600/30 text-orange-300 text-xs rounded border border-orange-500/50">Rollweg-Routing</span>
                    )}
                  </div>
                </div>

                {/* Coordinates */}
                <div className="text-xs text-gray-400 bg-slate-700/50 p-2 rounded mt-3 border border-slate-600">
                  <div>Lat: {airportInfo.latitude.toFixed(6)}</div>
                  <div>Lng: {airportInfo.longitude.toFixed(6)}</div>
                </div>
              </div>
            </div>
          )}

          {/* ATC Facilities - only if airport status available */}
          {airport && airport.atcFacilities.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Radio className="h-4 w-4 text-gray-400" />
                <h3 className="font-semibold text-white">ATC Dienste</h3>
              </div>
              
              <div className="bg-slate-800/60 border border-slate-600 rounded-lg overflow-hidden backdrop-blur-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-600 hover:bg-slate-700/50">
                      <TableHead className="text-xs py-2 text-gray-300 font-medium">Typ</TableHead>
                      <TableHead className="text-xs py-2 text-gray-300 font-medium">Controller</TableHead>
                      <TableHead className="text-xs py-2 text-gray-300 font-medium">Start</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {airport.atcFacilities.map((facility, index) => (
                      <TableRow key={index} className="border-slate-600 hover:bg-slate-700/30 transition-colors">
                        <TableCell className="text-xs py-2 font-medium text-gray-200">
                          {getATCTypeLabel(facility.type)}
                        </TableCell>
                        <TableCell className="text-xs py-2 text-gray-300">
                          {facility.username || 'N/A'}
                        </TableCell>
                        <TableCell className="text-xs py-2 text-gray-300">
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
