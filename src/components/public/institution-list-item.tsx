'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, FileText, MapPin, GraduationCap, School } from 'lucide-react';
import type { InstitutionRead } from '@/components/public/types';

interface InstitutionListItemProps {
  institution: InstitutionRead;
  className?: string;
}

export function InstitutionListItem({ institution, className = '' }: InstitutionListItemProps) {
  const router = useRouter();
  console.log(institution);
  const handleViewInstitution = () => {
    router.push(`/institutions/${institution.slug}`);
  };

  // Get paper count from the institution object
  const paperCount = (institution as InstitutionRead & { exams_count?: number }).exams_count || 0;

  // Get appropriate icon based on institution type
  const getInstitutionIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'university':
        return GraduationCap;
      case 'college':
      case 'institute':
        return School;
      default:
        return Building2;
    }
  };

  const InstitutionIcon = getInstitutionIcon(institution.institution_type || '');
  
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow ${className}`}>
      {/* Left side - Institution info */}
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        {/* Institution Logo/Icon */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
            {institution.logo?.media?.link ? (
              <img
                src={institution.logo.media.link}
                alt={institution.logo?.media?.title || 'Institution logo'}
                width={64}  
                height={64}                
                className="rounded-full object-cover"
              />
            ) : (
              <InstitutionIcon className="h-8 w-8 text-blue-600" />
            )}
          </div>
        </div>

        {/* Institution details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start flex-col gap-1 mb-1">
            <h3 className="font-semibold text-lg text-gray-900 truncate w-full">
              {institution.name}
            </h3>
            {(institution as any).key && (
              <span className="text-sm text-gray-500 font-mono">
                ({(institution as any).key})
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-2">
            {(institution as any).category && (
              <Badge className="text-xs bg-teal-600">
                {(institution as any).category}
              </Badge>
            )}
            {institution.institution_type && (
              <Badge variant="secondary" className="text-xs">
                {institution.institution_type}
              </Badge>
            )}
            {institution.location && (
              <Badge variant="outline" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                {institution.location}
              </Badge>
            )}
          </div>

          {/* Tags */}
          {(institution as any).tags && (institution as any).tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {(institution as any).tags.slice(0, 5).map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                  {tag}
                </Badge>
              ))}
              {(institution as any).tags.length > 5 && (
                <Badge variant="outline" className="text-xs bg-gray-50">
                  +{(institution as any).tags.length - 5} more
                </Badge>
              )}
            </div>
          )}

          {/* Additional properties */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span className="font-medium">
                {paperCount.toLocaleString()} {paperCount === 1 ? 'Paper' : 'Papers'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Action button */}
      <div className="flex-shrink-0 sm:ml-4 w-full sm:w-auto">
        <Button
          onClick={handleViewInstitution}
          variant="outline"
          className="w-full sm:w-auto"
        >
          View Institution
        </Button>
      </div>
    </div>
  );
}