
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp, TrendingDown, Activity, Gauge, Plane } from 'lucide-react';

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
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-2xl">
          <p className="text-white font-semibold mb-3 text-sm">{`Time: ${label}`}</p>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-300 text-xs">
                  {`${entry.name}: ${entry.value.toFixed(1)}${
                    entry.dataKey === 'altitude' ? 'ft' : 
                    entry.dataKey === 'speed' ? 'kts' : 
                    entry.dataKey === 'verticalSpeed' ? 'fpm' : '°'
                  }`}
                </span>
              </div>
            ))}
          </div>
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
        <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Gauge className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{Math.round(currentSpeed)}</p>
            <p className="text-xs text-indigo-100 uppercase tracking-wide">Airspeed</p>
            <p className="text-xs text-indigo-200">knots</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Plane className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{Math.round(currentAltitude).toLocaleString()}</p>
            <p className="text-xs text-emerald-100 uppercase tracking-wide">Altitude</p>
            <p className="text-xs text-emerald-200">feet</p>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-lg ${
          isClimbing ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
          isDescending ? 'bg-gradient-to-br from-red-500 to-pink-600' :
          'bg-gradient-to-br from-gray-600 to-slate-700'
        }`}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="bg-white/20 p-2 rounded-full">
                {isClimbing ? (
                  <TrendingUp className="w-5 h-5 text-white" />
                ) : isDescending ? (
                  <TrendingDown className="w-5 h-5 text-white" />
                ) : (
                  <Activity className="w-5 h-5 text-white" />
                )}
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">
              {currentVerticalSpeed > 0 ? '+' : ''}{Math.round(currentVerticalSpeed)}
            </p>
            <p className="text-xs text-white/80 uppercase tracking-wide">Vertical Speed</p>
            <p className="text-xs text-white/60">ft/min</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Performance Chart with Multiple Metrics */}
      <Card className="bg-gradient-to-br from-gray-900 to-slate-800 border-gray-700 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-3 text-lg">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            Flight Profile - Altitude, Speed & Vertical Speed
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
                <defs>
                  <linearGradient id="altitudeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="time" 
                  stroke="#9ca3af"
                  fontSize={11}
                  tick={{ fill: '#9ca3af' }}
                />
                
                {/* Left Y-Axis for Altitude - Starting at 0 */}
                <YAxis 
                  yAxisId="altitude"
                  orientation="left"
                  stroke="#10b981"
                  fontSize={11}
                  tick={{ fill: '#10b981' }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(1)}k ft`}
                  domain={[0, 'dataMax + 2000']}
                />
                
                {/* Right Y-Axis for Speed - Starting at 0 */}
                <YAxis 
                  yAxisId="speed"
                  orientation="right"
                  stroke="#3b82f6"
                  fontSize={11}
                  tick={{ fill: '#3b82f6' }}
                  tickFormatter={(value) => `${value.toFixed(0)} kts`}
                  domain={[0, 'dataMax + 50']}
                />
                
                {/* Additional Y-Axis for Vertical Speed - Centered around 0 */}
                <YAxis 
                  yAxisId="verticalSpeed"
                  orientation="right"
                  stroke="#f59e0b"
                  fontSize={11}
                  tick={{ fill: '#f59e0b' }}
                  tickFormatter={(value) => `${value.toFixed(0)} fpm`}
                  domain={[-2000, 2000]}
                  hide={true}
                />
                
                <Tooltip content={<CustomTooltip />} />
                
                {/* Altitude Area Chart */}
                <Area
                  yAxisId="altitude"
                  type="monotone"
                  dataKey="altitude"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#altitudeGradient)"
                  name="Altitude"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
                  connectNulls={false}
                />
                
                {/* Speed Line */}
                <Line
                  yAxisId="speed"
                  type="monotone"
                  dataKey="speed"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  name="Airspeed"
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
                  connectNulls={false}
                />
                
                {/* Vertical Speed Line */}
                <Line
                  yAxisId="verticalSpeed"
                  type="monotone"
                  dataKey="verticalSpeed"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Vertical Speed"
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 2 }}
                  activeDot={{ r: 4, stroke: '#f59e0b', strokeWidth: 2, fill: '#ffffff' }}
                  strokeDasharray="5 5"
                  connectNulls={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          {/* Enhanced Chart Legend */}
          <div className="mt-6 flex justify-center">
            <div className="flex items-center space-x-6 bg-gray-800/50 px-6 py-3 rounded-full">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full shadow-sm"></div>
                <span className="text-gray-300 text-sm font-medium">Altitude (ft)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow-sm"></div>
                <span className="text-gray-300 text-sm font-medium">Airspeed (kts)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full shadow-sm border-2 border-dashed border-amber-500"></div>
                <span className="text-gray-300 text-sm font-medium">Vertical Speed (fpm)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceChart;
