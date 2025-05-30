
import React from 'react';
import { Search, Radar } from 'lucide-react';
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
        className="btn-aviation glow-effect font-aviation tracking-wider"
      >
        <Search className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">SEARCH</span>
      </Button>
    </div>
  );
};

export default SearchButton;
