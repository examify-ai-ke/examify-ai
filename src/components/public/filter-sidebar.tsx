'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import type { ActiveFilters, FilterOption } from './types';

interface FilterSidebarProps {
  filters: {
    institutions: FilterOption[];
    years: FilterOption[];
    courses: FilterOption[];
  };
  activeFilters: ActiveFilters;
  onFilterChange: (filters: ActiveFilters) => void;
  onClearFilters: () => void;
  className?: string;
}

interface FilterSectionProps {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  searchable?: boolean;
}

function FilterSection({ 
  title, 
  options, 
  selectedValues, 
  onToggle,
  searchable = false,
}: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const displayOptions = filteredOptions.slice(0, isExpanded ? 10 : 5);
  const hasMore = filteredOptions.length > 5;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
        {selectedValues.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {selectedValues.length}
          </Badge>
        )}
      </div>

      {searchable && options.length > 5 && (
        <input
          type="text"
          placeholder={`Search ${title.toLowerCase()}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      )}

      <div className="space-y-2">
        {displayOptions.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={`${title}-${option.value}`}
              checked={selectedValues.includes(option.value)}
              onCheckedChange={() => onToggle(option.value)}
            />
            <Label
              htmlFor={`${title}-${option.value}`}
              className="text-sm font-normal cursor-pointer flex-1 flex items-center justify-between"
            >
              <span>{option.label}</span>
              {option.count !== undefined && (
                <span className="text-xs text-gray-500">({option.count})</span>
              )}
            </Label>
          </div>
        ))}
      </div>

      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-xs text-teal-600 hover:text-teal-700"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Show More ({filteredOptions.length - 5})
            </>
          )}
        </Button>
      )}
    </div>
  );
}

export function FilterSidebar({
  filters,
  activeFilters,
  onFilterChange,
  onClearFilters,
  className = '',
}: FilterSidebarProps) {
  const handleInstitutionToggle = (value: string) => {
    const current = activeFilters.institutions || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    
    onFilterChange({
      ...activeFilters,
      institutions: updated.length > 0 ? updated : undefined,
    });
  };

  const handleYearToggle = (value: string) => {
    const current = activeFilters.years || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    
    onFilterChange({
      ...activeFilters,
      years: updated.length > 0 ? updated : undefined,
    });
  };

  const handleCourseToggle = (value: string) => {
    const current = activeFilters.courses || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    
    onFilterChange({
      ...activeFilters,
      courses: updated.length > 0 ? updated : undefined,
    });
  };

  // Count active filters
  const activeFilterCount = 
    (activeFilters.institutions?.length || 0) +
    (activeFilters.years?.length || 0) +
    (activeFilters.courses?.length || 0);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {activeFilterCount > 0 && (
            <Badge className="bg-teal-500">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-gray-600 hover:text-gray-900"
          >
            <X className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Sections */}
      <div className="space-y-6">
        {/* Institutions Filter */}
        {filters.institutions.length > 0 && (
          <>
            <FilterSection
              title="Institution"
              options={filters.institutions}
              selectedValues={activeFilters.institutions || []}
              onToggle={handleInstitutionToggle}
              searchable={filters.institutions.length > 5}
            />
            <Separator />
          </>
        )}

        {/* Years Filter */}
        {filters.years.length > 0 && (
          <>
            <FilterSection
              title="Year"
              options={filters.years}
              selectedValues={activeFilters.years || []}
              onToggle={handleYearToggle}
            />
            <Separator />
          </>
        )}

        {/* Courses Filter */}
        {filters.courses.length > 0 && (
          <>
            <FilterSection
              title="Course"
              options={filters.courses}
              selectedValues={activeFilters.courses || []}
              onToggle={handleCourseToggle}
              searchable={filters.courses.length > 5}
            />
          </>
        )}
      </div>

      {/* Apply Button (Mobile) */}
      {activeFilterCount > 0 && (
        <div className="mt-6 lg:hidden">
          <Button className="w-full bg-teal-500 hover:bg-teal-600">
            Apply Filters ({activeFilterCount})
          </Button>
        </div>
      )}
    </div>
  );
}
