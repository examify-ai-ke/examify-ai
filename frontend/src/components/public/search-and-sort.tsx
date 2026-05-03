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
  pageSize?: number;
  totalResults: number;
  isLoading?: boolean;
  placeholder?: string;
  resultsLabel?: string; // e.g., "question", "exam paper", "institution"
  onSearchChange: (query: string) => void;
  onSortChange: (sortBy: SearchFilters['sortBy'], sortOrder: SearchFilters['sortOrder']) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onPageSizeChange?: (pageSize: number) => void;
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
  pageSize = 20,
  totalResults,
  isLoading = false,
  placeholder = 'Search for questions...',
  resultsLabel = 'exam paper', // Default to "exam paper" for backward compatibility
  onSearchChange,
  onSortChange,
  onViewModeChange,
  onPageSizeChange,
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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-teal-500" />
          <Input
            type="text"
            placeholder={placeholder}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-12 pr-20 h-12 text-base border-2 border-teal-400 focus:border-teal-500 focus:ring-teal-500"
            disabled={isLoading}
            aria-label={placeholder}
          />
          {/* Loading Indicator */}
          {(isSearching || isLoading) && (
            <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
          )}
          {/* Clear Button */}
          {localSearch && !isLoading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
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
              {totalResults === 1 ? resultsLabel : `${resultsLabel}s`} found
            </>
          )}
        </div>

        {/* Sort and View Controls */}
        <div className="flex items-center gap-3">
          {/* Page Size Selector */}
          {onPageSizeChange && (
            <Select 
              value={pageSize.toString()} 
              onValueChange={(value) => onPageSizeChange(parseInt(value))}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
          )}

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
