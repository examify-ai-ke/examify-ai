'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal } from 'lucide-react';
import { FilterSidebar } from './filter-sidebar';
import type { SearchFilters, FilterOption } from '@/types/search-filters';

interface MobileFilterDrawerProps {
  filters?: {
    institutions: FilterOption[];
    years: FilterOption[];
    courses: FilterOption[];
    tags: FilterOption[];
    durationRange: { min: number; max: number };
    dateRange: { min: string; max: string };
  };
  activeFilters: SearchFilters;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

export function MobileFilterDrawer({
  filters,
  activeFilters,
  onFilterChange,
  onClearFilters,
  isLoading = false,
}: MobileFilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Count active filters
  const activeFilterCount = 
    (activeFilters.institutionIds?.length || 0) +
    (activeFilters.years?.length || 0) +
    (activeFilters.courseIds?.length || 0) +
    (activeFilters.tags?.length || 0) +
    (activeFilters.durationMin !== undefined || activeFilters.durationMax !== undefined ? 1 : 0) +
    (activeFilters.examDateFrom || activeFilters.examDateTo ? 1 : 0);

  const handleApplyFilters = () => {
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="lg:hidden relative"
          aria-label="Open filters"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge 
              className="ml-2 bg-teal-500 text-white"
              aria-label={`${activeFilterCount} active filters`}
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:w-96 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <FilterSidebar
            filters={filters}
            activeFilters={activeFilters}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
            isLoading={isLoading}
            className="border-0 p-0"
          />
          <div className="mt-6 sticky bottom-0 bg-white pt-4 border-t">
            <Button 
              onClick={handleApplyFilters}
              className="w-full bg-teal-500 hover:bg-teal-600"
            >
              Apply Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
