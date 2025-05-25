
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Zap } from 'lucide-react';

interface SpeedChartProps {
  data: Array<{
    time: string;
    speed: number;
  }>;
  currentSpeed: number;
}

const SpeedChart: React.FC<SpeedChartProps> = ({ data, currentSpeed }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-xl p-3 shadow-2xl">
          <p className="text-white font-semibold mb-2 text-sm">{`Zeit: ${label}`}</p>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-300 text-xs">
              Geschwindigkeit: {payload[0].value.toFixed(0)}kts
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const maxSpeed = Math.max(...data.map(d => d.speed), currentSpeed);
  const yAxisMax = Math.max(maxSpeed + 50, 200);

  return (
    <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-700/50 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-3 text-base">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Zap className="w-4 h-4 text-white" />
          </div>
          Geschwindigkeitsverlauf
          <span className="ml-auto text-2xl font-bold text-blue-300">
            {Math.round(currentSpeed)}kts
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="time" 
                stroke="#9ca3af"
                fontSize={10}
                tick={{ fill: '#9ca3af' }}
              />
              <YAxis 
                stroke="#3b82f6"
                fontSize={10}
                tick={{ fill: '#3b82f6' }}
                tickFormatter={(value) => `${value.toFixed(0)}`}
                domain={[0, yAxisMax]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="speed"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpeedChart;
