/**
 * Base filter component for public pages
 * Provides reusable filter UI patterns
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FilterOption } from './types';

interface BaseFilterProps {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  showCount?: boolean;
  maxVisible?: number;
  className?: string;
}

export function BaseFilter({
  title,
  options,
  selectedValues,
  onSelectionChange,
  showCount = true,
  maxVisible = 5,
  className,
}: BaseFilterProps) {
  const [showAll, setShowAll] = useState(false);

  const visibleOptions = showAll ? options : options.slice(0, maxVisible);
  const hasMore = options.length > maxVisible;

  const handleToggle = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onSelectionChange(newValues);
  };

  const handleClear = () => {
    onSelectionChange([]);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{title}</h3>
        {selectedValues.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {visibleOptions.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          
          return (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`${title}-${option.value}`}
                checked={isSelected}
                onCheckedChange={() => handleToggle(option.value)}
              />
              <Label
                htmlFor={`${title}-${option.value}`}
                className="flex-1 text-sm font-normal cursor-pointer flex items-center justify-between"
              >
                <span className="line-clamp-1">{option.label}</span>
                {showCount && option.count !== undefined && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {option.count}
                  </Badge>
                )}
              </Label>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <Button
          variant="link"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="h-auto p-0 text-xs"
        >
          {showAll ? 'Show less' : `Show ${options.length - maxVisible} more`}
        </Button>
      )}
    </div>
  );
}

interface ActiveFiltersDisplayProps {
  filters: { label: string; value: string; category: string }[];
  onRemove: (category: string, value: string) => void;
  onClearAll: () => void;
  className?: string;
}

export function ActiveFiltersDisplay({
  filters,
  onRemove,
  onClearAll,
  className,
}: ActiveFiltersDisplayProps) {
  if (filters.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-2 items-center', className)}>
      <span className="text-sm text-muted-foreground">Active filters:</span>
      {filters.map((filter, index) => (
        <Badge
          key={`${filter.category}-${filter.value}-${index}`}
          variant="secondary"
          className="gap-1"
        >
          {filter.label}
          <button
            onClick={() => onRemove(filter.category, filter.value)}
            className="ml-1 hover:text-destructive"
            aria-label={`Remove ${filter.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-auto py-1 px-2 text-xs"
      >
        Clear all
      </Button>
    </div>
  );
}
