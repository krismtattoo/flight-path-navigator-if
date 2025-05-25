
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
    <div className="absolute top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-[calc(100vw-1rem)] sm:max-w-none px-2 sm:px-0">
      <Card className="shadow-lg bg-slate-800/95 backdrop-blur-sm border-slate-700">
        <Tabs 
          defaultValue={defaultValue}
          className="w-full sm:w-[400px]"
          onValueChange={(value) => {
            console.log(`Selected server: ${value}`);
            onServerChange(value);
          }}
        >
          <TabsList className="grid grid-cols-3 w-full bg-slate-700/50 h-10 sm:h-auto">
            {servers.map(server => (
              <TabsTrigger 
                key={server.id} 
                value={server.id}
                className="text-white data-[state=active]:bg-slate-600 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-3 py-2 min-h-[44px] sm:min-h-auto"
              >
                <span className="truncate">{server.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </Card>
    </div>
  );
};

export default ServerSelection;
