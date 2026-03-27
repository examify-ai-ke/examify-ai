import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  Lightbulb, 
  BookOpen, 
  CheckCircle2, 
  Database, 
  Network, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Briefcase 
} from 'lucide-react';

export default function AboutUsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-24 md:pt-48 md:pb-32 flex flex-col items-center justify-center text-center">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 bg-background pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[70%] rounded-full bg-teal-500/10 blur-[120px]" />
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-purple-500/10 blur-[120px]" />
          <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-coral-500/10 blur-[100px]" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-sm font-medium mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>
          Reimagining Education
        </div>

        <h1 className="font-heading max-w-5xl mx-auto mb-6">
          The AI-Powered Assessment <br className="hidden md:block" />
          <span className="text-teal-600 dark:text-teal-400">Ecosystem</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed font-body">
          Exampapel is solving the hardest problem in academic data—structuring legacy PDFs into intelligent data—to power a dual-sided ecosystem for institutions and students.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white rounded-full px-8 h-12 text-base shadow-lg shadow-teal-500/25 transition-all w-full sm:w-auto">
            Get Started For Free
          </Button>
          <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base w-full sm:w-auto hover:bg-muted/50 transition-all border-border" asChild>
            <Link href="/enterprise">
              For Institutions
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* The Problem & Solution (Bento Grid) */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-heading mb-4">Bridging the Gap</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            We exist to solve the extreme inefficiencies dragging down both educators setting exams, and students trying to prepare for them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Educator Bottleneck */}
          <div className="group relative bg-card rounded-3xl p-8 md:p-10 border border-border shadow-sm hover:shadow-md hover:border-coral-500/30 transition-all duration-300">
            <div className="absolute inset-x-0 -bottom-2 h-full w-full bg-gradient-to-t from-coral-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl z-0 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-coral-500/10 flex items-center justify-center mb-6 text-coral-500">
                <Briefcase className="w-7 h-7" />
              </div>
              <h3 className="font-heading mb-4 text-2xl">The Educator Bottleneck</h3>
              <p className="text-muted-foreground leading-relaxed mb-6 font-body">
                Setting and formatting a new exam takes dozens of hours. Educators cross-reference old papers, balance difficulty, and write fresh variations to prevent cheating. This administrative burden leads to burnout.
              </p>
              <ul className="space-y-3">
                {['High cross-referencing effort', 'Manual PDF formatting', 'Constant fear of generative AI hallucinations'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                    <CheckCircle2 className="w-5 h-5 text-coral-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Student Struggle */}
          <div className="group relative bg-card rounded-3xl p-8 md:p-10 border border-border shadow-sm hover:shadow-md hover:teal-500/30 transition-all duration-300">
            <div className="absolute inset-x-0 -bottom-2 h-full w-full bg-gradient-to-t from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl z-0 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-6 text-teal-500">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="font-heading mb-4 text-2xl">The Student Struggle</h3>
              <p className="text-muted-foreground leading-relaxed mb-6 font-body">
                Practicing past papers is the best way to study. However, accessing these usually means dealing with static, scanned PDFs that are hard to read on mobile, non-interactive, and impossible to search by topic.
              </p>
              <ul className="space-y-3">
                {['Non-interactive, static PDFs', 'No instant feedback or marking schemes', 'Hard to search by specific topics'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                    <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section className="py-24 bg-muted/30 border-y border-border px-6 md:px-12 relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-[150%] bg-teal-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="order-2 lg:order-1 relative">
              <div className="relative z-10 bg-card rounded-3xl p-8 border border-border shadow-xl">
                <div className="flex flex-col gap-6">
                  <div className="flex gap-4 items-start p-4 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-teal-500/10 flex flex-shrink-0 items-center justify-center text-teal-500">
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-heading text-lg mb-1">Phase 1: Intelligent Ingestion</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">Robust OCR pipeline powered by advanced LLMs that converts disorganized PDF past papers into structured, interactive data stored in our vector databases.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start p-4 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex flex-shrink-0 items-center justify-center text-purple-500">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-heading text-lg mb-1">Phase 2: Examify Enterprise</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">B2B SaaS allowing educators to generate brand new exams in seconds via RAG against their historical database. Perfectly aligned difficulty, formatting, and tone.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start p-4 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-coral-500/10 flex flex-shrink-0 items-center justify-center text-coral-500">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-heading text-lg mb-1">Phase 3: Exampapel B2C</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">100% free tool for students. Once an exam is published by the institution, it seamlessly flows into Exampapel, fully mapped with AI-generated step-by-step marking schemes.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="font-heading mb-6 tracking-tight">Our Solution: The Examify Ecosystem</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6 font-body">
                We have completely eliminated the student paywall. Exampapel serves as our ultimate growth engine and B2B adoption wedge. By making the revision tool highly interactive and free, we generate massive organic demand from students.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed font-body">
                Students rally to use our platform, which in turn pressures their institutions to officially adopt Examify Enterprise. This drastically reduces our B2B Customer Acquisition Cost while delivering unparalleled value to both sides.
              </p>
            </div>
            
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="font-heading mb-6">Safe, Hallucination-Free AI</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            We bypass the trust issues preventing standard LLMs from being adopted by conservative educational boards. How? Human-in-the-Loop RAG Architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Network className="w-6 h-6" />,
              title: "Proprietary Data Flywheel",
              desc: "By limiting our generative AI to the RAG database of actual institutional data, we ensure 100% academic safety and integrity.",
              color: "text-purple-500",
              bg: "bg-purple-500/10"
            },
            {
              icon: <Lightbulb className="w-6 h-6" />,
              title: "AI Synthesis & Plagiarism Prevention",
              desc: "The AI tests the exact same concepts but actively rewrites scenarios and data to avoid repeating literal text of past papers.",
              color: "text-yellow-500",
              bg: "bg-yellow-500/10"
            },
            {
              icon: <TrendingUp className="w-6 h-6" />,
              title: "Advanced Analytics",
              desc: "Unlock standardized difficulty mapping, cognitive load (Bloom's Taxonomy) tracking, and deep gap analysis for regulators.",
              color: "text-teal-500",
              bg: "bg-teal-500/10"
            }
          ].map((feature, i) => (
            <div key={i} className="bg-card border border-border rounded-3xl p-8 flex flex-col hover:border-foreground/20 transition-colors">
              <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center ${feature.color} mb-6`}>
                {feature.icon}
              </div>
              <h4 className="font-heading text-xl mb-3">{feature.title}</h4>
              <p className="text-muted-foreground font-body leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Partner & Invest With Us Section */}
      <section className="py-24 px-6 md:px-12 bg-teal-500/5 border-t border-border mt-auto">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block p-4 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-6 border border-teal-500/20">
            <Trends className="w-8 h-8 mx-auto" />
          </div>
          <h2 className="font-heading mb-6 text-3xl md:text-5xl tracking-tight">Partner With Us</h2>
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed font-body">
            Exampapel is actively seeking seed funding and strategic partnerships to scale our infrastructure. Help us deploy our Enterprise dashboard to pilot universities and transform how students learn worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 h-12 text-base transition-all">
              Contact Us for Investment
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 h-12 border-border text-base bg-transparent hover:bg-muted/50 transition-all">
              Request a Pilot Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

// Icon helper for the last section
function Trends(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
