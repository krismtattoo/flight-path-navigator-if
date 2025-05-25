
import React, { useEffect } from 'react';
import { Search, Plane, MapPin, User } from 'lucide-react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Flight } from '@/services/flight';
import { Airport } from '@/data/airportData';
import { SearchResult } from '@/hooks/useFlightSearch';

interface FlightSearchProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  query: string;
  onQueryChange: (query: string) => void;
  searchResults: SearchResult[];
  onSelectResult: (result: SearchResult) => void;
}

const FlightSearch: React.FC<FlightSearchProps> = ({
  isOpen,
  onOpenChange,
  query,
  onQueryChange,
  searchResults,
  onSelectResult
}) => {
  
  // Keyboard shortcut for opening search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(true);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [onOpenChange]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'aircraft':
        return <Plane className="w-4 h-4" />;
      case 'airport':
        return <MapPin className="w-4 h-4" />;
      case 'user':
        return <User className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getGroupTitle = (type: string) => {
    switch (type) {
      case 'aircraft':
        return 'Flugzeuge';
      case 'airport':
        return 'Flughäfen';
      case 'user':
        return 'Benutzer';
      default:
        return 'Ergebnisse';
    }
  };

  // Group results by type
  const groupedResults = searchResults.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <CommandDialog open={isOpen} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Flugzeuge, Flughäfen oder Benutzer suchen..."
        value={query}
        onValueChange={onQueryChange}
      />
      <CommandList>
        <CommandEmpty>
          {query.length < 2 
            ? "Geben Sie mindestens 2 Zeichen ein..." 
            : "Keine Ergebnisse gefunden."
          }
        </CommandEmpty>
        
        {Object.entries(groupedResults).map(([type, results]) => (
          <CommandGroup key={type} heading={getGroupTitle(type)}>
            {results.map((result) => (
              <CommandItem
                key={result.id}
                value={result.title}
                onSelect={() => {
                  onSelectResult(result);
                  onOpenChange(false);
                }}
                className="flex items-center gap-3 py-3"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                  {getIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {result.title}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {result.subtitle}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
};

export default FlightSearch;
