'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
            {(institution as any).logo?.media?.link ? (
              <Image
                src={(institution as any).logo.media.link}
                alt={institution.name}
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