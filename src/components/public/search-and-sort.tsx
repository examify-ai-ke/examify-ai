'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Grid, List, SlidersHorizontal } from 'lucide-react';
import type { SortOption, ViewMode } from './types';

interface SearchAndSortProps {
  searchQuery?: string;
  sortBy?: SortOption;
  viewMode?: ViewMode;
  totalResults: number;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: SortOption) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onFilterClick?: () => void;
  showFilterButton?: boolean;
  className?: string;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'alphabetical', label: 'A-Z' },
  { value: 'most-questions', label: 'Most Questions' },
];

export function SearchAndSort({
  searchQuery = '',
  sortBy = 'newest',
  viewMode = 'grid',
  totalResults,
  onSearchChange,
  onSortChange,
  onViewModeChange,
  onFilterClick,
  showFilterButton = false,
  className = '',
}: SearchAndSortProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearchChange(localSearch);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, onSearchChange]);

  // Sync with external search query changes
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="flex gap-3">
        {/* Mobile Filter Button */}
        {showFilterButton && (
          <Button
            variant="outline"
            size="icon"
            onClick={onFilterClick}
            className="lg:hidden shrink-0"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        )}

        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search exam papers..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Sort, View Mode, and Results Count */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Results Count */}
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">
            {totalResults.toLocaleString()}
          </span>{' '}
          {totalResults === 1 ? 'exam paper' : 'exam papers'} found
        </div>

        {/* Sort and View Controls */}
        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center gap-1 border border-gray-300 rounded-md p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className={`h-8 w-8 p-0 ${
                viewMode === 'grid' 
                  ? 'bg-teal-500 hover:bg-teal-600' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className={`h-8 w-8 p-0 ${
                viewMode === 'list' 
                  ? 'bg-teal-500 hover:bg-teal-600' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
