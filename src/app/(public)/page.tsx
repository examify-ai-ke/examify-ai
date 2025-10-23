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
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9; // Show 9 questions per page

  // Fetch data with React Query hooks (automatic caching and refetching)
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

  // Show loading state while initial data is being fetched
  if (statsLoading || questionsLoading || institutionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Provide fallback data if queries failed
  const safeStats = stats || { totalPapers: 0, totalInstitutions: 0, totalQuestions: 0 };
  const safeQuestions = questionsData?.data || [];
  const totalQuestions = questionsData?.total || 0;
  const totalPages = Math.ceil(totalQuestions / pageSize);
  const safeInstitutions = institutions || [];

  // console.log('🏠 Landing Page State:', {
  //   questionsCount: safeQuestions.length,
  //   totalQuestions,
  //   totalPages,
  //   currentPage,
  //   pageSize,
  // });

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
      {/* Hero Section with Search and Stats */}
      <HeroSection stats={safeStats} />

      {/* Recent Questions Section with Pagination */}
      <div id="recent-questions">
        <RecentQuestionsSection
          questions={safeQuestions}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalQuestions}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Featured Institutions Section */}
      <FeaturedInstitutionsSection institutions={safeInstitutions} />

      {/* Stats Section with Animated Counters */}
      <StatsSection stats={safeStats} />
    </div>
  );
} 