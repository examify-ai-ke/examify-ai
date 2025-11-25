'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { X, ChevronDown, ChevronUp, Search } from 'lucide-react';
import type { SearchFilters, FilterOption } from '@/types/search-filters';

interface FilterSidebarProps {
  filters?: {
    institutions: FilterOption[];
    years: FilterOption[];
    courses: FilterOption[];
    modules: FilterOption[];
    programmes: FilterOption[];
    tags: FilterOption[];
    durationRange: { min: number; max: number };
    dateRange: { min: string; max: string };
  };
  activeFilters: SearchFilters;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
  onClearFilters: () => void;
  onInstitutionSearch?: (query: string) => void;
  onCourseSearch?: (query: string) => void;
  onModuleSearch?: (query: string) => void;
  isLoading?: boolean;
  className?: string;
}

interface FilterSectionProps {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  searchable?: boolean;
  onSearch?: (query: string) => void;
  isSearching?: boolean;
}

function FilterSection({ 
  title, 
  options, 
  selectedValues, 
  onToggle,
  searchable = false,
  onSearch,
  isSearching = false,
}: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Debounce search
  useEffect(() => {
    if (!searchable || !onSearch) return;
    
    const timer = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchable, onSearch]);

  const displayOptions = options.slice(0, isExpanded ? 10 : 5);
  const hasMore = options.length > 5;

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

      {searchable && (
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
          <div 
            key={option.value} 
            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md -mx-2"
            onClick={() => onToggle(option.value)}
          >
            <Checkbox
              id={`${title}-${option.value}`}
              checked={selectedValues.includes(option.value)}
              onCheckedChange={() => onToggle(option.value)}
              className="pointer-events-none"
            />
            <Label
              htmlFor={`${title}-${option.value}`}
              className="text-sm font-normal cursor-pointer flex-1 flex items-center justify-between pointer-events-none"
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
              Show More ({options.length - 5})
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
  onInstitutionSearch,
  onCourseSearch,
  onModuleSearch,
  isLoading = false,
  className = '',
}: FilterSidebarProps) {
  const handleInstitutionToggle = (value: string) => {
    const current = activeFilters.institutionIds || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    
    onFilterChange({
      institutionIds: updated.length > 0 ? updated : undefined,
    });
  };

  const handleYearToggle = (value: string) => {
    const current = activeFilters.years || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    
    onFilterChange({
      years: updated.length > 0 ? updated : undefined,
    });
  };

  const handleCourseToggle = (value: string) => {
    const current = activeFilters.courseIds || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    
    onFilterChange({
      courseIds: updated.length > 0 ? updated : undefined,
    });
  };

  const handleModuleToggle = (value: string) => {
    const current = activeFilters.moduleIds || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    
    onFilterChange({
      moduleIds: updated.length > 0 ? updated : undefined,
    });
  };

  const handleProgrammeToggle = (value: string) => {
    const current = activeFilters.programmeIds || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    
    onFilterChange({
      programmeIds: updated.length > 0 ? updated : undefined,
    });
  };

  const handleTagToggle = (value: string) => {
    const current = activeFilters.tags || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    
    onFilterChange({
      tags: updated.length > 0 ? updated : undefined,
    });
  };

  const handleDurationChange = (min?: number, max?: number) => {
    onFilterChange({
      durationMin: min,
      durationMax: max,
    });
  };

  const handleDateRangeChange = (from?: string, to?: string) => {
    onFilterChange({
      examDateFrom: from,
      examDateTo: to,
    });
  };

  // Count active filters
  const activeFilterCount = 
    (activeFilters.institutionIds?.length || 0) +
    (activeFilters.years?.length || 0) +
    (activeFilters.courseIds?.length || 0) +
    (activeFilters.moduleIds?.length || 0) +
    (activeFilters.programmeIds?.length || 0) +
    (activeFilters.tags?.length || 0) +
    (activeFilters.durationMin !== undefined || activeFilters.durationMax !== undefined ? 1 : 0) +
    (activeFilters.examDateFrom || activeFilters.examDateTo ? 1 : 0);

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
        {filters?.institutions && filters.institutions.length >= 0 && (
          <>
            <FilterSection
              title="Institution"
              options={filters.institutions}
              selectedValues={activeFilters.institutionIds || []}
              onToggle={handleInstitutionToggle}
              searchable={true}
              onSearch={onInstitutionSearch}
              isSearching={isLoading}
            />
            <Separator />
          </>
        )}

        {/* Years Filter */}
        {filters?.years && filters.years.length > 0 && (
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
        {filters?.courses && filters.courses.length >= 0 && (
          <>
            <FilterSection
              title="Course"
              options={filters.courses}
              selectedValues={activeFilters.courseIds || []}
              onToggle={handleCourseToggle}
              searchable={true}
              onSearch={onCourseSearch}
              isSearching={isLoading}
            />
            <Separator />
          </>
        )}

        {/* Modules Filter */}
        {filters?.modules && filters.modules.length >= 0 && (
          <>
            <FilterSection
              title="Module"
              options={filters.modules}
              selectedValues={activeFilters.moduleIds || []}
              onToggle={handleModuleToggle}
              searchable={true}
              onSearch={onModuleSearch}
              isSearching={isLoading}
            />
            <Separator />
          </>
        )}

        {/* Programmes Filter */}
        {filters?.programmes && filters.programmes.length > 0 && (
          <>
            <FilterSection
              title="Programme"
              options={filters.programmes}
              selectedValues={activeFilters.programmeIds || []}
              onToggle={handleProgrammeToggle}
              searchable={filters.programmes.length > 5}
            />
            <Separator />
          </>
        )}

        {/* Tags Filter */}
        {filters?.tags && filters.tags.length > 0 && (
          <>
            <FilterSection
              title="Tags"
              options={filters.tags}
              selectedValues={activeFilters.tags || []}
              onToggle={handleTagToggle}
              searchable={filters.tags.length > 5}
            />
            <Separator />
          </>
        )}

        {/* Duration Range Filter */}
        {filters?.durationRange && (
          <>
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-gray-900">Duration (minutes)</h3>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="Min"
                  min={filters.durationRange.min}
                  max={filters.durationRange.max}
                  value={activeFilters.durationMin || ''}
                  onChange={(e) => handleDurationChange(
                    e.target.value ? parseInt(e.target.value) : undefined,
                    activeFilters.durationMax
                  )}
                  className="w-full"
                  disabled={isLoading}
                />
                <span className="text-gray-400">—</span>
                <Input
                  type="number"
                  placeholder="Max"
                  min={filters.durationRange.min}
                  max={filters.durationRange.max}
                  value={activeFilters.durationMax || ''}
                  onChange={(e) => handleDurationChange(
                    activeFilters.durationMin,
                    e.target.value ? parseInt(e.target.value) : undefined
                  )}
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Date Range Filter */}
        {filters?.dateRange && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-900">Exam Date</h3>
            <div className="space-y-2">
              <Input
                type="date"
                placeholder="From"
                min={filters.dateRange.min}
                max={filters.dateRange.max}
                value={activeFilters.examDateFrom || ''}
                onChange={(e) => handleDateRangeChange(
                  e.target.value || undefined,
                  activeFilters.examDateTo
                )}
                className="w-full"
                disabled={isLoading}
              />
              <Input
                type="date"
                placeholder="To"
                min={filters.dateRange.min}
                max={filters.dateRange.max}
                value={activeFilters.examDateTo || ''}
                onChange={(e) => handleDateRangeChange(
                  activeFilters.examDateFrom,
                  e.target.value || undefined
                )}
                className="w-full"
                disabled={isLoading}
              />
            </div>
          </div>
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
