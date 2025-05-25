
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface VerticalSpeedChartProps {
  data: Array<{
    time: string;
    verticalSpeed: number;
  }>;
}

const VerticalSpeedChart: React.FC<VerticalSpeedChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-xl p-3 shadow-2xl">
          <p className="text-white font-semibold mb-2 text-sm">{`Zeit: ${label}`}</p>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              value > 0 ? 'bg-green-500' : value < 0 ? 'bg-red-500' : 'bg-gray-500'
            }`} />
            <span className="text-gray-300 text-xs">
              Steigrate: {value > 0 ? '+' : ''}{value.toFixed(0)}fpm
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const currentVerticalSpeed = data.length > 1 ? data[data.length - 1]?.verticalSpeed || 0 : 0;
  const isClimbing = currentVerticalSpeed > 50;
  const isDescending = currentVerticalSpeed < -50;

  return (
    <Card className="border-slate-700 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-3 text-base">
          <div className={`p-2 rounded-lg ${
            isClimbing ? 'bg-green-600' :
            isDescending ? 'bg-red-600' :
            'bg-gray-600'
          }`}>
            {isClimbing ? (
              <TrendingUp className="w-4 h-4 text-white" />
            ) : isDescending ? (
              <TrendingDown className="w-4 h-4 text-white" />
            ) : (
              <Activity className="w-4 h-4 text-white" />
            )}
          </div>
          Steigratenverlauf
          <span className={`ml-auto text-2xl font-bold ${
            isClimbing ? 'text-green-300' :
            isDescending ? 'text-red-300' :
            'text-gray-300'
          }`}>
            {currentVerticalSpeed > 0 ? '+' : ''}{Math.round(currentVerticalSpeed)}fpm
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
                stroke="#f59e0b"
                fontSize={10}
                tick={{ fill: '#f59e0b' }}
                tickFormatter={(value) => `${value > 0 ? '+' : ''}${value.toFixed(0)}`}
                domain={[-2000, 2000]}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="2 2" opacity={0.7} />
              <Line
                type="monotone"
                dataKey="verticalSpeed"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#f59e0b', strokeWidth: 2, fill: '#ffffff' }}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default VerticalSpeedChart;
