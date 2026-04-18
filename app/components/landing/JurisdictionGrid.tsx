const JURISDICTIONS = [
  {
    id: 'cbk',
    code: 'CBK',
    name: 'Central Bank of Kenya',
    description: 'Banking & fintech licensing, forex regulations, payment systems oversight, and prudential requirements.',
    tags: ['Banking', 'Fintech', 'Forex'],
    size: 'large',
  },
  {
    id: 'odpc',
    code: 'ODPC',
    name: 'Office of the Data Protection Commissioner',
    description: "Data localisation, consent frameworks, cross-border transfer rules, and DPA compliance under Kenya's Data Protection Act.",
    tags: ['Privacy', 'Data', 'Compliance'],
    size: 'large',
  },
  {
    id: 'cma',
    code: 'CMA',
    name: 'Capital Markets Authority',
    description: 'Securities law, virtual asset regulatory sandbox, collective investment schemes and stockbroker licensing.',
    tags: ['Securities', 'Crypto', 'Markets'],
    size: 'medium',
  },
  {
    id: 'kra',
    code: 'KRA',
    name: 'Kenya Revenue Authority',
    description: 'Tax compliance updates, digital services tax, transfer pricing, and withholding tax obligations for international entities.',
    tags: ['Tax', 'Compliance'],
    size: 'medium',
  },
  {
    id: 'cak',
    code: 'CAK',
    name: 'Competition Authority',
    description: 'Merger notifications, anti-competitive practices, and consumer protection standards.',
    tags: ['Competition', 'M&A'],
    size: 'small',
  },
];

export default function JurisdictionGrid() {
  return (
    <section
      className="py-28 px-6 md:px-12 lg:px-20"
      style={{ background: '#f5f3ef' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-8" style={{ background: '#8b1c3f' }} />
            <span className="font-sans text-xs tracking-[0.25em] uppercase" style={{ color: '#8b1c3f' }}>
              Regulatory Coverage
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="font-serif leading-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#1a2744' }}>
              Every Regulator.<br />
              <span className="italic" style={{ color: 'rgba(26,39,68,0.5)' }}>One Platform.</span>
            </h2>
            <p className="font-sans text-sm max-w-sm" style={{ color: 'rgba(26,39,68,0.55)', lineHeight: 1.7 }}>
              RegWatch monitors and synthesises changes across Kenya&apos;s primary regulatory bodies, giving your team a single, lawyer-curated view of what matters.
            </p>
          </div>
        </div>

        {/* Bento grid */}
        <div
          className="grid gap-px"
          style={{
            gridTemplateColumns: 'repeat(6, 1fr)',
            gridTemplateRows: 'auto auto',
            background: '#d1cdc5',
          }}
        >
          {JURISDICTIONS.map(j => (
            <JurisdictionCard key={j.id} jurisdiction={j} />
          ))}
        </div>

        {/* Bottom note */}
        <p
          className="mt-6 font-sans text-xs text-right"
          style={{ color: 'rgba(26,39,68,0.35)', letterSpacing: '0.05em' }}
        >
          Coverage scope updated continuously · East African focus
        </p>
      </div>
    </section>
  );
}

function JurisdictionCard({ jurisdiction }: { jurisdiction: typeof JURISDICTIONS[0] }) {
  const colSpan = jurisdiction.size === 'large' ? 3 : jurisdiction.size === 'medium' ? 2 : 2;

  return (
    <div
      className="group relative flex flex-col justify-between p-8 transition-all duration-300 cursor-default"
      style={{
        gridColumn: `span ${colSpan}`,
        background: '#f5f3ef',
        minHeight: 220,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.background = '#1a2744';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.background = '#f5f3ef';
      }}
    >
      {/* Code */}
      <div className="flex items-start justify-between mb-auto">
        <div>
          <span
            className="font-serif text-4xl font-normal leading-none transition-colors duration-300 group-hover:text-white"
            style={{ color: 'rgba(26,39,68,0.15)' }}
          >
            {jurisdiction.code}
          </span>
        </div>
        <svg
          className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-1 group-hover:translate-y-0"
          style={{ color: '#8b1c3f' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
        </svg>
      </div>

      {/* Content */}
      <div className="mt-8">
        <h3
          className="font-serif text-lg mb-2 transition-colors duration-300 group-hover:text-white"
          style={{ color: '#1a2744' }}
        >
          {jurisdiction.name}
        </h3>
        <p
          className="font-sans text-sm leading-relaxed mb-4 transition-colors duration-300 group-hover:text-white/60"
          style={{ color: 'rgba(26,39,68,0.55)' }}
        >
          {jurisdiction.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {jurisdiction.tags.map(tag => (
            <span
              key={tag}
              className="font-sans text-xs px-2 py-0.5 tracking-wider uppercase transition-all duration-300"
              style={{ background: 'rgba(26,39,68,0.07)', color: 'rgba(26,39,68,0.5)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
