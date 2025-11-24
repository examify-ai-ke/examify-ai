'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { InstitutionCard } from '@/components/public';
import { InstitutionListItem } from '@/components/public/institution-list-item';
import { BaseSearch } from '@/components/public/base-search';
import { Pagination } from '@/components/public/pagination';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { publicAPI } from '@/lib/api-public';
import type { InstitutionRead } from '@/components/public/types';
import { Building2, GraduationCap, School, List, Grid } from 'lucide-react';

type InstitutionType = 'all' | 'Public' | 'Private' | 'Other';
type InstitutionCategory = 'all' | 'University' | 'College' | 'TVET' | 'TVC' | 'TTI' | 'Other';
type SortOption = 'alphabetical' | 'most-papers';
type ViewMode = 'list' | 'grid';

export default function InstitutionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
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
  const [pageSize] = useState(12); // Smaller page size for list view
  const [viewMode, setViewMode] = useState<ViewMode>(
    (searchParams.get('view') as ViewMode) || 'list' // Default to list view
  );

  // Fetch institutions
  const { data, isLoading } = useQuery({
    queryKey: ['institutions', searchQuery, institutionType, institutionCategory, sortBy, currentPage, pageSize],
    queryFn: async () => {
      // Use search if we have filters, otherwise use list
      const result = searchQuery || institutionType !== 'all'
        ? await publicAPI.institutions.search({
            skip: (currentPage - 1) * pageSize,
            limit: pageSize,
            search: searchQuery || undefined,
            institution_type: institutionType !== 'all' ? institutionType as any : undefined,
          })
        : await publicAPI.institutions.list({
            skip: (currentPage - 1) * pageSize,
            limit: pageSize,
          });
      
      if (result.error) {
        throw new Error('Failed to fetch institutions');
      }
      
      // Filter by category on client side (until backend adds category support)
      // Note: Client-side filtering only filters the current page, so pagination
      // will show all pages but filtered results only appear on current page
      let institutions = result.data || [];
      
      if (institutionCategory !== 'all') {
        institutions = institutions.filter((inst: any) => inst.category === institutionCategory);
      }
      
      // Sort on client side if needed
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
        total: result.total, // Keep original total for pagination
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
    if (viewMode !== 'list') params.set('view', viewMode);

    const newUrl = params.toString() ? `/institutions?${params.toString()}` : '/institutions';
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, institutionType, institutionCategory, sortBy, currentPage, viewMode, router]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Browse Institutions
          </h1>
          <p className="text-lg text-gray-600">
            Explore exam papers from top educational institutions
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <BaseSearch
            value={searchQuery}
            placeholder="Search institutions by name..."
            onSearch={handleSearchChange}
            className="max-w-2xl"
          />
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Institution Type Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
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

          {/* Results Count, Category, Sort and View Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {isLoading ? (
                'Loading...'
              ) : (
                `${totalResults.toLocaleString()} ${totalResults === 1 ? 'institution' : 'institutions'} found`
              )}
            </div>
            <div className="flex items-center gap-4">
              {/* Category Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Category:</span>
                <select
                  value={institutionCategory}
                  onChange={(e) => handleCategoryFilter(e.target.value as InstitutionCategory)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as SortOption)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="alphabetical">Alphabetical</option>
                  <option value="most-papers">Most Papers</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 border border-gray-300 rounded-md p-1">
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        )}

        {/* No Results */}
        {!isLoading && institutions.length === 0 && (
          <div className="text-center py-20">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600 mb-4">
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
                  onPageSizeChange={() => {}} // Fixed page size
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
