'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { publicAPI } from '@/lib/api-public';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { QuestionCard } from '@/components/public';
import {
  Building2,
  Calendar,
  Clock,
  FileText,
  BookmarkPlus,
  Download,
  Share2,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

export default function ExamPaperDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // Fetch exam paper by slug
  const { data: paper, isLoading, error } = useQuery({
    queryKey: ['examPaper', slug],
    queryFn: async () => {
      const result = await publicAPI.examPapers.getBySlug(slug);
      if (result.error) {
        throw new Error('Failed to fetch exam paper');
      }
      return result.data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Exam Paper Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The exam paper you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push('/exampapers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Browse
          </Button>
        </div>
      </div>
    );
  }

  // Extract data
  const title = paper.title?.title || 'Exam Paper';
  const description = paper.description || '';
  const institution = paper.institution;
  const course = paper.course;
  const year = paper.year_of_exam;
  const duration = paper.exam_duration;
  const examDate = paper.exam_date;
  const tags = paper.tags || [];
  const instructions = paper.instructions || [];
  const questionSets = paper.question_sets || [];

  // Get all questions from question sets
  const allQuestions = questionSets.flatMap((qs: any) => qs.questions || []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/exampapers')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Browse
          </Button>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Institution Logo */}
            <div className="shrink-0">
              {institution?.logo_url ? (
                <Image
                  src={institution.logo_url}
                  alt={institution.name || 'Institution'}
                  width={120}
                  height={120}
                  className="object-contain rounded-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-lg bg-teal-100 flex items-center justify-center">
                  <Building2 className="h-16 w-16 text-teal-600" />
                </div>
              )}
            </div>

            {/* Paper Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {title}
              </h1>

              {description && (
                <p className="text-lg text-gray-600 mb-4">{description}</p>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                {institution && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">{institution.name}</span>
                  </div>
                )}
                {course && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>{course.name || course.code}</span>
                  </div>
                )}
                {year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{year}</span>
                  </div>
                )}
                {duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{duration} minutes</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button className="bg-teal-500 hover:bg-teal-600">
                  <BookmarkPlus className="h-4 w-4 mr-2" />
                  Save Paper
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Instructions */}
          {instructions.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                Instructions
              </h2>
              <div className="space-y-2">
                {instructions.map((instruction: any, index: number) => (
                  <div key={instruction.id || index} className="text-sm text-gray-700">
                    • {instruction.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questions */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Questions ({allQuestions.length})
              </h2>
            </div>

            {questionSets.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg border">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">
                  No questions available for this exam paper yet.
                </p>
              </div>
            )}

            {questionSets.map((questionSet: any) => (
              <div key={questionSet.id} className="space-y-4">
                {questionSet.title && (
                  <div className="bg-white rounded-lg border p-4">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {questionSet.title}
                    </h3>
                  </div>
                )}

                <div className="grid gap-4">
                  {(questionSet.questions || []).map((question: any) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      preview={false}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Paper Details */}
          <div className="mt-12 bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Paper Details
            </h2>
            <Separator className="mb-4" />
            
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {institution && (
                <>
                  <dt className="font-semibold text-gray-700">Institution</dt>
                  <dd className="text-gray-600">{institution.name}</dd>
                </>
              )}
              {course && (
                <>
                  <dt className="font-semibold text-gray-700">Course</dt>
                  <dd className="text-gray-600">{course.name || course.code}</dd>
                </>
              )}
              {year && (
                <>
                  <dt className="font-semibold text-gray-700">Year</dt>
                  <dd className="text-gray-600">{year}</dd>
                </>
              )}
              {examDate && (
                <>
                  <dt className="font-semibold text-gray-700">Exam Date</dt>
                  <dd className="text-gray-600">
                    {new Date(examDate).toLocaleDateString()}
                  </dd>
                </>
              )}
              {duration && (
                <>
                  <dt className="font-semibold text-gray-700">Duration</dt>
                  <dd className="text-gray-600">{duration} minutes</dd>
                </>
              )}
              <dt className="font-semibold text-gray-700">Total Questions</dt>
              <dd className="text-gray-600">{allQuestions.length}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
