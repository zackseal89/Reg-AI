'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onRequestAccess: () => void;
}

export default function HeroSection({ onRequestAccess }: HeroSectionProps) {
  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-primary">
      {/* Single hairline accent at the base of the night band */}
      <div
        className="absolute bottom-0 left-0 w-full h-px z-10"
        style={{
          background:
            'linear-gradient(90deg, transparent, #8b1c3f, transparent)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-28 w-full">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-8 bg-[#d98da4]" />
            <span className="font-sans text-eyebrow uppercase tracking-[0.2em] text-[#d98da4]">
              MNL Advocates LLP · Regulatory Intelligence
            </span>
          </div>

          <h1
            className="font-serif font-semibold text-white leading-[1.08] mb-6"
            style={{ fontSize: 'clamp(2.75rem, 5.5vw, 4.5rem)' }}
          >
            Regulatory intelligence,{' '}
            <span className="italic text-cream/90">human-approved.</span>
          </h1>

          <p className="font-sans text-white/85 leading-relaxed mb-4 max-w-xl text-body md:text-[19px]">
            East Africa&apos;s regulatory foresight platform. Every briefing,
            every document — reviewed and approved by a practising advocate
            before it reaches your desk.
          </p>

          <p className="font-sans text-caption text-white/60 tracking-wider uppercase mb-12">
            CBK · ODPC · CMA · KRA · CAK
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={onRequestAccess}
              size="lg"
              id="hero-request-access-btn"
            >
              Request concierge access
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Button>

            <Link href="/login" id="hero-client-login-link">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Client access
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 right-12 hidden lg:flex flex-col items-end gap-1 text-right text-white/60">
          <span className="font-serif italic text-caption">Local Expertise</span>
          <div className="h-px w-24 ml-auto bg-white/25" />
          <span className="font-serif italic text-caption">Global Talent</span>
        </div>
      </div>
    </section>
  );
}
