'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FooterSectionProps {
  onRequestAccess: () => void;
}

const NAV_LINKS = [
  { label: 'Practice Areas', href: 'https://mnlegal.net/#practice-areas', external: true },
  { label: 'Our Team', href: 'https://mnlegal.net/team', external: true },
  { label: 'Legal Insights', href: 'https://mnlegal.net/insights', external: true },
  { label: 'Client Login', href: '/login', external: false },
];

export default function FooterSection({ onRequestAccess }: FooterSectionProps) {
  return (
    <>
      {/* Pre-footer CTA — daylight band, single accent CTA */}
      <section className="py-20 px-6 md:px-12 bg-surface border-t border-hairline/60">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white border border-hairline rounded-xl shadow-soft px-8 py-12 md:px-14 md:py-14 flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-8 bg-accent" />
                <span className="font-sans text-eyebrow uppercase tracking-[0.2em] text-accent">
                  Initiate a conversation
                </span>
              </div>
              <h2
                className="font-serif font-semibold text-primary leading-tight"
                style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}
              >
                Ready to navigate Kenya&apos;s regulatory landscape with
                confidence?
              </h2>
            </div>

            <div className="flex flex-col gap-4 md:items-end shrink-0">
              <Button
                onClick={onRequestAccess}
                size="lg"
                id="footer-request-access-btn"
              >
                Request concierge access
                <ArrowRight className="w-4 h-4" />
              </Button>
              <a
                href="mailto:info@mnlegal.net"
                className="font-sans text-caption text-ink-muted underline underline-offset-4 hover:text-accent transition-colors"
              >
                info@mnlegal.net
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer — warm canvas band */}
      <footer className="px-6 md:px-12 py-10 bg-surface-low border-t border-hairline">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-md border border-hairline bg-white">
              <span className="font-serif text-caption text-primary">MN</span>
            </div>
            <div>
              <p className="font-serif text-caption text-primary">
                MN Advocates LLP
              </p>
              <p className="font-sans text-eyebrow text-ink-faint tracking-widest">
                LOCAL EXPERTISE · GLOBAL TALENT
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {NAV_LINKS.map(link =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-eyebrow uppercase text-ink-muted hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-sans text-eyebrow uppercase text-ink-muted hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              )
            )}
          </nav>

          <p className="font-sans text-caption text-ink-faint">
            © {new Date().getFullYear()} MN Advocates LLP. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
