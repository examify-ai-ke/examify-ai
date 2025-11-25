import { Metadata } from 'next';
import InstitutionsPageContent from './institutions-content';

export const metadata: Metadata = {
  title: 'Browse Institutions | Universities & Colleges | Exampapel',
  description: 'Explore exam papers from top universities, colleges, and educational institutions. Find past papers, study materials, and exam solutions from leading institutions worldwide.',
  keywords: [
    'universities',
    'colleges',
    'educational institutions',
    'exam papers',
    'past papers',
    'university exams',
    'college exams',
    'institution directory',
    'academic institutions',
    'educational resources',
    'exam archives',
  ],
  authors: [{ name: 'Exampapel Team' }],
  creator: 'Exampapel',
  publisher: 'Exampapel',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://exampapel.com/institutions',
  },
  openGraph: {
    title: 'Browse Institutions | Universities & Colleges | Exampapel',
    description: 'Explore exam papers from top universities, colleges, and educational institutions worldwide.',
    url: 'https://exampapel.com/institutions',
    siteName: 'Exampapel',
    type: 'website',
    images: [
      {
        url: 'https://exampapel.com/og-institutions.jpg',
        width: 1200,
        height: 630,
        alt: 'Exampapel Institutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse Institutions | Universities & Colleges | Exampapel',
    description: 'Explore exam papers from top universities, colleges, and educational institutions.',
    images: ['https://exampapel.com/og-institutions.jpg'],
  },
};

export default InstitutionsPageContent;
