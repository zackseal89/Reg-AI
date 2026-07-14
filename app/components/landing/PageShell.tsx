'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import HeaderSection from './HeaderSection';
import FooterSection from './FooterSection';
import RequestAccessForm from './RequestAccessForm';
import { Button } from '@/components/ui/button';

interface PageShellProps {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  onRequestAccess?: () => void;
  children: React.ReactNode;
}

export default function PageShell({
  eyebrow,
  title,
  subtitle,
  backHref = '/',
  backLabel = 'Back to home',
  children,
}: PageShellProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <main className="min-h-screen flex flex-col">
      <HeaderSection onRequestAccess={() => setIsFormOpen(true)} />

      {/* Page Hero Band */}
      <section className="relative bg-primary pt-32 pb-20 px-6 md:px-12 overflow-hidden">
        {/* Background grid */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="page-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#page-grid)" />
        </svg>
        {/* Glow */}
        <div className="absolute top-0 right-0 w-[40%] h-full rounded-full bg-accent/15 blur-[120px] pointer-events-none" />
        {/* Bottom hairline */}
        <div
          className="absolute bottom-0 left-0 w-full h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #8b1c3f, transparent)' }}
        />

        <div className="relative max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors font-sans text-eyebrow uppercase tracking-wider mb-8 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            {backLabel}
          </Link>

          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-8 bg-[#d98da4]" />
            <span className="font-sans text-eyebrow uppercase tracking-[0.2em] text-[#d98da4]">
              {eyebrow}
            </span>
          </div>

          <h1
            className="font-serif font-semibold text-white leading-[1.08] max-w-3xl"
            style={{ fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)' }}
          >
            {title}
          </h1>

          {subtitle && (
            <p className="mt-4 font-sans text-white/65 leading-relaxed max-w-xl text-body md:text-[19px]">
              {subtitle}
            </p>
          )}

          <div className="mt-8">
            <Button
              onClick={() => setIsFormOpen(true)}
              variant="secondary"
              size="lg"
              className="group"
            >
              Request concierge access
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Page Content */}
      {children}

      <FooterSection onRequestAccess={() => setIsFormOpen(true)} />

      <RequestAccessForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </main>
  );
}
