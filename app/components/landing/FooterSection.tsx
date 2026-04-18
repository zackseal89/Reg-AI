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
      {/* Pre-footer CTA band */}
      <section
        className="py-24 px-6 md:px-12 lg:px-20 relative overflow-hidden"
        style={{ background: '#1a2744' }}
      >
        {/* Subtle burgundy gradient left accent */}
        <div
          className="absolute left-0 top-0 h-full w-1"
          style={{ background: 'linear-gradient(180deg, transparent, #8b1c3f 50%, transparent)' }}
        />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8" style={{ background: '#8b1c3f' }} />
              <span className="font-sans text-xs tracking-[0.25em] uppercase" style={{ color: '#8b1c3f' }}>
                Initiate a Conversation
              </span>
            </div>
            <h2
              className="font-serif leading-tight"
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', color: '#f5f3ef' }}
            >
              Ready to Navigate Kenya's Regulatory Landscape With Confidence?
            </h2>
          </div>

          <div className="flex flex-col gap-4 md:items-end">
            <button
              onClick={onRequestAccess}
              className="group inline-flex items-center gap-3 px-8 py-4 font-sans text-sm tracking-widest uppercase transition-all duration-200"
              style={{ background: '#8b1c3f', color: '#f5f3ef', letterSpacing: '0.12em' }}
              id="footer-request-access-btn"
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#6e1632'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#8b1c3f'; }}
            >
              Request Concierge Access
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
              </svg>
            </button>
            <a
              href="mailto:info@mnlegal.net"
              className="font-sans text-xs tracking-widest"
              style={{ color: 'rgba(245,243,239,0.4)', borderBottom: '1px solid rgba(245,243,239,0.2)' }}
            >
              info@mnlegal.net
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 md:px-12 lg:px-20 py-10"
        style={{ background: '#0d1729', borderTop: '1px solid rgba(245,243,239,0.07)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Monogram + name */}
          <div className="flex items-center gap-4">
            <div
              className="w-9 h-9 flex items-center justify-center flex-shrink-0"
              style={{ border: '1px solid rgba(245,243,239,0.15)' }}
            >
              <span className="font-serif text-sm" style={{ color: 'rgba(245,243,239,0.6)' }}>MN</span>
            </div>
            <div>
              <p className="font-serif text-sm" style={{ color: 'rgba(245,243,239,0.6)' }}>MN Advocates LLP</p>
              <p className="font-sans text-xs" style={{ color: 'rgba(245,243,239,0.25)', letterSpacing: '0.1em' }}>
                LOCAL EXPERTISE · GLOBAL TALENT
              </p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {NAV_LINKS.map(link => (
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-xs tracking-wider uppercase transition-opacity hover:opacity-100"
                  style={{ color: 'rgba(245,243,239,0.35)', letterSpacing: '0.08em' }}
                >
                  {link.label}
                </a>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-sans text-xs tracking-wider uppercase transition-opacity hover:opacity-100"
                  style={{ color: 'rgba(245,243,239,0.35)', letterSpacing: '0.08em' }}
                >
                  {link.label}
                </a>
              )
            ))}
          </nav>

          {/* Copyright */}
          <p className="font-sans text-xs" style={{ color: 'rgba(245,243,239,0.2)' }}>
            © {new Date().getFullYear()} MN Advocates LLP. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
