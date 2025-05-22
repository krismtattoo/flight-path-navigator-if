import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Flight } from '@/services/flight';
import { getUserDetails } from '@/services/flight';

interface FlightDetailsProps {
  flight: Flight | null;
  serverID: string;
  onClose: () => void;
}

const FlightDetails: React.FC<FlightDetailsProps> = ({ flight, serverID, onClose }) => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserInfo = async () => {
      if (!flight) return;
      setLoading(true);
      try {
        const data = await getUserDetails(serverID, flight.userId);
        if (data) {
          setUserInfo(data);
        }
      } catch (error) {
        console.error("Failed to load user info", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserInfo();
  }, [flight, serverID]);

  if (!flight) return null;

  return (
    <Card className="absolute bottom-8 right-8 w-80 z-10 shadow-lg animate-fade-in bg-white/95 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-flight-dark-blue">{flight.callsign}</h3>
            <p className="text-sm text-gray-600">{flight.aircraft}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>
        
        <div className="mt-4 space-y-3">
          <div>
            <p className="text-xs text-gray-500">Altitude</p>
            <p className="font-medium">{Math.round(flight.altitude).toLocaleString()} ft</p>
          </div>
          
          <div>
            <p className="text-xs text-gray-500">Speed</p>
            <p className="font-medium">{Math.round(flight.speed).toLocaleString()} kts</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Heading</p>
            <p className="font-medium">{Math.round(flight.heading)}°</p>
          </div>

          <div className="border-t pt-3 mt-3">
            <h4 className="font-medium mb-2">User Information</h4>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : userInfo ? (
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-flight-light-blue flex items-center justify-center text-white font-bold">
                    {userInfo.username?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-medium">{userInfo.username}</p>
                    {userInfo.virtualOrganization && (
                      <p className="text-xs text-gray-600">{userInfo.virtualOrganization}</p>
                    )}
                  </div>
                </div>
                {userInfo.grade && (
                  <p className="text-sm">Grade: {userInfo.grade}</p>
                )}
              </div>
            ) : (
              <p className="text-sm italic text-gray-500">No user information available</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlightDetails;
