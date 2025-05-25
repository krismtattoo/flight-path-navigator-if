
import { useState, useMemo, useCallback } from 'react';
import { Flight } from '@/services/flight';
import { Airport, searchAirports } from '@/data/airportData';

export interface SearchResult {
  type: 'aircraft' | 'airport' | 'user';
  id: string;
  title: string;
  subtitle: string;
  data: Flight | Airport;
}

export interface UseFlightSearchProps {
  flights: Flight[];
}

export function useFlightSearch({ flights }: UseFlightSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const searchResults = useMemo(() => {
    if (!query || query.length < 2) return [];

    const normalizedQuery = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Search aircraft by username, callsign, and aircraft type - with null safety
    const aircraftResults = flights.filter(flight => 
      (flight.username?.toLowerCase().includes(normalizedQuery)) ||
      (flight.callsign?.toLowerCase().includes(normalizedQuery)) ||
      (flight.aircraft?.toLowerCase().includes(normalizedQuery))
    ).slice(0, 8).map(flight => ({
      type: 'aircraft' as const,
      id: flight.flightId,
      title: flight.callsign || 'Unknown Callsign',
      subtitle: `${flight.username || 'Unknown User'} • ${flight.aircraft || 'Unknown Aircraft'}`,
      data: flight
    }));

    // Search airports by ICAO/IATA
    const airportResults = searchAirports(normalizedQuery).map(airport => ({
      type: 'airport' as const,
      id: airport.icao,
      title: `${airport.icao} / ${airport.iata}`,
      subtitle: `${airport.name} • ${airport.city}, ${airport.country}`,
      data: airport
    }));

    // Search users by username (same as aircraft search but grouped differently) - with null safety
    const userResults = flights.filter(flight => 
      flight.username?.toLowerCase().includes(normalizedQuery)
    ).slice(0, 6).map(flight => ({
      type: 'user' as const,
      id: `user-${flight.userId}`,
      title: flight.username || 'Unknown User',
      subtitle: `Flying ${flight.aircraft || 'Unknown Aircraft'} as ${flight.callsign || 'Unknown Callsign'}`,
      data: flight
    }));

    // Combine and prioritize results
    results.push(...aircraftResults);
    results.push(...airportResults);
    results.push(...userResults);

    return results.slice(0, 15); // Limit total results
  }, [query, flights]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setIsOpen(false);
  }, []);

  const openSearch = useCallback(() => {
    setIsOpen(true);
  }, []);

  return {
    query,
    setQuery,
    searchResults,
    isOpen,
    setIsOpen,
    clearSearch,
    openSearch
  };
}
