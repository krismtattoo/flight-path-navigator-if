
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface PerformanceData {
  time: string;
  altitude: number;
  speed: number;
  verticalSpeed: number;
  heading: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
  currentAltitude: number;
  currentSpeed: number;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ 
  data, 
  currentAltitude, 
  currentSpeed 
}) => {
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold mb-2">{`Zeit: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.value}${entry.dataKey === 'altitude' ? 'ft' : entry.dataKey === 'speed' ? 'kts' : entry.dataKey === 'verticalSpeed' ? 'fpm' : '°'}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Calculate vertical speed trend
  const currentVerticalSpeed = data.length > 1 ? 
    ((data[data.length - 1]?.altitude || 0) - (data[data.length - 2]?.altitude || 0)) * 60 : 0;

  const isClimbing = currentVerticalSpeed > 50;
  const isDescending = currentVerticalSpeed < -50;

  return (
    <div className="space-y-6">
      {/* Performance Indicators */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">{Math.round(currentSpeed)}</p>
            <p className="text-sm text-blue-200">Geschwindigkeit (kts)</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-700">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">{Math.round(currentAltitude)}</p>
            <p className="text-sm text-green-200">Höhe (ft)</p>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${
          isClimbing ? 'from-emerald-900 to-emerald-800 border-emerald-700' :
          isDescending ? 'from-red-900 to-red-800 border-red-700' :
          'from-gray-900 to-gray-800 border-gray-700'
        }`}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              {isClimbing ? (
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              ) : isDescending ? (
                <TrendingDown className="w-6 h-6 text-red-400" />
              ) : (
                <Activity className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <p className="text-2xl font-bold text-white">
              {currentVerticalSpeed > 0 ? '+' : ''}{Math.round(currentVerticalSpeed)}
            </p>
            <p className={`text-sm ${
              isClimbing ? 'text-emerald-200' :
              isDescending ? 'text-red-200' :
              'text-gray-200'
            }`}>
              Steigrate (fpm)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Flugverlauf
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis 
                  dataKey="time" 
                  stroke="#94a3b8"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="altitude"
                  orientation="left"
                  stroke="#10b981"
                  fontSize={12}
                  label={{ value: 'Höhe (ft)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#10b981' } }}
                />
                <YAxis 
                  yAxisId="speed"
                  orientation="right"
                  stroke="#3b82f6"
                  fontSize={12}
                  label={{ value: 'Geschwindigkeit (kts)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#3b82f6' } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ color: '#ffffff' }}
                />
                <Line
                  yAxisId="altitude"
                  type="monotone"
                  dataKey="altitude"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                  name="Höhe"
                  connectNulls={false}
                />
                <Line
                  yAxisId="speed"
                  type="monotone"
                  dataKey="speed"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                  name="Geschwindigkeit"
                  connectNulls={false}
                />
                <Line
                  yAxisId="altitude"
                  type="monotone"
                  dataKey="verticalSpeed"
                  stroke="#f59e0b"
                  strokeWidth={1}
                  dot={{ fill: '#f59e0b', strokeWidth: 1, r: 2 }}
                  name="Steigrate (x10)"
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Chart Legend */}
          <div className="mt-4 flex justify-center space-x-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">Höhe (ft)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-300">Geschwindigkeit (kts)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-300">Steigrate x10 (fpm)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceChart;
