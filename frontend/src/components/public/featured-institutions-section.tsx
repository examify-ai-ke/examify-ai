'use client';

import { InstitutionCard } from './institution-card';
// import { InstitutionListItem} from './institution-list-item';

import type { InstitutionRead } from '@/components/public/types';

interface FeaturedInstitutionsSectionProps {
  institutions: InstitutionRead[];
}

export function FeaturedInstitutionsSection({ institutions }: FeaturedInstitutionsSectionProps) {
  if (!institutions || institutions.length === 0) {
    return null;
  }
  console.log("institutions", institutions);
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Institutions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse exam papers from top universities and colleges. 
              Find past papers from your institution.
            </p>
          </div>

          {/* Institutions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {institutions.slice(0, 8).map((institution) => (
              <InstitutionCard
                key={institution.id}
                institution={institution}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
