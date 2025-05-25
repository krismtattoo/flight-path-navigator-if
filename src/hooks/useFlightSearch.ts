
import { useState, useMemo, useCallback } from 'react';
import { Flight } from '@/services/flight';
import { Airport, searchAirports } from '@/data/airportData';
import { useDebounce } from './useDebounce';

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

// Helper function to get aircraft display name
const getAircraftDisplayName = (aircraft: string | null | undefined): string => {
  if (!aircraft || aircraft.trim() === '') {
    return 'Unknown Aircraft';
  }
  
  // Clean up aircraft string - remove empty spaces and handle common formats
  const cleanAircraft = aircraft.trim();
  
  // If it's just a code or very short, it might be an aircraft ID
  if (cleanAircraft.length <= 3) {
    return 'Unknown Aircraft';
  }
  
  return cleanAircraft;
};

// Helper function to normalize search string for better matching
const normalizeSearchString = (str: string | null | undefined): string => {
  if (!str) return '';
  return str.toLowerCase().trim();
};

// Helper function to check if string matches query
const matchesQuery = (value: string | null | undefined, query: string): boolean => {
  if (!value) return false;
  return normalizeSearchString(value).includes(query);
};

export function useFlightSearch({ flights }: UseFlightSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce the search query to improve performance
  const debouncedQuery = useDebounce(query, 300);

  const searchResults = useMemo(() => {
    // Early return for short queries
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setIsSearching(false);
      return [];
    }

    setIsSearching(true);
    console.log(`🔍 Searching for: "${debouncedQuery}" across ${flights.length} flights`);

    const normalizedQuery = debouncedQuery.toLowerCase().trim();
    const results: SearchResult[] = [];

    // More efficient single-pass filtering for aircraft
    const aircraftResults: SearchResult[] = [];
    const userResults: SearchResult[] = [];
    
    // Process flights in a single loop for better performance
    for (const flight of flights) {
      // Early break if we have enough results
      if (aircraftResults.length >= 8 && userResults.length >= 6) break;
      
      const matchesUsername = matchesQuery(flight.username, normalizedQuery);
      const matchesCallsign = matchesQuery(flight.callsign, normalizedQuery);
      const matchesAircraft = matchesQuery(flight.aircraft, normalizedQuery);
      
      // Add to aircraft results if matches any aircraft-related field
      if ((matchesUsername || matchesCallsign || matchesAircraft) && aircraftResults.length < 8) {
        const aircraftDisplayName = getAircraftDisplayName(flight.aircraft);
        
        aircraftResults.push({
          type: 'aircraft' as const,
          id: flight.flightId,
          title: flight.callsign || 'Unknown Callsign',
          subtitle: `${flight.username || 'Unknown User'} • ${aircraftDisplayName}`,
          data: flight
        });
      }
      
      // Add to user results if matches username specifically
      if (matchesUsername && userResults.length < 6) {
        const aircraftDisplayName = getAircraftDisplayName(flight.aircraft);
        
        userResults.push({
          type: 'user' as const,
          id: `user-${flight.userId}`,
          title: flight.username || 'Unknown User',
          subtitle: `Flying ${aircraftDisplayName} as ${flight.callsign || 'Unknown Callsign'}`,
          data: flight
        });
      }
    }

    // Search airports (limit to 5 for performance)
    const airportResults = searchAirports(normalizedQuery).slice(0, 5).map(airport => ({
      type: 'airport' as const,
      id: airport.icao,
      title: `${airport.icao} / ${airport.iata}`,
      subtitle: `${airport.name} • ${airport.city}, ${airport.country}`,
      data: airport
    }));

    // Combine results with prioritization
    results.push(...aircraftResults);
    results.push(...airportResults);
    results.push(...userResults);

    const totalResults = results.length;
    console.log(`✅ Search completed: ${totalResults} results (${aircraftResults.length} aircraft, ${airportResults.length} airports, ${userResults.length} users)`);
    
    setIsSearching(false);
    return results.slice(0, 15); // Limit total results for performance
  }, [debouncedQuery, flights]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setIsOpen(false);
    setIsSearching(false);
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
    openSearch,
    isSearching,
    debouncedQuery
  };
}
