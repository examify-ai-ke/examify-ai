'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { InstitutionCard } from '@/components/public';
import { InstitutionListItem } from '@/components/public/institution-list-item';
import { BaseSearch } from '@/components/public/base-search';
import { Pagination } from '@/components/public/pagination';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InstitutionsGridSkeleton, InstitutionsListSkeleton } from '@/components/ui/skeleton-loaders';
import { publicAPI } from '@/lib/api-public';
import type { InstitutionRead } from '@/components/public/types';
import { Building2, GraduationCap, School, List, Grid, Search, X } from 'lucide-react';
import { useLoginGate } from '@/hooks/useLoginGate';
import { LoginGateDialog } from '@/components/ui/login-gate-dialog';

type InstitutionType = 'all' | 'Public' | 'Private' | 'Other';
type InstitutionCategory = 'all' | 'University' | 'College' | 'TVET' | 'TVC' | 'TTI' | 'Other';
type SortOption = 'alphabetical' | 'most-papers';
type ViewMode = 'list' | 'grid';

export default function InstitutionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
  const [institutionType, setInstitutionType] = useState<InstitutionType>(
    (searchParams.get('type') as InstitutionType) || 'all'
  );
  const [institutionCategory, setInstitutionCategory] = useState<InstitutionCategory>(
    (searchParams.get('category') as InstitutionCategory) || 'all'
  );
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || 'alphabetical'
  );
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [pageSize, setPageSize] = useState(Number(searchParams.get('pageSize')) || 12);
  const [viewMode, setViewMode] = useState<ViewMode>(
    (searchParams.get('view') as ViewMode) || 'list' // Default to list view
  );

  // Login gate for non-authenticated users
  const { showLoginPrompt, closePrompt } = useLoginGate({ 
    currentPage, 
    enabled: true 
  });

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(inputValue);
      setCurrentPage(1);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Fetch institutions
  const { data, isLoading } = useQuery({
    queryKey: ['institutions', searchQuery, institutionType, institutionCategory, sortBy, currentPage, pageSize],
    queryFn: async () => {
      // Call list endpoint with all filters - backend handles filtering
      const result = await publicAPI.institutions.list({
        skip: (currentPage - 1) * pageSize,
        limit: pageSize,
        search: searchQuery || undefined,
        // Convert institution type to uppercase for API (enum values are "Public", "Private", "Other")
        institution_type: institutionType !== 'all' ? (institutionType as any) : undefined,
        // Pass category filter to backend
        category: institutionCategory !== 'all' ? institutionCategory : undefined,
      });
      
      if (result.error) {
        throw new Error('Failed to fetch institutions');
      }
      
      // Sort on client side if needed
      let institutions = result.data || [];
      console.log(institutions);
      if (sortBy === 'most-papers') {
        institutions = [...institutions].sort((a: any, b: any) => 
          (b.exams_count || 0) - (a.exams_count || 0)
        );
      } else if (sortBy === 'alphabetical') {
        institutions = [...institutions].sort((a, b) => 
          a.name.localeCompare(b.name)
        );
      }
      
      return {
        data: institutions,
        total: result.total,
        pagination: result.pagination,
      };
    },
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('q', searchQuery);
    if (institutionType !== 'all') params.set('type', institutionType);
    if (institutionCategory !== 'all') params.set('category', institutionCategory);
    if (sortBy !== 'alphabetical') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (pageSize !== 12) params.set('pageSize', pageSize.toString());
    if (viewMode !== 'list') params.set('view', viewMode);

    const newUrl = params.toString() ? `/institutions?${params.toString()}` : '/institutions';
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, institutionType, institutionCategory, sortBy, currentPage, pageSize, viewMode, router]);

  const handleSearchChange = (query: string) => {
    setInputValue(query);
  };

  const handleClearSearch = () => {
    setInputValue('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleTypeFilter = (type: InstitutionType) => {
    setInstitutionType(type);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (category: InstitutionCategory) => {
    setInstitutionCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const institutions = data?.data || [];
  const totalResults = data?.total || 0;
  const totalPages = Math.ceil(totalResults / pageSize);

  const institutionTypes: { value: InstitutionType; label: string; icon: any }[] = [
    { value: 'all', label: 'All Types', icon: Building2 },
    { value: 'Public', label: 'Public', icon: Building2 },
    { value: 'Private', label: 'Private', icon: GraduationCap },
    { value: 'Other', label: 'Other', icon: School },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Login Gate Dialog */}
      <LoginGateDialog
        isOpen={showLoginPrompt}
        onClose={closePrompt}
        redirectUrl="/institutions"
        message="Please sign in to continue exploring more institutions."
      />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Browse Institutions
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400">
            Explore exam papers from top educational institutions
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search institutions by name..."
              className="pl-10 pr-10"
              aria-label="Search institutions"
            />
            {inputValue && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Institution Type Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">
              Institution Type
            </label>
            <div className="flex flex-wrap gap-2">
              {institutionTypes.map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant={institutionType === value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTypeFilter(value)}
                  className={institutionType === value ? 'bg-teal-500 hover:bg-teal-600' : ''}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Results Count, Page Size, Category, Sort and View Mode Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-sm text-gray-600 dark:text-slate-400">
              {isLoading ? (
                'Loading...'
              ) : (
                `${totalResults.toLocaleString()} ${totalResults === 1 ? 'institution' : 'institutions'} found`
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {/* Page Size Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-slate-400">Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="12">12</option>
                  <option value="24">24</option>
                  <option value="48">48</option>
                  <option value="96">96</option>
                </select>
              </div>

              {/* Category Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-slate-400">Category:</span>
                <select
                  value={institutionCategory}
                  onChange={(e) => handleCategoryFilter(e.target.value as InstitutionCategory)}
                  className="text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Categories</option>
                  <option value="University">Universities</option>
                  <option value="College">Colleges</option>
                  <option value="TVET">TVET</option>
                  <option value="TVC">TVC</option>
                  <option value="TTI">TTI</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-slate-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as SortOption)}
                  className="text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="alphabetical">Alphabetical</option>
                  <option value="most-papers">Most Papers</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 border border-gray-300 dark:border-slate-600 rounded-md p-1">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('list')}
                  className={viewMode === 'list' ? 'bg-teal-500 hover:bg-teal-600' : ''}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('grid')}
                  className={viewMode === 'grid' ? 'bg-teal-500 hover:bg-teal-600' : ''}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State - Show skeleton based on view mode */}
        {isLoading && (
          <>
            {viewMode === 'grid' ? (
              <InstitutionsGridSkeleton count={pageSize} />
            ) : (
              <InstitutionsListSkeleton count={Math.min(pageSize, 6)} />
            )}
          </>
        )}

        {/* No Results */}
        {!isLoading && institutions.length === 0 && (
          <div className="text-center py-20">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600 dark:text-slate-400 mb-4">
              No institutions found matching your criteria
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setInstitutionType('all');
                setInstitutionCategory('all');
                setCurrentPage(1);
              }}
              variant="outline"
            >
              Clear filters
            </Button>
          </div>
        )}
        {/* Results - Grid or List View */}
        {!isLoading && institutions.length > 0 && (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {institutions.map((institution: InstitutionRead) => (
                  <InstitutionCard
                    key={institution.id}
                    institution={institution}
                  />
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {institutions.map((institution: InstitutionRead) => (
                  <InstitutionListItem
                    key={institution.id}
                    institution={institution}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={totalResults}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
