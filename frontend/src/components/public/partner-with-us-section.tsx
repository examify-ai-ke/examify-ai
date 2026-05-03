import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function PartnerWithUsSection() {
  return (
    <section className="py-24 px-6 md:px-12 bg-teal-500/5 border-t border-border mt-auto">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-block p-4 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-6 border border-teal-500/20">
          <Trends className="w-8 h-8 mx-auto" />
        </div>
        <h2 className="font-heading mb-6 text-3xl md:text-5xl tracking-tight">Partner With Us</h2>
        <p className="text-xl text-muted-foreground mb-10 leading-relaxed font-body">
          Exampapel is actively seeking strategic partnerships to scale our infrastructure. Help us deploy our curated question banks to pilot universities and transform how students learn worldwide.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link href="/contact-us">
            <Button size="lg" className="bg-[#af1665] hover:bg-[#af1665]/90 text-white rounded-full px-8 h-12 text-base transition-all shadow-md active:scale-95">
              Contact us for Partnership
            </Button>
          </Link>
          <Link href="/contact-us">
            <Button size="lg" variant="outline" className="rounded-full px-8 h-12 border-border text-base bg-transparent hover:bg-muted/50 transition-all">
              Request more Info
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Icon helper
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
