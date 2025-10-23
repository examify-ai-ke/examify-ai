import { Metadata } from 'next';
import { ExamPaperDetailsContent } from '@/components/public/exam-paper-details-content';
import { publicAPI } from '@/lib/api-public';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    // Try to fetch by slug first
    let result = await publicAPI.examPapers.getBySlug(slug);

    // Fallback to ID if slug fails
    if (result.error || !result.data) {
      result = await publicAPI.examPapers.getById(slug);
    }

    if (result.data) {
      const paper = result.data;
      const title = paper.title?.title + paper.description?.description  || paper.identifying_name || 'Exam Paper';
      const description = paper.identifying_name || paper.description?.description || 'View exam paper details and questions';
      const institution = paper.institution?.name || '';

      return {
        title: `${title}${institution ? ` - ${institution}` : ''}`,
        description: description,
        keywords: paper.tags?.join(', ') || '',
      };
    }
  } catch (error) {
    console.error('Error fetching metadata:', error);
  }

  // Fallback metadata
  return {
    title: 'Exam Paper',
    description: 'View exam paper details and questions',
  };
}

export default async function ExamPaperDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  return <ExamPaperDetailsContent slug={slug} />;
}
