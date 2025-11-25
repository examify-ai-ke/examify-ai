'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal } from 'lucide-react';
import { FilterSidebar } from './filter-sidebar';
import type { SearchFilters, FilterOption } from '@/types/search-filters';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  onClearFilters: () => void;
  filters?: {
    institutions: FilterOption[];
    years: FilterOption[];
    courses: FilterOption[];
    modules: FilterOption[];
    programmes?: FilterOption[];
    tags: FilterOption[];
    durationRange: { min: number; max: number };
    dateRange: { min: string; max: string };
  };
  activeFilters?: SearchFilters;
  onInstitutionSearch?: (query: string) => void;
  onCourseSearch?: (query: string) => void;
  onModuleSearch?: (query: string) => void;
  isLoading?: boolean;
}

export function MobileFilterDrawer({
  isOpen,
  onClose,
  onApplyFilters,
  onClearFilters,
  filters,
  activeFilters,
  onInstitutionSearch,
  onCourseSearch,
  onModuleSearch,
  isLoading = false,
}: MobileFilterDrawerProps) {
  // Count active filters safely - handle undefined activeFilters
  const safeActiveFilters = activeFilters || {};
  const activeFilterCount = 
    ((safeActiveFilters as any)?.institutionIds?.length || 0) +
    ((safeActiveFilters as any)?.years?.length || 0) +
    ((safeActiveFilters as any)?.courseIds?.length || 0) +
    ((safeActiveFilters as any)?.tags?.length || 0) +
    (((safeActiveFilters as any)?.durationMin !== undefined || (safeActiveFilters as any)?.durationMax !== undefined) ? 1 : 0) +
    (((safeActiveFilters as any)?.examDateFrom || (safeActiveFilters as any)?.examDateTo) ? 1 : 0);

  const handleApplyFilters = () => {
    onApplyFilters({});
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
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
          {filters && (
            <FilterSidebar
              filters={filters}
              activeFilters={safeActiveFilters}
              onFilterChange={onApplyFilters}
              onClearFilters={onClearFilters}
              onInstitutionSearch={onInstitutionSearch}
              onCourseSearch={onCourseSearch}
              onModuleSearch={onModuleSearch}
              isLoading={isLoading}
              className="border-0 p-0"
            />
          )}
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
