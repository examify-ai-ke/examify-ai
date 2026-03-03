import { Metadata } from 'next';
import { QuestionDetailsContent } from '@/components/public/question-details-content';
import { publicAPI } from '@/lib/api-public';
import { extractQuestionId } from '@/utils/question-url';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const id = extractQuestionId(slug);

  try {
    const result = await publicAPI.questions.getById(id);

    if (result.data) {
      const question = result.data;
      
      // Extract text for description
      let excerpt = 'View question details, answers, and comments.';
      if (typeof question.text === 'string') {
        excerpt = question.text.substring(0, 160) + (question.text.length > 160 ? '...' : '');
      } else if (typeof question.text === 'object' && question.text?.blocks && question.text.blocks.length > 0) {
        // Extract text from EditorJS format
        const firstBlock = question.text.blocks.find((b: any) => b.type === 'paragraph');
        if (firstBlock?.data?.text) {
          const cleanText = firstBlock.data.text.replace(/<[^>]*>?/gm, '');
          excerpt = cleanText.substring(0, 160) + (cleanText.length > 160 ? '...' : '');
        }
      }

      const questionNumber = question.question_number || '';
      const examPaperName = question.exam_paper?.identifying_name || '';
      const institutionName = question.institution?.name || '';
      const marks = question.marks ? `${question.marks} marks` : '';
      
      // Build comprehensive title
      const titleParts = ['Question', questionNumber, examPaperName].filter(Boolean);
      const title = titleParts.join(' - ');
      
      // Build keywords array
      const keywords = [
        'exam question',
        'past paper question',
        'exam paper',
        questionNumber && `question ${questionNumber}`,
        examPaperName,
        institutionName,
        institutionName && `${institutionName} exam`,
        institutionName && `${institutionName} past papers`,
        'exam answers',
        'question solutions',
        'study materials',
        'exam preparation',
        marks && `${marks} question`,
      ].filter(Boolean) as string[];

      // Build canonical URL
      const canonicalUrl = `https://exampapel.com/questions/${slug}`;

      return {
        title,
        description: excerpt,
        keywords: keywords.join(', '),
        authors: [{ name: 'Exampapel' }],
        creator: 'Exampapel',
        publisher: 'Exampapel',
        
        // Open Graph metadata
        openGraph: {
          title,
          description: excerpt,
          url: canonicalUrl,
          siteName: 'Exampapel',
          type: 'article',
          locale: 'en_US',
          images: [
            {
              url: '/og-image.png', // You can add a default OG image
              width: 1200,
              height: 630,
              alt: title,
            },
          ],
        },
        
        // Twitter Card metadata
        twitter: {
          card: 'summary_large_image',
          title,
          description: excerpt,
          site: '@exampapel',
          creator: '@exampapel',
          images: ['/og-image.png'],
        },
        
        // Additional metadata
        alternates: {
          canonical: canonicalUrl,
        },
        
        robots: {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
      };
    }
  } catch (error) {
    console.error('Error fetching question metadata:', error);
  }

  // Fallback metadata
  return {
    title: 'Question Details - Exampapel',
    description: 'View exam question details, answers, and comments. Access past paper questions and solutions.',
    keywords: 'exam questions, past papers, exam answers, study materials, exam preparation',
    openGraph: {
      title: 'Question Details - Exampapel',
      description: 'View exam question details, answers, and comments.',
      type: 'website',
      siteName: 'Exampapel',
    },
    twitter: {
      card: 'summary',
      title: 'Question Details - Exampapel',
      description: 'View exam question details, answers, and comments.',
    },
  };
}

export default async function QuestionDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const id = extractQuestionId(slug);
  return <QuestionDetailsContent id={id} />;
}
