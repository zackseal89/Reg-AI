const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Document Ingestion',
    description: 'Our team uploads regulatory circulars, gazettes, and policy notices to a secure document store — indexed by jurisdiction.',
  },
  {
    step: '02',
    title: 'AI Analysis',
    description: "Gemini's File Search API extracts, indexes, and connects relevant content across all your assigned documents.",
  },
  {
    step: '03',
    title: 'Lawyer Review',
    description: 'A qualified MN Legal advocate reviews every automated analysis and briefing before it is approved for publication.',
  },
  {
    step: '04',
    title: 'Delivered to You',
    description: 'Approved briefings appear in your RegWatch dashboard — and you can ask follow-up questions via AI chat, scoped only to your documents.',
  },
];

export default function IntelligencePreview() {
  return (
    <section
      className="py-28 px-6 md:px-12 lg:px-20"
      style={{ background: '#1a2744' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-8" style={{ background: '#8b1c3f' }} />
            <span className="font-sans text-xs tracking-[0.25em] uppercase" style={{ color: '#8b1c3f' }}>
              How It Works
            </span>
          </div>
          <h2
            className="font-serif leading-tight max-w-2xl"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#f5f3ef' }}
          >
            Intelligence That Has{' '}
            <span className="italic" style={{ color: 'rgba(245,243,239,0.5)' }}>
              Passed Muster.
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: Process steps */}
          <div className="flex flex-col gap-0">
            {PROCESS_STEPS.map((step, idx) => (
              <div
                key={step.step}
                className="flex gap-6 py-8 group"
                style={{ borderBottom: idx < PROCESS_STEPS.length - 1 ? '1px solid rgba(245,243,239,0.1)' : 'none' }}
              >
                <div
                  className="flex-shrink-0 font-serif text-xs tracking-widest pt-1"
                  style={{ color: '#8b1c3f', minWidth: 28 }}
                >
                  {step.step}
                </div>
                <div>
                  <h3
                    className="font-serif text-lg mb-2"
                    style={{ color: '#f5f3ef' }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="font-sans text-sm leading-relaxed"
                    style={{ color: 'rgba(245,243,239,0.5)' }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Briefing UI mock */}
          <div className="relative">
            {/* Floating card */}
            <div
              className="relative rounded-none p-0 overflow-hidden"
              style={{
                background: '#f5f3ef',
                boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
              }}
            >
              {/* Card top bar */}
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ background: '#1a2744', borderBottom: '1px solid rgba(245,243,239,0.1)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-sans text-xs tracking-widest uppercase" style={{ color: 'rgba(245,243,239,0.5)' }}>
                    Regulatory Briefing
                  </span>
                  <span
                    className="font-sans text-xs px-2 py-0.5 tracking-wider uppercase"
                    style={{ background: '#2D8F5A', color: '#fff' }}
                  >
                    ✓ Approved
                  </span>
                </div>
                <span className="font-sans text-xs" style={{ color: 'rgba(245,243,239,0.3)' }}>
                  CBK · April 2026
                </span>
              </div>

              {/* Card body */}
              <div className="px-6 py-6">
                <h4
                  className="font-serif text-lg mb-1 leading-snug"
                  style={{ color: '#1a2744' }}
                >
                  CBK Circular No. 7/2026: Enhanced Due Diligence for Virtual Asset Service Providers
                </h4>
                <p
                  className="font-sans text-xs mb-4 tracking-wide"
                  style={{ color: 'rgba(26,39,68,0.4)' }}
                >
                  Approved by Advocate M. Ndungu · Sent to your dashboard
                </p>

                {/* Fake content lines */}
                {[85, 92, 78, 66, 90, 55].map((w, i) => (
                  <div
                    key={i}
                    className="h-2 rounded-full mb-2"
                    style={{ width: `${w}%`, background: 'rgba(26,39,68,0.08)' }}
                  />
                ))}

                {/* Tag row */}
                <div className="flex gap-2 mt-5">
                  {['CBK', 'VASP', 'AML', 'KYC'].map(tag => (
                    <span
                      key={tag}
                      className="font-sans text-xs px-2 py-0.5 tracking-wider uppercase"
                      style={{ background: 'rgba(26,39,68,0.07)', color: 'rgba(26,39,68,0.5)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Chat preview strip */}
              <div
                className="px-6 py-4"
                style={{ background: 'rgba(26,39,68,0.04)', borderTop: '1px solid rgba(26,39,68,0.08)' }}
              >
                <p className="font-sans text-xs mb-2" style={{ color: 'rgba(26,39,68,0.4)' }}>
                  Ask RegWatch AI about this briefing…
                </p>
                <div
                  className="flex items-center gap-3 px-4 py-2.5"
                  style={{ background: '#fff', border: '1px solid rgba(26,39,68,0.12)' }}
                >
                  <span className="font-sans text-sm" style={{ color: 'rgba(26,39,68,0.3)' }}>
                    What are the compliance deadlines?
                  </span>
                  <div
                    className="ml-auto flex-shrink-0 w-6 h-6 flex items-center justify-center"
                    style={{ background: '#1a2744', borderRadius: 0 }}
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#f5f3ef" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating approval badge */}
            <div
              className="absolute -top-4 -right-4 px-4 py-2 flex items-center gap-2"
              style={{ background: '#8b1c3f', boxShadow: '0 8px 24px rgba(139,28,63,0.4)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <span className="font-sans text-xs tracking-widest uppercase text-white">
                Human-Approved
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
