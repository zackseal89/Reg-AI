const JURISDICTIONS = [
  {
    id: 'cbk',
    code: 'CBK',
    name: 'Central Bank of Kenya',
    description:
      'Banking & fintech licensing, forex regulations, payment systems oversight, and prudential requirements.',
    tags: ['Banking', 'Fintech', 'Forex'],
  },
  {
    id: 'odpc',
    code: 'ODPC',
    name: 'Office of the Data Protection Commissioner',
    description:
      "Data localisation, consent frameworks, cross-border transfer rules, and DPA compliance under Kenya's Data Protection Act.",
    tags: ['Privacy', 'Data', 'Compliance'],
  },
  {
    id: 'cma',
    code: 'CMA',
    name: 'Capital Markets Authority',
    description:
      'Securities law, virtual asset regulatory sandbox, collective investment schemes and stockbroker licensing.',
    tags: ['Securities', 'Crypto', 'Markets'],
  },
  {
    id: 'kra',
    code: 'KRA',
    name: 'Kenya Revenue Authority',
    description:
      'Tax compliance updates, digital services tax, transfer pricing, and withholding tax obligations for international entities.',
    tags: ['Tax', 'Compliance'],
  },
  {
    id: 'cak',
    code: 'CAK',
    name: 'Competition Authority',
    description:
      'Merger notifications, anti-competitive practices, and consumer protection standards.',
    tags: ['Competition', 'M&A'],
  },
];

export default function JurisdictionGrid() {
  return (
    <section className="py-24 px-6 md:px-12 bg-surface">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-8 bg-accent" />
            <span className="font-sans text-eyebrow uppercase tracking-[0.2em] text-accent">
              Regulatory coverage
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2
              className="font-serif font-semibold text-primary leading-tight"
              style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.75rem)' }}
            >
              Every regulator.{' '}
              <span className="italic text-ink-muted">One platform.</span>
            </h2>
            <p className="font-sans text-body-sm text-ink-muted max-w-sm leading-relaxed">
              RegWatch monitors and synthesises changes across Kenya&apos;s
              primary regulatory bodies — a single, lawyer-curated view of what
              matters.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {JURISDICTIONS.map(j => (
            <article
              key={j.id}
              className="group flex flex-col bg-white border border-hairline rounded-lg p-6 transition-shadow duration-200 hover:shadow-soft"
            >
              <span className="font-serif text-h1 leading-none text-primary/15 mb-6 select-none">
                {j.code}
              </span>
              <h3 className="text-title text-primary mb-2">{j.name}</h3>
              <p className="font-sans text-body-sm text-ink-muted leading-relaxed mb-5 flex-1">
                {j.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {j.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-hairline bg-surface text-eyebrow text-ink-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 font-sans text-caption text-ink-faint text-right">
          Coverage scope updated continuously · East African focus
        </p>
      </div>
    </section>
  );
}
