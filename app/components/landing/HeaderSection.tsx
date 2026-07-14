'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderSectionProps {
  onRequestAccess: () => void;
}

const NAV_ITEMS = [
  { label: 'Coverage', href: '/coverage' },
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Governance', href: '/governance' },
  { label: 'The Firm', href: '/firm' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'Contact', href: '/contact' },
];

export default function HeaderSection({ onRequestAccess }: HeaderSectionProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-30 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/85 backdrop-blur-md border-b border-hairline py-4 shadow-soft'
          : 'bg-primary/95 lg:bg-transparent py-6'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 group text-left cursor-pointer"
        >
          <div
            className={`w-9 h-9 flex items-center justify-center rounded-md border transition-colors ${
              isScrolled
                ? 'border-hairline bg-white text-primary'
                : 'border-white/20 bg-white/5 text-white group-hover:border-[#d98da4]/40'
            }`}
          >
            <span className="font-serif text-caption font-semibold">MN</span>
          </div>
          <div>
            <span
              className={`font-serif text-title tracking-tight font-semibold block leading-none transition-colors ${
                isScrolled ? 'text-primary' : 'text-white'
              }`}
            >
              RegWatch
            </span>
            <span
              className={`font-sans text-[10px] uppercase tracking-widest block mt-0.5 leading-none transition-colors ${
                isScrolled ? 'text-ink-muted' : 'text-white/60'
              }`}
            >
              by MN Advocates
            </span>
          </div>
        </button>

        {/* Navigation Desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`font-sans text-eyebrow uppercase tracking-wider font-medium transition-colors ${
                pathname === item.href
                  ? 'text-accent'
                  : isScrolled
                  ? 'text-ink-muted hover:text-accent'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Action CTAs Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className={`font-sans text-eyebrow uppercase tracking-wider font-semibold transition-colors hover:text-accent ${
              isScrolled ? 'text-primary' : 'text-white'
            }`}
          >
            Client login
          </Link>
          <Button
            onClick={onRequestAccess}
            size="sm"
            variant={isScrolled ? 'primary' : 'secondary'}
            className="group"
          >
            Request Access
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-md transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className={isScrolled ? 'text-primary' : 'text-white'} />
          ) : (
            <Menu className={isScrolled ? 'text-primary' : 'text-white'} />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[77px] bg-white border-b border-hairline shadow-elevated flex flex-col p-6 animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-4 mb-6">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`font-sans text-body-sm uppercase tracking-wider font-medium py-2 transition-colors border-b border-hairline/40 ${
                  pathname === item.href
                    ? 'text-accent'
                    : 'text-ink-muted hover:text-accent'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center font-sans text-body-sm uppercase tracking-wider font-semibold py-2.5 rounded-xs bg-primary/[0.06] text-primary hover:bg-primary/[0.11] transition-colors"
            >
              Client login
            </Link>
            <Button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onRequestAccess();
              }}
              className="w-full justify-center"
            >
              Request concierge access
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
