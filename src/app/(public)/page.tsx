'use client';

import { useState } from 'react';
import {
  HeroSection,
  RecentQuestionsSection,
  FeaturedInstitutionsSection,
  StatsSection,
} from '@/components/public';
import {
  usePlatformStats,
  useFeaturedInstitutions,
} from '@/hooks/usePublicData';
import { useQuery } from '@tanstack/react-query';
import { publicAPI } from '@/lib/api-public';
import { QuestionsListSkeleton, StatsCardSkeleton } from '@/components/ui/skeleton-loaders';

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9; // Show 9 questions per page

  // Fetch data with React Query hooks (runs in parallel, each component loads independently)
  const { data: stats, isLoading: statsLoading } = usePlatformStats();
  const { data: institutions, isLoading: institutionsLoading } = useFeaturedInstitutions(8);

  // Fetch questions with pagination
  const { data: questionsData, isLoading: questionsLoading } = useQuery({
    queryKey: ['public', 'questions', 'paginated', currentPage, pageSize],
    queryFn: async () => {
      console.log('🔍 Fetching paginated questions - Page:', currentPage);
      const result = await publicAPI.questions.getRecent(pageSize, (currentPage - 1) * pageSize);
      console.log('📦 Questions Response:', {
        dataCount: result.data?.length,
        total: result.total,
        page: currentPage,
      });
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const handlePageChange = (page: number) => {
    console.log('📄 Page change requested:', page);
    setCurrentPage(page);
    // Scroll to questions section
    const questionsSection = document.querySelector('#recent-questions');
    if (questionsSection) {
      questionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Search and Stats - Shows skeleton while loading */}
      {statsLoading ? (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <div className="h-16 bg-gray-200 rounded animate-pulse mb-6 mx-auto w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse mx-auto w-1/2"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </div>
          </div>
        </div>
      ) : (
        <HeroSection stats={stats || { 
          totalPapers: 0, 
          totalInstitutions: 0, 
          totalQuestions: 0,
          totalCourses: 0,
          totalDepartments: 0,
          totalModules: 0,
          totalFaculties: 0,
          totalUsers: 0,
          totalAnswers: 0,
          totalCampuses: 0,
        }} />
      )}

      {/* Recent Questions Section with Pagination - Shows skeleton while loading */}
      <div id="recent-questions">
        {questionsLoading ? (
          <section className="bg-background py-12">
            <div className="w-full max-w-7xl mx-auto px-4">
              <div className="text-center mb-12">
                <div className="h-12 bg-gray-200 rounded animate-pulse mb-4 mx-auto w-1/3"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse mx-auto w-1/2"></div>
              </div>
              <QuestionsListSkeleton count={3} />
            </div>
          </section>
        ) : (
          <RecentQuestionsSection
            questions={questionsData?.data || []}
            currentPage={currentPage}
            totalPages={Math.ceil((questionsData?.total || 0) / pageSize)}
            totalItems={questionsData?.total || 0}
            onPageChange={handlePageChange}
            showHeading={true}
          />
        )}
      </div>

      {/* Featured Institutions Section - Shows skeleton while loading */}
      {institutionsLoading ? (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="h-12 bg-gray-200 rounded animate-pulse mb-4 mx-auto w-1/3"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse mx-auto w-1/2"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <FeaturedInstitutionsSection institutions={institutions || []} />
      )}

      {/* Stats Section with Animated Counters - Shows skeleton while loading */}
      {statsLoading ? (
        <section className="py-16 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-6">
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2 mx-auto w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-1/2"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
              </div>
            </div>
          </div>
        </section>
      ) : (
        <StatsSection stats={stats || { 
          totalPapers: 0, 
          totalInstitutions: 0, 
          totalQuestions: 0,
          totalCourses: 0,
          totalDepartments: 0,
          totalModules: 0,
          totalFaculties: 0,
          totalUsers: 0,
          totalAnswers: 0,
          totalCampuses: 0,
        }} />
      )}
    </div>
  );
} 