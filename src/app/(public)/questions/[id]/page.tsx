import { Metadata } from 'next';
import { QuestionDetailsContent } from '@/components/public/question-details-content';
import { publicAPI } from '@/lib/api-public';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const result = await publicAPI.questions.getById(id);

    if (result.data) {
      const question = result.data;
      
      // Attempt to extract string text for description
      let excerpt = 'View question details, answers, and comments.';
      if (typeof question.text === 'string') {
        excerpt = question.text.substring(0, 150) + (question.text.length > 150 ? '...' : '');
      } else if (typeof question.text === 'object' && question.text?.blocks && question.text.blocks.length > 0) {
        // Very basic extraction of first paragraph text if EditorJS format
        const firstBlock = question.text.blocks.find((b: any) => b.type === 'paragraph');
        if (firstBlock?.data?.text) {
          // Remove HTML tags in case there are any
          const cleanText = firstBlock.data.text.replace(/<[^>]*>?/gm, '');
          excerpt = cleanText.substring(0, 150) + (cleanText.length > 150 ? '...' : '');
        }
      }

      const title = `Question ${question.question_number || 'Details'}`;
      const examPaper = question.exam_paper?.identifying_name || '';

      return {
        title: `${title}${examPaper ? ` - ${examPaper}` : ''}`,
        description: excerpt,
      };
    }
  } catch (error) {
    console.error('Error fetching question metadata:', error);
  }

  // Fallback metadata
  return {
    title: 'Question Details',
    description: 'View question details, answers, and comments.',
  };
}

export default async function QuestionDetailsPage({ params }: PageProps) {
  const { id } = await params;
  return <QuestionDetailsContent id={id} />;
}
