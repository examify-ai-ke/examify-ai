'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Calendar,
  Clock,
  FileText,
  BookmarkPlus,
} from 'lucide-react';
import type { PaperCardProps } from './types';
import { getExamPaperSlug } from '@/lib/slugify';

export function ExamPaperCard({
  paper,
  variant = 'list',
  showBookmark = true,
  className = '',
}: PaperCardProps) {
  const router = useRouter();

  const handleViewPaper = () => {
    const slug = getExamPaperSlug(paper);
    router.push(`/exampapers/${slug}`);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement bookmark functionality (show sign-up prompt for guests)
    console.log('Bookmark clicked');
  };

  // Extract data safely from API schema
  const mainTitle = paper.identifying_name || 'Exam Paper';
  const titleName = paper.title?.name || null;

  const description = typeof paper.description === 'object' && paper.description !== null
    ? (paper.description.name || '')
    : (typeof paper.description === 'string' ? paper.description : '');

  const institution = paper.institution;
  const institutionName = institution?.name || 'Unknown Institution';

  const course = paper.course;
  const courseName = course?.name || '';

  const year = paper.year_of_exam;
  const duration = paper.exam_duration;
  const questionCount = paper.question_sets?.reduce((sum, qs) => sum + (qs.questions_count || 0), 0) || 0;

  const modules = paper.modules || [];
  const tags = Array.isArray(paper.tags) ? paper.tags : [];

  // Color palette for module badges
  const moduleColors = [
    'bg-purple-600 hover:bg-purple-700 border-purple-600',
    'bg-orange-600 hover:bg-orange-700 border-orange-600',
    'bg-pink-600 hover:bg-pink-700 border-pink-600',
    'bg-indigo-600 hover:bg-indigo-700 border-indigo-600',
    'bg-cyan-600 hover:bg-cyan-700 border-cyan-600',
    'bg-rose-600 hover:bg-rose-700 border-rose-600',
    'bg-amber-600 hover:bg-amber-700 border-amber-600',
    'bg-teal-600 hover:bg-teal-700 border-teal-600',
  ];
 
  if (variant === 'list') {
    return (
      <Card
        className={`hover:shadow-lg transition-shadow cursor-pointer ${className}`}
        onClick={handleViewPaper}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Institution Logo */}
          <div className="sm:w-32 sm:shrink-0 p-6 flex items-center justify-center bg-gray-50">
            {institution?.logo ? (
              <img
                src={institution.logo?.media?.path || '/placeholder.svg'}
                alt={institution.logo?.media?.title || 'Institution logo'}
                width={80}
                height={80}
                className="object-contain"
              
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center">
                <Building2 className="h-10 w-10 text-teal-600" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-3xl font-semibold text-gray-900 mb-3 line-clamp-3">
                  {mainTitle}
                </h3>

                {/* Badges: Title, Description, Modules */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {titleName && (
                    <Badge variant="default" className="text-xs rounded-none bg-blue-600 hover:bg-blue-700 text-white">
                      {titleName}
                    </Badge>
                  )}
                  {description && (
                    <Badge variant="secondary" className="text-xs rounded-none bg-green-600 hover:bg-green-700 text-white">
                      {description}
                    </Badge>
                  )}
                  {modules.map((module, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className={`text-xs rounded-none text-white ${moduleColors[index % moduleColors.length]}`}
                    >
                      {module.name}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                  {institution && typeof institution === 'object' && institution.name && (
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      <span>{institution.name}</span>
                    </div>
                  )}
                  {courseName && (
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{courseName}</span>
                    </div>
                  )}
                  {year && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{year}</span>
                    </div>
                  )}
                  {duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{duration} min</span>
                    </div>
                  )}
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {showBookmark && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBookmark}
                  className="shrink-0"
                >
                  <BookmarkPlus className="h-5 w-5 text-gray-400 hover:text-teal-600" />
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">
                {questionCount} {questionCount === 1 ? 'question' : 'questions'}
              </div>
              <Button
                size="sm"
                className="bg-teal-500 hover:bg-teal-600"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewPaper();
                }}
              >
                View Paper
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid variant
  return (
    <Card
      className={`hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col ${className}`}
      onClick={handleViewPaper}
    >
      <CardHeader className="pb-3">
        {/* Institution Logo */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {institution?.logo?.media?.link ? (
              <Image
                src={institution.logo.media.link}
                alt={institution.name || 'Institution'}
                width={40}
                height={40}
                className="object-contain rounded"
                unoptimized
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-teal-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {institutionName}
              </p>
              {year && (
                <p className="text-xs text-gray-500">{String(year)}</p>
              )}
            </div>
          </div>

          {showBookmark && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBookmark}
              className="shrink-0 h-8 w-8"
            >
              <BookmarkPlus className="h-4 w-4 text-gray-400 hover:text-teal-600" />
            </Button>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 line-clamp-2 min-h-[3rem]">
          {mainTitle}
        </h3>
      </CardHeader>

      <CardContent className="pb-3 flex-1">
        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {description}
          </p>
        )}

        {/* Course */}
        {courseName && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <FileText className="h-4 w-4" />
            <span className="truncate">{courseName}</span>
          </div>
        )}

        {/* Meta Info */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          {questionCount > 0 && (
            <span>{questionCount} questions</span>
          )}
          {duration && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {duration} min
            </span>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <Button
          className="w-full bg-teal-500 hover:bg-teal-600"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleViewPaper();
          }}
        >
          View Paper
        </Button>
      </CardFooter>
    </Card>
  );
}

