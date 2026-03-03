'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, FileText, MapPin } from 'lucide-react';
import type { InstitutionCardProps } from './types';
import type { InstitutionRead } from '@/components/public/types';

export function InstitutionCard({ institution, className = '' }: InstitutionCardProps) {
  const router = useRouter();
  
  const handleViewInstitution = () => {
    router.push(`/institutions/${institution.slug}`);
  };

  // Get paper count from the institution object
  const paperCount = (institution as InstitutionRead & { exams_count?: number }).exams_count || 0;

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Institution Logo/Icon */}
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden shrink-0">
            {institution.logo?.media?.link || institution.logo?.media?.path ? (
              <img
                src={institution.logo?.media?.link || institution.logo?.media?.path || ''}
                alt={institution.name || 'Institution logo'}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 className="h-10 w-10 text-blue-600" />
            )}
          </div>

          {/* Institution Name */}
          <div className="space-y-1">
            <h3 className="font-semibold text-lg line-clamp-2">
              {institution.name}
            </h3>
            {(institution as any).key && (
              <p className="text-sm text-gray-500">
                ({(institution as any).key})
              </p>
            )}
          </div>

          {/* Institution Type and Location */}
          <div className="flex flex-wrap gap-2 justify-center">
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

          {/* Paper Count */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileText className="h-4 w-4" />
            <span className="font-medium">
              {paperCount.toLocaleString()} {paperCount === 1 ? 'Paper' : 'Papers'}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          onClick={handleViewInstitution}
          variant="outline"
          className="w-full"
        >
          View Institution
        </Button>
      </CardFooter>
    </Card>
  );
}
