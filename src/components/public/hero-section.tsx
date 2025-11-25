'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PlatformStats } from './types';

interface HeroSectionProps {
  stats: PlatformStats;
}

export function HeroSection({ stats }: HeroSectionProps) {
  const router = useRouter();

  const handleBrowseClick = () => {
    router.push('/exampapers');
  };

  return (
    <section className="relative bg-gradient-to-br from-gray-50 via-white to-teal-50 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 opacity-20">
        <div className="grid grid-cols-8 gap-1">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="w-1 h-1 bg-teal-500 rounded-full" />
          ))}
        </div>
      </div>
      <div className="absolute top-40 right-20 w-20 h-20 border-4 border-coral-400 rounded-full opacity-30" />
      <div className="absolute bottom-40 right-40 w-16 h-16 border-4 border-purple-400 rounded-full opacity-30" />
      <div className="absolute top-60 right-10 w-12 h-12 bg-yellow-400 rounded-full opacity-40" />
      
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight">
                Get <span className="text-teal-500 font-bold">{stats.totalPapers.toLocaleString()}+</span>
                <br />
                <span className="font-bold">Best Exam Papers</span>
                <br />
                <span className="font-bold">From Exampapel</span>
              </h1>
              <p className="text-gray-600 text-base md:text-lg max-w-lg">
                Access thousands of past exam papers, practice questions, and study materials from top institutions. Start your revision journey today.
              </p>
            </div>

            {/* CTA Button */}
            <div>
              <Button
                onClick={handleBrowseClick}
                size="lg"
                className="h-12 px-8 text-base bg-teal-500 hover:bg-teal-600 text-white rounded-md"
              >
                Find Papers
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Instructor Badge */}
            <div className="inline-flex items-center gap-3 bg-white rounded-lg shadow-md px-4 py-3 border border-gray-100">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-teal-500 border-2 border-white flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-white" />
                <div className="w-8 h-8 rounded-full bg-coral-500 border-2 border-white" />
                <div className="w-8 h-8 rounded-full bg-yellow-500 border-2 border-white" />
                <div className="w-8 h-8 rounded-full bg-teal-600 border-2 border-white flex items-center justify-center text-white text-xs font-semibold">
                  +
                </div>
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-gray-900">
                  {stats.totalInstitutions.toLocaleString()}+
                </div>
                <div className="text-xs text-gray-600">Institutions</div>
              </div>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative lg:block hidden">
            <div className="relative w-full h-[500px]">
              {/* Placeholder for hero image */}
              {/* <div className="absolute inset-0 bg-gradient-to-br from-teal-100 to-teal-50 rounded-2xl flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 mx-auto bg-teal-200 rounded-full flex items-center justify-center">
                    <Users className="w-16 h-16 text-teal-600" />
                  </div>
                  <p className="text-gray-500 text-sm">
                    Add your hero image here
                    <br />
                    <span className="text-xs">(Replace in hero-section.tsx)</span>
                  </p>
                </div> */}
                 <Image
                  src="/hero-image.jpg"
                  alt="Student with exam materials"
                  fill
                  className="object-contain"
                  priority
                />
              {/* </div> */}
              
              {/* Decorative wave lines */}
              <div className="absolute top-10 right-0 w-24 h-16">
                <svg viewBox="0 0 100 50" className="text-teal-400 opacity-40">
                  <path d="M0,25 Q25,10 50,25 T100,25" fill="none" stroke="currentColor" strokeWidth="3"/>
                  <path d="M0,35 Q25,20 50,35 T100,35" fill="none" stroke="currentColor" strokeWidth="3"/>
                  <path d="M0,45 Q25,30 50,45 T100,45" fill="none" stroke="currentColor" strokeWidth="3"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="bg-teal-500 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-2xl md:text-3xl font-bold">
                {stats.totalPapers.toLocaleString()}
              </div>
              <div className="text-sm text-teal-100">Exam Papers</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl md:text-3xl font-bold">
                {stats.totalInstitutions.toLocaleString()}
              </div>
              <div className="text-sm text-teal-100">Institutions</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl md:text-3xl font-bold">
                {stats.totalQuestions.toLocaleString()}
              </div>
              <div className="text-sm text-teal-100">Total Questions</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl md:text-3xl font-bold">
                {(stats.totalModules || 0).toLocaleString()}
              </div>
              <div className="text-sm text-teal-100">Total Modules</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl md:text-3xl font-bold">
                {(stats.totalCourses || 0).toLocaleString()}
              </div>
              <div className="text-sm text-teal-100">Total Courses</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
