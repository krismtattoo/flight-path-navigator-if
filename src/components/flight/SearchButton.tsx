
import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchButtonProps {
  onClick: () => void;
}

const SearchButton: React.FC<SearchButtonProps> = ({ onClick }) => {
  return (
    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10">
      <Button
        onClick={onClick}
        size="sm"
        className="bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white shadow-lg border border-gray-200 flex items-center gap-2 min-h-[44px] min-w-[44px] px-3 sm:px-4"
      >
        <Search className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="hidden sm:inline">Suchen</span>
        <span className="hidden lg:inline text-xs text-gray-500 ml-1">⌘K</span>
      </Button>
    </div>
  );
};

export default SearchButton;
