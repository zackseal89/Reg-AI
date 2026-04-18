'use client';

import Link from 'next/link';

interface HeroSectionProps {
  onRequestAccess: () => void;
}

export default function HeroSection({ onRequestAccess }: HeroSectionProps) {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0d1729 0%, #1a2744 55%, #1e2f52 100%)' }}
    >
      {/* Hero Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/hero-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
          backgroundRepeat: 'no-repeat',
          opacity: 0.35,
        }}
      />

      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
          opacity: 0.6,
        }}
      />

      {/* Burgundy accent glow */}
      <div
        className="absolute bottom-0 left-0 w-full h-px z-10"
        style={{ background: 'linear-gradient(90deg, transparent, #8b1c3f, transparent)' }}
      />

      {/* Left column grid line accent */}
      <div className="absolute left-0 top-0 h-full w-px opacity-20" style={{ background: 'linear-gradient(180deg, transparent, #8b1c3f 40%, transparent)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-32 w-full">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-8" style={{ background: '#8b1c3f' }} />
            <span
              className="text-xs font-sans tracking-[0.25em] uppercase"
              style={{ color: '#8b1c3f', letterSpacing: '0.25em' }}
            >
              MN Advocates LLP · Regulatory Intelligence
            </span>
          </div>

          {/* Main Headline */}
          <h1
            className="font-serif leading-[1.08] mb-6"
            style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)', color: '#f5f3ef' }}
          >
            Regulatory
            <br />
            Intelligence,{' '}
            <span className="italic" style={{ color: 'rgba(245, 243, 239, 0.65)' }}>
              Human-Approved.
            </span>
          </h1>

          {/* Sub-copy */}
          <p
            className="font-sans leading-relaxed mb-4 max-w-xl"
            style={{ fontSize: 'clamp(1rem, 1.5vw, 1.2rem)', color: 'rgba(245, 243, 239, 0.6)' }}
          >
            East Africa's exclusive regulatory foresight platform. Every briefing, every document — reviewed and approved by a practising advocate before it reaches your desk.
          </p>

          {/* Markets */}
          <p
            className="font-sans text-sm mb-12 tracking-wider uppercase"
            style={{ color: 'rgba(245, 243, 239, 0.35)' }}
          >
            CBK · ODPC · CMA · KRA · CAK
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onRequestAccess}
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 font-sans text-sm font-medium tracking-widest uppercase transition-all duration-300 overflow-hidden"
              style={{
                background: '#8b1c3f',
                color: '#f5f3ef',
                letterSpacing: '0.12em',
              }}
              id="hero-request-access-btn"
            >
              <span className="relative z-10">Request Concierge Access</span>
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: '#6e1632' }}
              />
              <svg className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
              </svg>
            </button>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 font-sans text-sm font-medium tracking-widest uppercase transition-all duration-300"
              style={{
                border: '1px solid rgba(245, 243, 239, 0.2)',
                color: 'rgba(245, 243, 239, 0.7)',
                letterSpacing: '0.12em',
              }}
              id="hero-client-login-link"
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(245,243,239,0.5)';
                (e.currentTarget as HTMLAnchorElement).style.color = '#f5f3ef';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(245,243,239,0.2)';
                (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(245,243,239,0.7)';
              }}
            >
              Client Access
            </Link>
          </div>
        </div>

        {/* Bottom-right credential badge */}
        <div
          className="absolute bottom-12 right-12 hidden lg:flex flex-col items-end gap-1 text-right"
          style={{ color: 'rgba(245,243,239,0.3)' }}
        >
          <span className="font-serif italic text-sm">Local Expertise</span>
          <div className="h-px w-24 ml-auto" style={{ background: 'rgba(245,243,239,0.2)' }} />
          <span className="font-serif italic text-sm">Global Talent</span>
        </div>
      </div>
    </section>
  );
}
