
import { useMemo } from 'react';
import { Flight } from '@/services/flight';
import { AirportStatus } from '@/services/flight/worldService';

interface UseAirportFlightsProps {
  airport: AirportStatus | null;
  flights: Flight[];
}

interface AirportFlights {
  inboundFlights: Flight[];
  outboundFlights: Flight[];
}

export function useAirportFlights({ airport, flights }: UseAirportFlightsProps): AirportFlights {
  const airportFlights = useMemo(() => {
    if (!airport || !flights.length) {
      return { inboundFlights: [], outboundFlights: [] };
    }

    const inboundFlights = flights.filter(flight => 
      airport.inboundFlights.includes(flight.flightId)
    );

    const outboundFlights = flights.filter(flight => 
      airport.outboundFlights.includes(flight.flightId)
    );

    console.log(`✈️ Airport ${airport.airportIcao}: ${inboundFlights.length} inbound, ${outboundFlights.length} outbound flights`);

    return { inboundFlights, outboundFlights };
  }, [airport, flights]);

  return airportFlights;
}
