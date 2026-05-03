import { Metadata } from 'next';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { BrowsePageContent } from '@/components/public/browse-page-content';

export const metadata: Metadata = {
  title: 'Browse Exam Papers | Past Papers & Solutions | Exampapel',
  description: 'Browse and download thousands of past exam papers from top institutions. Find exam papers with solutions, study guides, and preparation materials for all subjects.',
  keywords: [
    'exam papers',
    'past papers',
    'past exams',
    'exam solutions',
    'study materials',
    'exam preparation',
    'educational resources',
    'practice papers',
    'exam archives',
    'academic papers',
    'test papers',
  ],
  authors: [{ name: 'Exampapel Team' }],
  creator: 'Exampapel',
  publisher: 'Exampapel',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://exampapel.com/exampapers',
  },
  openGraph: {
    title: 'Browse Exam Papers | Past Papers & Solutions | Exampapel',
    description: 'Browse and download thousands of past exam papers from top institutions with detailed solutions.',
    url: 'https://exampapel.com/exampapers',
    siteName: 'Exampapel',
    type: 'website',
    images: [
      {
        url: 'https://exampapel.com/og-exampapers.jpg',
        width: 1200,
        height: 630,
        alt: 'Exampapel Exam Papers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse Exam Papers | Past Papers & Solutions | Exampapel',
    description: 'Browse and download thousands of past exam papers with detailed solutions.',
    images: ['https://exampapel.com/og-exampapers.jpg'],
  },
};

export default function BrowsePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Page Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Browse Exam Papers
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400">
            Explore thousands of past exam papers from top institutions
          </p>
        </div>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      }>
        <BrowsePageContent />
      </Suspense>
    </div>
  );
}
