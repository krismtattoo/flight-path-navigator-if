
import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SERVER_TYPES } from '@/services/flight';

interface Server {
  id: string;
  name: string;
}

interface ServerSelectionProps {
  servers: Server[];
  onServerChange: (serverId: string) => void;
  defaultValue?: string;
}

const ServerSelection: React.FC<ServerSelectionProps> = ({ 
  servers, 
  onServerChange, 
  defaultValue = "casual" 
}) => {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
      <Card className="shadow-lg bg-slate-800/95 backdrop-blur-sm border-slate-700">
        <Tabs 
          defaultValue={defaultValue}
          className="w-[400px]"
          onValueChange={(value) => {
            console.log(`Selected server: ${value}`);
            onServerChange(value);
          }}
        >
          <TabsList className="grid grid-cols-3 w-full bg-slate-700/50">
            {servers.map(server => (
              <TabsTrigger 
                key={server.id} 
                value={server.id}
                className="text-white data-[state=active]:bg-slate-600 data-[state=active]:text-white"
              >
                {server.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </Card>
    </div>
  );
};

export default ServerSelection;
