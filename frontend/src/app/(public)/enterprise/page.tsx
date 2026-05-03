import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Cpu, Sparkles, Building2, Workflow } from 'lucide-react';

export default function EnterpriseComingSoonPage() {
  return (
    <div className="flex flex-col min-h-screen relative bg-background text-foreground overflow-hidden">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 -z-10 bg-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        {/* Animated glowing orbs mimicking motion graphics */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse duration-10000"></div>
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-teal-500/20 rounded-full blur-[100px] animate-pulse duration-7000"></div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-20 px-6 relative z-10 text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span>Exampapel Enterprise</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl max-w-4xl mx-auto tracking-tight mb-6">
          The Ultimate <br className="hidden md:block" />
          <span className="text-teal-600 dark:text-teal-400">
            Exam Papers Resource Hub
          </span>
          <br className="hidden md:block" /> for Institutions.
        </h1>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-12 font-body leading-relaxed">
          We're building a seamless, safe, and hallucination-free generative AI tool 
          powered by your institution's own proprietary data. Set syllabus-aligned exams in seconds.
        </p>

        {/* Coming Soon Banners & Features */}
        <div className="relative w-full max-w-4xl mx-auto mb-16">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-teal-500 to-purple-500 opacity-20 blur-xl"></div>
          
          <div className="relative bg-card border border-border/50 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-sm">
            
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-foreground text-background px-6 py-2 rounded-full font-bold tracking-widest uppercase text-sm shadow-xl">
              Coming Soon
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center mt-6">
              <div className="flex flex-col items-center group">
                <div className="h-14 w-14 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-500 mb-4 group-hover:scale-110 transition-transform">
                  <Workflow className="w-7 h-7" />
                </div>
                <h3 className="font-heading text-lg mb-2">Automated RAG</h3>
                <p className="text-sm text-muted-foreground font-body">Generate distinct assessments instantly from historical data.</p>
              </div>

              <div className="flex flex-col items-center group">
                <div className="h-14 w-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 mb-4 group-hover:scale-110 transition-transform">
                  <Cpu className="w-7 h-7" />
                </div>
                <h3 className="font-heading text-lg mb-2">Curated Question Bank</h3>
                <p className="text-sm text-muted-foreground font-body">Structured database integration for precise assessment control.</p>
              </div>

              <div className="flex flex-col items-center group">
                <div className="h-14 w-14 bg-coral-500/10 rounded-2xl flex items-center justify-center text-coral-500 mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="w-7 h-7" />
                </div>
                <h3 className="font-heading text-lg mb-2">Advanced Analytics</h3>
                <p className="text-sm text-muted-foreground font-body">Map cognitive load and standardize difficulty automatically.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 rounded-full h-12 px-8">
            Join the Waitlist
          </Button>
          <Button size="lg" variant="ghost" asChild className="rounded-full h-12 px-8 border border-transparent hover:border-border transition-colors">
            <Link href="/">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
