'use client';

import { useState, useEffect, useCallback } from 'react';
import { useListQuestions } from '@/hooks/usePublicData';
import { RecentQuestionsSection } from '@/components/public/recent-questions-section';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/ui/search-bar';

const ITEMS_PER_PAGE = 20;

export default function PublicQuestionsContent() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Debounce search query to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Prepare search filters for the API
  const searchFilters = {
    search: debouncedSearchQuery || undefined,
    skip: (page - 1) * ITEMS_PER_PAGE,
    limit: ITEMS_PER_PAGE,
  };

  // Use the useListQuestions hook with search filters and pagination
  const {
    data: questionsData,
    isLoading,
    isError,
    isFetching,
    refetch
  } = useListQuestions(searchFilters);

  // Extract questions, total, and pagination from the data
  const questions = questionsData?.data || [];
  const totalItems = questionsData?.total || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page when searching
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold mb-6">Public Questions</h1>
        <p>Loading questions...</p>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold mb-6">Public Questions</h1>
        <p className="text-red-500">Error loading questions.</p>
        <Button
          onClick={() => refetch()}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Empty state
  if (questions.length === 0) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold mb-6">Public Questions</h1>
        {searchQuery ? (
          <>
            <p className="text-gray-600 mb-4">No questions found for "{searchQuery}"</p>
            <Button
              variant="outline"
              onClick={() => handleSearch('')}
            >
              Clear Search
            </Button>
          </>
        ) : (
          <p className="text-gray-600">No questions available at the moment.</p>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Public Questions</h1>
      
      {/* Search/Filter Bar Area */}
      <div className="mb-6 flex gap-4">
        <SearchBar
          placeholder="Search questions..."
          onSearch={handleSearch}
          defaultValue={searchQuery}
        />
        <Button variant="outline">Filter</Button>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-0">
        {/* Using RecentQuestionsSection for list display style */}
        <RecentQuestionsSection
          questions={questions}
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          isLoading={isFetching}
        />
      </div>
      
    </div>
  );
}
