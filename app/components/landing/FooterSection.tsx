'use client';

import { ArrowRight, Mail } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface FooterSectionProps {
  onRequestAccess: () => void;
}

const NAV_LINKS = [
  { label: 'Practice Areas', href: 'https://mnlegal.net/#practice-areas', external: true },
  { label: 'Our Team', href: 'https://mnlegal.net/team', external: true },
  { label: 'Legal Insights', href: 'https://mnlegal.net/insights', external: true },
  { label: 'Contact', href: '/contact', external: false },
  { label: 'Client Login', href: '/login', external: false },
];

export default function FooterSection({ onRequestAccess }: FooterSectionProps) {
  return (
    <>
      {/* Pre-footer CTA: deep navy-to-burgundy gradient */}
      <section className="relative py-20 px-6 md:px-12 overflow-hidden border-t border-hairline/60">
        {/* Gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, #1a2744 0%, #2d1630 50%, #8b1c3f 100%)',
          }}
        />
        {/* Decorative grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-grid)" />
        </svg>
        {/* Glow orbs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-accent/25 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-primary/50 blur-[80px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-8 bg-[#d98da4]" />
                <span className="font-sans text-eyebrow uppercase tracking-[0.2em] text-[#d98da4]">
                  Initiate a conversation
                </span>
              </div>
              <h2
                className="font-serif font-semibold text-white leading-tight"
                style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}
              >
                Ready to navigate Kenya&apos;s regulatory landscape with
                confidence?
              </h2>
              <p className="font-sans text-body-sm text-white/60 mt-4 leading-relaxed max-w-md">
                Join the select group of organisations who benefit from MNL&apos;s
                concierge regulatory intelligence service.
              </p>
            </div>

            <div className="flex flex-col gap-4 md:items-end shrink-0">
              <Button
                onClick={onRequestAccess}
                size="lg"
                variant="secondary"
                id="footer-request-access-btn"
                className="group shadow-elevated"
              >
                Request concierge access
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <a
                href="mailto:info@mnlegal.net"
                className="inline-flex items-center gap-2 font-sans text-caption text-white/50 hover:text-white/80 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                info@mnlegal.net
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-10 bg-primary border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-md border border-white/15 bg-white/5">
              <span className="font-serif text-caption text-white font-semibold">MN</span>
            </div>
            <div>
              <p className="font-serif text-caption text-white font-semibold">
                MNL Advocates LLP
              </p>
              <p className="font-sans text-eyebrow text-white/40 tracking-widest uppercase">
                Local Expertise · Global Talent
              </p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {NAV_LINKS.map(link =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-eyebrow uppercase text-white/40 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-sans text-eyebrow uppercase text-white/40 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          <p className="font-sans text-caption text-white/30">
            © {new Date().getFullYear()} MNL Advocates LLP. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
