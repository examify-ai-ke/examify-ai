'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Zap, FileText, Building2, HelpCircle, BookOpen, Layers, Users } from 'lucide-react';
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

  const handleSignUp = () => {
    router.push('/auth/register');
  };

  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Animated Background Elements with Hero Image */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Hero Image Background */}
        <div className="absolute inset-0">
          <Image
            src="/hero-image.jpg"
            alt="Students studying"
            fill
            className="object-cover"
            priority
          />
          {/* Dark Overlay with Green Accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-800/80 to-emerald-900/70"></div>
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-4000"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 w-fit">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">Master Your Exams</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white">
                Ace Your
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Exams Today
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-300 max-w-lg leading-relaxed">
                Access {stats.totalPapers.toLocaleString()}+ past exam papers from {stats.totalInstitutions.toLocaleString()}+ institutions. Practice with real questions and master every subject.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={handleBrowseClick}
                size="lg"
                className="h-14 px-8 text-base bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Browse Papers
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={handleSignUp}
                size="lg"
                className="h-14 px-8 text-base bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Get Started Free
              </Button>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                </div>
                <div>
                  <p className="font-semibold text-white">Real Exam Papers</p>
                  <p className="text-sm text-slate-400">From top institutions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                </div>
                <div>
                  <p className="font-semibold text-white">Instant Access</p>
                  <p className="text-sm text-slate-400">Start studying now</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                </div>
                <div>
                  <p className="font-semibold text-white">Track Progress</p>
                  <p className="text-sm text-slate-400">Monitor your improvement</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                </div>
                <div>
                  <p className="font-semibold text-white">Free Forever</p>
                  <p className="text-sm text-slate-400">No hidden charges</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats Cards Grid */}
          <div className="hidden lg:flex justify-center">
            <div className="grid grid-cols-3 gap-6 w-full max-w-2xl">
              {/* Exam Papers Card */}
              <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-xl p-6 hover:border-blue-500/50 transition-all text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 rounded-lg bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
                    <FileText className="w-7 h-7 text-blue-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">
                  {stats.totalPapers.toLocaleString()}
                </div>
                <div className="text-sm text-slate-400 mt-2">Exam Papers</div>
              </div>
              
              {/* Institutions Card */}
              <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-xl p-6 hover:border-emerald-500/50 transition-all text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-emerald-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">
                  {stats.totalInstitutions.toLocaleString()}
                </div>
                <div className="text-sm text-slate-400 mt-2">Institutions</div>
              </div>
              
              {/* Questions Card */}
              <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-xl p-6 hover:border-cyan-500/50 transition-all text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 rounded-lg bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
                    <HelpCircle className="w-7 h-7 text-cyan-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">
                  {stats.totalQuestions.toLocaleString()}
                </div>
                <div className="text-sm text-slate-400 mt-2">Questions</div>
              </div>
              
              {/* Courses Card */}
              <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-xl p-6 hover:border-purple-500/50 transition-all text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 rounded-lg bg-purple-500/20 border border-purple-500/50 flex items-center justify-center">
                    <BookOpen className="w-7 h-7 text-purple-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">
                  {(stats.totalCourses || 0).toLocaleString()}
                </div>
                <div className="text-sm text-slate-400 mt-2">Courses</div>
              </div>
              
              {/* Modules Card */}
              <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-xl p-6 hover:border-indigo-500/50 transition-all text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 rounded-lg bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center">
                    <Layers className="w-7 h-7 text-indigo-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">
                  {(stats.totalModules || 0).toLocaleString()}
                </div>
                <div className="text-sm text-slate-400 mt-2">Modules</div>
              </div>
              
              {/* Active Users Card */}
              <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-xl p-6 hover:border-rose-500/50 transition-all text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 rounded-lg bg-rose-500/20 border border-rose-500/50 flex items-center justify-center">
                    <Users className="w-7 h-7 text-rose-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">
                  {(stats.totalUsers || 0).toLocaleString()}
                </div>
                <div className="text-sm text-slate-400 mt-2">Active Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .bg-grid-pattern {
          background-image: 
            linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05) 76%, transparent 77%, transparent);
          background-size: 50px 50px;
        }
      `}</style>
    </section>
  );
}
