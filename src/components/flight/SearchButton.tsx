
import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchButtonProps {
  onClick: () => void;
}

const SearchButton: React.FC<SearchButtonProps> = ({ onClick }) => {
  return (
    <div className="absolute top-4 right-4 z-10">
      <Button
        onClick={onClick}
        size="sm"
        className="bg-slate-800/95 backdrop-blur-sm text-white hover:bg-slate-700 shadow-lg border border-slate-700 flex items-center gap-2"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search</span>
      </Button>
    </div>
  );
};

export default SearchButton;
