'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Search, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PlatformStats } from './types';

interface QuestionsHeroSectionProps {
  stats: PlatformStats;
  onSearchClick?: (query: string) => void;
}

export function QuestionsHeroSection({ stats, onSearchClick }: QuestionsHeroSectionProps) {
  const router = useRouter();

  const handleBrowseAllClick = () => {
    router.push('/exampapers');
  };

  return (
    <section className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full opacity-20 blur-3xl -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full opacity-20 blur-3xl -ml-48 -mb-48" />
      
      <div className="container mx-auto px-4 py-16 md:py-10 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Main Headline */}
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-slate-900 dark:text-white">
              Master Your Exams with
              <br />
              <span className="text-teal-600 dark:text-teal-400">
                {stats.totalQuestions.toLocaleString()}+ Real Exam Questions
              </span>
            </h1>

            <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
              Access comprehensive practice questions from {stats.totalInstitutions.toLocaleString()}+ institutions. 
              Study smarter with detailed solutions and expert explanations.
            </p>
          </div>

          {/* Stats Cards */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Questions</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {stats.totalQuestions.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">From Institutions</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.totalInstitutions.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-purple-600">🏫</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Exam Papers</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {stats.totalPapers.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-indigo-600">📄</span>
                </div>
              </div>
            </div>
          </div> */}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleBrowseAllClick}
              size="lg"
              className="h-12 px-8 text-base bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-md transition-all active:scale-95"
            >
              Browse All Papers
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-8 text-base rounded-lg font-semibold border-2 border-gray-300 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 dark:text-slate-300"
            >
              <Search className="mr-2 h-5 w-5" />
              Advanced Search
            </Button>
          </div>

          {/* Info Cards */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/30 rounded-lg p-6 border border-indigo-200 dark:border-indigo-800">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Verified Solutions</h3>
                  <p className="text-sm text-gray-700 dark:text-slate-400">
                    All questions come with detailed solutions and expert explanations
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">⚡</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Smart Filtering</h3>
                  <p className="text-sm text-gray-700 dark:text-slate-400">
                    Filter by institution, course, module, and difficulty level
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
