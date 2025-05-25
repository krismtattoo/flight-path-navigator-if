
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Plane, MapPin, User } from 'lucide-react';
import { SearchResult } from '@/hooks/useFlightSearch';

interface FlightSearchProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  query: string;
  onQueryChange: (query: string) => void;
  searchResults: SearchResult[];
  onSelectResult: (result: SearchResult) => void;
  isSearching: boolean;
  debouncedQuery: string;
}

const FlightSearch: React.FC<FlightSearchProps> = ({
  isOpen,
  onOpenChange,
  query,
  onQueryChange,
  searchResults,
  onSelectResult,
  isSearching,
  debouncedQuery
}) => {
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'aircraft':
        return <Plane className="w-4 h-4 text-blue-400" />;
      case 'airport':
        return <MapPin className="w-4 h-4 text-red-400" />;
      case 'user':
        return <User className="w-4 h-4 text-green-400" />;
      default:
        return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Flight Search
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search flights, aircraft, airports, or users..."
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              autoFocus
            />
          </div>

          {isSearching && debouncedQuery && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-400">Searching...</span>
            </div>
          )}

          {!isSearching && debouncedQuery && debouncedQuery.length >= 2 && (
            <div className="max-h-96 overflow-y-auto space-y-1">
              {searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => onSelectResult(result)}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    {getResultIcon(result.type)}
                    <div className="flex-1">
                      <div className="font-medium text-white">{result.title}</div>
                      <div className="text-sm text-gray-400">{result.subtitle}</div>
                    </div>
                    <div className="text-xs text-gray-500 capitalize">{result.type}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No results found for "{debouncedQuery}"
                </div>
              )}
            </div>
          )}

          {(!debouncedQuery || debouncedQuery.length < 2) && (
            <div className="text-center py-8 text-gray-400">
              Type at least 2 characters to search
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FlightSearch;
