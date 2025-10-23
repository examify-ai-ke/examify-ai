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
import { Search, Grid, List, SlidersHorizontal, X, Loader2, ArrowUpDown } from 'lucide-react';
import type { SearchFilters } from '@/types/search-filters';

type ViewMode = 'grid' | 'list';

interface SearchAndSortProps {
  searchQuery?: string;
  sortBy?: SearchFilters['sortBy'];
  sortOrder?: SearchFilters['sortOrder'];
  viewMode?: ViewMode;
  totalResults: number;
  isLoading?: boolean;
  onSearchChange: (query: string) => void;
  onSortChange: (sortBy: SearchFilters['sortBy'], sortOrder: SearchFilters['sortOrder']) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onFilterClick?: () => void;
  showFilterButton?: boolean;
  className?: string;
}

const sortOptions: { value: SearchFilters['sortBy']; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'date', label: 'Date' },
  { value: 'duration', label: 'Duration' },
  { value: 'title', label: 'Title' },
];

export function SearchAndSort({
  searchQuery = '',
  sortBy = 'date',
  sortOrder = 'desc',
  viewMode = 'list',
  totalResults,
  isLoading = false,
  onSearchChange,
  onSortChange,
  onViewModeChange,
  onFilterClick,
  showFilterButton = false,
  className = '',
}: SearchAndSortProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search input (300ms as per requirements)
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearchChange(localSearch);
      }
      setIsSearching(false);
    }, 300);

    return () => {
      clearTimeout(timer);
      setIsSearching(false);
    };
  }, [localSearch, searchQuery, onSearchChange]);

  // Sync with external search query changes
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleClearSearch = () => {
    setLocalSearch('');
    onSearchChange('');
  };

  const handleSortOrderToggle = () => {
    onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
  };

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
            className="pl-10 pr-20"
            disabled={isLoading}
            aria-label="Search exam papers"
          />
          {/* Loading Indicator */}
          {(isSearching || isLoading) && (
            <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
          )}
          {/* Clear Button */}
          {localSearch && !isLoading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Sort, View Mode, and Results Count */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Results Count */}
        <div className="text-sm text-gray-600">
          {totalResults === 0 ? (
            <span className="text-gray-500">No results found</span>
          ) : (
            <>
              <span className="font-medium text-gray-900">
                {totalResults.toLocaleString()}
              </span>{' '}
              {totalResults === 1 ? 'exam paper' : 'exam papers'} found
            </>
          )}
        </div>

        {/* Sort and View Controls */}
        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <Select 
            value={sortBy} 
            onValueChange={(value) => onSortChange(value as SearchFilters['sortBy'], sortOrder)}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value || 'date'}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Order Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSortOrderToggle}
            disabled={isLoading}
            className="h-10 px-3"
            aria-label={`Sort order: ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            {sortOrder === 'asc' ? 'Asc' : 'Desc'}
          </Button>

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
