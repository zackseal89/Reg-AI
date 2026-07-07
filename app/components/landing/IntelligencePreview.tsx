const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Document ingestion',
    description:
      'Our team uploads regulatory circulars, gazettes, and policy notices to a secure document store — indexed by jurisdiction.',
  },
  {
    step: '02',
    title: 'AI analysis',
    description:
      'AI-powered search extracts, indexes, and connects relevant content across all your assigned documents.',
  },
  {
    step: '03',
    title: 'Lawyer review',
    description:
      'A qualified MNL advocate reviews every automated analysis and briefing before it is approved for publication.',
  },
  {
    step: '04',
    title: 'Delivered to you',
    description:
      'Approved briefings appear in your RegWatch dashboard — ask follow-up questions via AI chat, scoped only to your documents.',
  },
];

export default function IntelligencePreview() {
  return (
    <section className="py-24 px-6 md:px-12 bg-surface border-t border-hairline/60">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-8 bg-accent" />
            <span className="font-sans text-eyebrow uppercase tracking-[0.2em] text-accent">
              How it works
            </span>
          </div>
          <h2
            className="font-serif font-semibold text-primary leading-tight max-w-2xl"
            style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.75rem)' }}
          >
            Intelligence that has{' '}
            <span className="italic text-ink-muted">passed muster.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
          {/* Process steps */}
          <div className="flex flex-col">
            {PROCESS_STEPS.map((step, idx) => (
              <div
                key={step.step}
                className={`flex gap-6 py-7 ${
                  idx < PROCESS_STEPS.length - 1
                    ? 'border-b border-hairline/70'
                    : ''
                }`}
              >
                <span className="flex-shrink-0 font-serif text-caption tracking-widest text-accent pt-1 min-w-7">
                  {step.step}
                </span>
                <div>
                  <h3 className="text-title text-primary mb-1.5">
                    {step.title}
                  </h3>
                  <p className="font-sans text-body-sm text-ink-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Briefing mock */}
          <div className="relative">
            <div className="relative rounded-xl overflow-hidden bg-white border border-hairline shadow-elevated">
              <div className="flex items-center justify-between px-6 py-4 bg-primary">
                <div className="flex items-center gap-3">
                  <span className="font-sans text-eyebrow uppercase tracking-widest text-white/70">
                    Regulatory briefing
                  </span>
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 bg-success text-white font-sans text-eyebrow">
                    ✓ Approved
                  </span>
                </div>
                <span className="font-sans text-eyebrow text-white/50">
                  CBK · April 2026
                </span>
              </div>

              <div className="px-6 py-6">
                <h4 className="text-title text-primary mb-1 leading-snug">
                  CBK Circular No. 7/2026: Enhanced Due Diligence for Virtual
                  Asset Service Providers
                </h4>
                <p className="font-sans text-caption text-ink-faint mb-5">
                  Approved by your MNL counsel · Sent to your dashboard
                </p>

                {[85, 92, 78, 66, 90, 55].map((w, i) => (
                  <div
                    key={i}
                    className="h-2 rounded-full mb-2 bg-primary/[0.07]"
                    style={{ width: `${w}%` }}
                  />
                ))}

                <div className="flex gap-2 mt-5">
                  {['CBK', 'VASP', 'AML', 'KYC'].map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-hairline bg-surface text-eyebrow text-ink-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="px-6 py-4 bg-surface border-t border-hairline/70">
                <p className="font-sans text-caption text-ink-muted mb-2">
                  Ask RegWatch AI about this briefing…
                </p>
                <div className="flex items-center gap-3 px-4 py-2.5 bg-white border border-hairline rounded-md">
                  <span className="font-sans text-body-sm text-ink-faint">
                    What are the compliance deadlines?
                  </span>
                  <div className="ml-auto flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-accent">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -right-3 px-4 py-2 flex items-center gap-2 rounded-full bg-accent shadow-elevated">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="white"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
              <span className="font-sans text-eyebrow uppercase tracking-widest text-white">
                Human-approved
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
