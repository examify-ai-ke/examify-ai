'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Filter, X, History, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { debounce } from '@/lib/utils';
import { SEARCH_CONFIG } from '@/lib/constants';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string, filters?: SearchFilters) => void;
  suggestions?: string[];
  filters?: SearchFilter[];
  className?: string;
  defaultValue?: string;
  showHistory?: boolean;
  showTrending?: boolean;
}

interface SearchFilter {
  key: string;
  label: string;
  type: 'select' | 'range' | 'checkbox';
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
}

interface SearchFilters {
  [key: string]: string | number | boolean;
}

export function SearchBar({
  placeholder = 'Search...',
  onSearch,
  suggestions = [],
  filters = [],
  className,
  defaultValue = '',
  showHistory = true,
  showTrending = true,
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<SearchFilters>({});
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [trendingSearches] = useState<string[]>([
    'Mathematics 2023',
    'Physics Exam',
    'Chemistry Questions',
    'Biology Papers',
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('search_history');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch {
        setSearchHistory([]);
      }
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useRef(
    debounce((searchQuery: string, searchFilters: SearchFilters) => {
      onSearch(searchQuery, searchFilters);
    }, SEARCH_CONFIG.debounceDelay)
  ).current;

  // Handle search
  const handleSearch = (searchQuery: string, searchFilters: SearchFilters = {}) => {
    if (searchQuery.trim().length >= SEARCH_CONFIG.minQueryLength) {
      // Add to history
      const newHistory = [
        searchQuery,
        ...searchHistory.filter(item => item !== searchQuery)
      ].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('search_history', JSON.stringify(newHistory));

      // Perform search
      debouncedSearch(searchQuery, searchFilters);
    }
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    setQuery(value);
    if (value.trim().length >= SEARCH_CONFIG.minQueryLength) {
      handleSearch(value, selectedFilters);
    }
  };

  // Handle filter change
  const handleFilterChange = (filterKey: string, value: string | number | boolean) => {
    const newFilters = { ...selectedFilters };
    if (value === '' || value === false) {
      delete newFilters[filterKey];
    } else {
      newFilters[filterKey] = value;
    }
    setSelectedFilters(newFilters);
    handleSearch(query, newFilters);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setIsOpen(false);
    handleSearch(suggestion, selectedFilters);
    inputRef.current?.blur();
  };

  // Handle history item click
  const handleHistoryClick = (historyItem: string) => {
    setQuery(historyItem);
    setIsOpen(false);
    handleSearch(historyItem, selectedFilters);
    inputRef.current?.blur();
  };

  // Handle trending search click
  const handleTrendingClick = (trendingItem: string) => {
    setQuery(trendingItem);
    setIsOpen(false);
    handleSearch(trendingItem, selectedFilters);
    inputRef.current?.blur();
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setSelectedFilters({});
    setIsOpen(false);
    onSearch('', {});
    inputRef.current?.focus();
  };

  // Clear history
  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('search_history');
  };

  // Get active filters count
  const activeFiltersCount = Object.keys(selectedFilters).length;

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setIsOpen(false);
              handleSearch(query, selectedFilters);
            }
            if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
          className="pl-10 pr-20"
        />
        
        {/* Clear button */}
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* Filters button */}
        {filters.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0',
                  activeFiltersCount > 0 && 'text-primary'
                )}
              >
                <Filter className="h-4 w-4" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {filters.map((filter) => (
                <div key={filter.key} className="p-2">
                  <label className="text-sm font-medium">{filter.label}</label>
                  {filter.type === 'select' && filter.options && (
                    <select
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      value={selectedFilters[filter.key] as string || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    >
                      <option value="">All</option>
                      {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                  {filter.type === 'range' && (
                    <div className="mt-1 flex space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        min={filter.min}
                        max={filter.max}
                        className="w-20 rounded-md border border-input bg-background px-2 py-1 text-sm"
                        value={selectedFilters[`${filter.key}_min`] as string || ''}
                        onChange={(e) => handleFilterChange(`${filter.key}_min`, e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        min={filter.min}
                        max={filter.max}
                        className="w-20 rounded-md border border-input bg-background px-2 py-1 text-sm"
                        value={selectedFilters[`${filter.key}_max`] as string || ''}
                        onChange={(e) => handleFilterChange(`${filter.key}_max`, e.target.value)}
                      />
                    </div>
                  )}
                  {filter.type === 'checkbox' && (
                    <div className="mt-1">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedFilters[filter.key] as boolean || false}
                          onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">Enable {filter.label}</span>
                      </label>
                    </div>
                  )}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {/* Search suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground mb-2">Suggestions</div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-2 py-1 text-sm hover:bg-accent rounded-sm flex items-center space-x-2"
                >
                  <Search className="h-3 w-3 text-muted-foreground" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {/* Search history */}
          {showHistory && searchHistory.length > 0 && (
            <div className="p-2 border-t">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-muted-foreground">Recent searches</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearHistory}
                  className="h-4 w-4 p-0 text-xs"
                >
                  Clear
                </Button>
              </div>
              {searchHistory.map((historyItem, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryClick(historyItem)}
                  className="w-full text-left px-2 py-1 text-sm hover:bg-accent rounded-sm flex items-center space-x-2"
                >
                  <History className="h-3 w-3 text-muted-foreground" />
                  <span>{historyItem}</span>
                </button>
              ))}
            </div>
          )}

          {/* Trending searches */}
          {showTrending && trendingSearches.length > 0 && (
            <div className="p-2 border-t">
              <div className="text-xs font-medium text-muted-foreground mb-2">Trending</div>
              {trendingSearches.map((trendingItem, index) => (
                <button
                  key={index}
                  onClick={() => handleTrendingClick(trendingItem)}
                  className="w-full text-left px-2 py-1 text-sm hover:bg-accent rounded-sm flex items-center space-x-2"
                >
                  <TrendingUp className="h-3 w-3 text-muted-foreground" />
                  <span>{trendingItem}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 