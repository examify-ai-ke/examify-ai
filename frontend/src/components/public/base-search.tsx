/**
 * Base search component for public pages
 * Provides search input with suggestions and autocomplete
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchBarProps, SearchSuggestion } from './types';

export function BaseSearch({
  value = '',
  placeholder = 'Search...',
  onSearch,
  onSuggestionClick,
  showSuggestions = false,
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    if (showSuggestions && newQuery.length > 2) {
      setIsOpen(true);
      // Debounced suggestion fetching would go here
      // For now, just show the dropdown
    } else {
      setIsOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
    setIsOpen(false);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.title);
    setIsOpen(false);
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
  };

  return (
    <div ref={wrapperRef} className={cn('relative w-full', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pl-10 pr-20"
          aria-label="Search"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-7 w-7 p-0"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            className="h-7"
            disabled={!query.trim()}
          >
            Search
          </Button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {isOpen && showSuggestions && (
        <div className="absolute z-50 w-full mt-2 bg-background border rounded-md shadow-lg max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-accent transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm line-clamp-1">
                        {suggestion.title}
                      </div>
                      {suggestion.subtitle && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {suggestion.subtitle}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize shrink-0">
                      {suggestion.type}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query.length > 2 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No suggestions found
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

interface QuickSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function QuickSearch({
  onSearch,
  placeholder = 'Quick search...',
  className,
}: QuickSearchProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="pl-10"
        aria-label="Quick search"
      />
    </form>
  );
}
