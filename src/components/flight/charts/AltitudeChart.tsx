
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Plane } from 'lucide-react';

interface AltitudeChartProps {
  data: Array<{
    time: string;
    altitude: number;
  }>;
  currentAltitude: number;
}

const AltitudeChart: React.FC<AltitudeChartProps> = ({ data, currentAltitude }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-xl p-3 shadow-2xl">
          <p className="text-white font-semibold mb-2 text-sm">{`Zeit: ${label}`}</p>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-gray-300 text-xs">
              Höhe: {payload[0].value.toFixed(0)}ft
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const maxAltitude = Math.max(...data.map(d => d.altitude), currentAltitude);
  const yAxisMax = Math.max(maxAltitude + 1000, 5000);

  return (
    <Card className="border-slate-700 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-3 text-base">
          <div className="bg-emerald-600 p-2 rounded-lg">
            <Plane className="w-4 h-4 text-white" />
          </div>
          Höhenverlauf
          <span className="ml-auto text-2xl font-bold text-emerald-300">
            {Math.round(currentAltitude).toLocaleString()}ft
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="altitudeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="time" 
                stroke="#9ca3af"
                fontSize={10}
                tick={{ fill: '#9ca3af' }}
              />
              <YAxis 
                stroke="#10b981"
                fontSize={10}
                tick={{ fill: '#10b981' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
                domain={[0, yAxisMax]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="altitude"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#altitudeGradient)"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AltitudeChart;
