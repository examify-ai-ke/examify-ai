'use client';

import {
  HeroSection,
  RecentQuestionsSection,
  FeaturedInstitutionsSection,
  StatsSection,
} from '@/components/public';
import {
  usePlatformStats,
  useRecentQuestions,
  useFeaturedInstitutions,
} from '@/hooks/usePublicData';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function HomePage() {
  // Fetch data with React Query hooks (automatic caching and refetching)
  const { data: stats, isLoading: statsLoading } = usePlatformStats();
  const { data: questions, isLoading: questionsLoading } = useRecentQuestions(9);
  const { data: institutions, isLoading: institutionsLoading } = useFeaturedInstitutions(8);

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
  const safeQuestions = questions || [];
  const safeInstitutions = institutions || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Search and Stats */}
      <HeroSection stats={safeStats} />

      {/* Recent Questions Section */}
      <RecentQuestionsSection questions={safeQuestions} />

      {/* Featured Institutions Section */}
      <FeaturedInstitutionsSection institutions={safeInstitutions} />

      {/* Stats Section with Animated Counters */}
      <StatsSection stats={safeStats} />
    </div>
  );
} 