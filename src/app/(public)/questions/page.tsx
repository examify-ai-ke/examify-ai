import { Metadata } from 'next';
import PublicQuestionsContent from './questions-content';

export const metadata: Metadata = {
  title: 'Practice Questions | Exam Papers & Solutions | Exampapel',
  description: 'Browse thousands of practice questions from top institutions. Find exam questions with detailed solutions, study materials, and expert explanations to ace your exams.',
  keywords: [
    'practice questions',
    'exam questions',
    'past papers',
    'past exam questions',
    'study materials',
    'exam solutions',
    'practice tests',
    'educational resources',
    'exam preparation',
    'question bank',
    'academic questions',
  ],
  authors: [{ name: 'Exampapel Team' }],
  creator: 'Exampapel',
  publisher: 'Exampapel',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://exampapel.com/questions',
  },
  openGraph: {
    title: 'Exam Practice Questions | Past Exam Questions & Solutions | Exampapel',
    description: 'Browse thousands of practice questions from top institutions. Find exam questions with detailed solutions and expert explanations.',
    url: 'https://exampapel.com/questions',
    siteName: 'Exampapel',
    type: 'website',
    images: [
      {
        url: 'https://exampapel.com/og-questions.jpg',
        width: 1200,
        height: 630,
        alt: 'Exampapel Practice Questions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Practice Questions | Exam Papers & Solutions | Exampapel',
    description: 'Browse thousands of practice questions from top institutions with detailed solutions.',
    images: ['https://exampapel.com/og-questions.jpg'],
  },
};

export default PublicQuestionsContent;