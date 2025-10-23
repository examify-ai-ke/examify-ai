'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { publicAPI } from '@/lib/api-public';
import { Loader2, Calendar, Clock, Building2, BookOpen, Tag, ArrowLeft, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface ExamPaperDetailsContentProps {
  slug: string;
}

export function ExamPaperDetailsContent({ slug }: ExamPaperDetailsContentProps) {
  const router = useRouter();
  const [paper, setPaper] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPaper() {
      setIsLoading(true);
      setError(null);

      try {
        // First, try to fetch by slug
        let result = await publicAPI.examPapers.getBySlug(slug);
        
        // If slug fetch fails, try by ID (slug might actually be an ID)
        if (result.error || !result.data) {
          console.log('Slug fetch failed, trying by ID...');
          result = await publicAPI.examPapers.getById(slug);
        }

        if (result.error || !result.data) {
          setError('Exam paper not found');
          return;
        }

        setPaper(result.data);
      } catch (err) {
        console.error('Error fetching exam paper:', err);
        setError('Failed to load exam paper');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPaper();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-teal-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading exam paper...</p>
        </div>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Exam Paper Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The exam paper you are looking for does not exist.'}</p>
          <Button onClick={() => router.push('/exampapers')} className="bg-teal-500 hover:bg-teal-600">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to ExamPapers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-600 border-b border-teal-700 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/exampapers')}
              className="text-white hover:text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to ExamPapers
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Title and Info */}
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {paper.title?.title || paper.identifying_name || 'Exam Paper'}
                  </h1>
                  {paper.description?.description && (
                    <p className="text-white/90 text-lg">{paper.description.description}</p>
                  )}
                </div>
              </div>

              {/* Meta Information */}
              <div className="flex flex-wrap gap-4 text-sm">
                {paper.institution && (
                  <div className="flex items-center gap-2 text-white/95">
                    <Building2 className="h-4 w-4 text-white/80" />
                    <span className="font-medium">{paper.institution.name}</span>
                  </div>
                )}
                
                {paper.course && (
                  <div className="flex items-center gap-2 text-white/95">
                    <BookOpen className="h-4 w-4 text-white/80" />
                    <span>{paper.course.name}</span>
                  </div>
                )}

                {paper.year_of_exam && (
                  <div className="flex items-center gap-2 text-white/95">
                    <Calendar className="h-4 w-4 text-white/80" />
                    <span>{paper.year_of_exam}</span>
                  </div>
                )}

                {paper.exam_duration && (
                  <div className="flex items-center gap-2 text-white/95">
                    <Clock className="h-4 w-4 text-white/80" />
                    <span>{paper.exam_duration} minutes</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {paper.tags && paper.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {paper.tags.map((tag: string) => (
                    <Badge key={tag} className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">Exam Details</h3>
              
              <div className="space-y-4 text-sm">
                {paper.modules && paper.modules.length > 0 && (
                  <div>
                    <p className="text-gray-500 mb-2">Modules</p>
                    <div className="space-y-1">
                      {paper.modules.map((module: any) => (
                        <p key={module.id} className="text-gray-900">{module.name}</p>
                      ))}
                    </div>
                  </div>
                )}

                {paper.exam_date && (
                  <div>
                    <p className="text-gray-500 mb-1">Exam Date</p>
                    <p className="text-gray-900">{new Date(paper.exam_date).toLocaleDateString()}</p>
                  </div>
                )}

                {paper.question_sets && paper.question_sets.length > 0 && (
                  <div>
                    <p className="text-gray-500 mb-1">Question Sets</p>
                    <p className="text-gray-900">{paper.question_sets.length} set(s)</p>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Questions Section */}
          <main className="lg:col-span-3">
            {/* Instructions */}
            {paper.instructions && paper.instructions.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-3">Instructions</h2>
                <div className="space-y-2">
                  {paper.instructions.map((instruction: any, index: number) => (
                    <div key={instruction.id || index} className="text-blue-800">
                      <p>{instruction.instruction || instruction.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Questions */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions</h2>
              
              {/* TODO: Fetch and display questions */}
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Questions will be loaded here</p>
                <p className="text-sm text-gray-500 mt-2">
                  Question sets: {paper.question_sets?.length || 0}
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
