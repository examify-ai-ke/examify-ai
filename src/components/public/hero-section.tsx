'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, FileText, Building2, HelpCircle, BookOpen, Layers, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PlatformStats } from './types';

interface HeroSectionProps {
  stats: PlatformStats;
}

const statCards = [
  { key: 'totalPapers', label: 'Exam Papers', icon: FileText, color: 'from-teal-500/20 to-teal-500/5', border: 'border-teal-500/30', iconColor: 'text-teal-400', hoverBorder: 'hover:border-teal-400/60' },
  { key: 'totalInstitutions', label: 'Institutions', icon: Building2, color: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/30', iconColor: 'text-emerald-400', hoverBorder: 'hover:border-emerald-400/60' },
  { key: 'totalQuestions', label: 'Questions', icon: HelpCircle, color: 'from-cyan-500/20 to-cyan-500/5', border: 'border-cyan-500/30', iconColor: 'text-cyan-400', hoverBorder: 'hover:border-cyan-400/60' },
  { key: 'totalCourses', label: 'Courses', icon: BookOpen, color: 'from-purple-500/20 to-purple-500/5', border: 'border-purple-500/30', iconColor: 'text-purple-400', hoverBorder: 'hover:border-purple-400/60' },
  { key: 'totalModules', label: 'Modules', icon: Layers, color: 'from-indigo-500/20 to-indigo-500/5', border: 'border-indigo-500/30', iconColor: 'text-indigo-400', hoverBorder: 'hover:border-indigo-400/60' },
  { key: 'totalUsers', label: 'Active Users', icon: Users, color: 'from-rose-500/20 to-rose-500/5', border: 'border-rose-500/30', iconColor: 'text-rose-400', hoverBorder: 'hover:border-rose-400/60' },
] as const;

export function HeroSection({ stats }: HeroSectionProps) {
  const router = useRouter();

  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/hero-image.jpg"
          alt="Students studying"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-teal-900/75" />
      </div>

      {/* Subtle dot grid */}
      <div className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      {/* Glow orbs */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-teal-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-600 rounded-full mix-blend-multiply filter blur-[120px] opacity-15" />

      {/* Content */}
      <div className="relative container mx-auto px-4 py-24 md:py-36">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left – copy */}
          <div className="space-y-8 z-10">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 rounded-full px-4 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-sm font-medium text-teal-300 tracking-wide">Kenya's Exam Resource Hub</span>
            </div>

            {/* Headline – GTSuper */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.05] text-white font-heading">
                Study Smarter.
                <br />
                <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                  Score Higher.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-300 max-w-lg leading-relaxed">
                Access{' '}
                <span className="text-white font-semibold">{stats.totalPapers.toLocaleString()}+</span>
                {' '}past exam papers from{' '}
                <span className="text-white font-semibold">{stats.totalInstitutions.toLocaleString()}+</span>
                {' '}institutions. Practice with real questions and master every subject.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => router.push('/exampapers')}
                size="lg"
                className="h-13 px-8 text-base bg-teal-500 hover:bg-teal-400 text-white rounded-xl font-semibold shadow-lg shadow-teal-900/30 hover:shadow-teal-700/40 transition-all duration-200"
              >
                Browse Exam Papers
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => router.push('/auth/register')}
                size="lg"
                variant="outline"
                className="h-13 px-8 text-base border-white/20 text-white hover:bg-white/10 hover:border-white/40 rounded-xl font-semibold transition-all duration-200"
              >
                Get Started Free
              </Button>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              {[
                { label: 'Real past papers' },
                { label: 'No sign-up required' },
                { label: 'Always free' },
              ].map(({ label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-teal-400/20 border border-teal-400/50 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                  </div>
                  <span className="text-sm text-slate-300">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right – Stats grid */}
          <div className="hidden lg:grid grid-cols-3 gap-4">
            {statCards.map(({ key, label, icon: Icon, color, border, iconColor, hoverBorder }) => (
              <div
                key={key}
                className={`bg-gradient-to-br ${color} backdrop-blur-sm border ${border} ${hoverBorder} rounded-2xl p-5 transition-all duration-300 text-center group cursor-default`}
              >
                <div className="flex justify-center mb-3">
                  <div className={`w-11 h-11 rounded-xl bg-white/5 border ${border} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white tabular-nums">
                  {((stats as any)[key] || 0).toLocaleString()}
                </div>
                <div className="text-xs text-slate-400 mt-1 font-medium tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
