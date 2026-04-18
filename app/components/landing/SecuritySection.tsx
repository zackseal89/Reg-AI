const TRUST_PILLARS = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.955 11.955 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    title: 'Human Approval Gate',
    description: 'No briefing or document ever reaches a client without explicit approval from a qualified MN Legal advocate. This is enforced at the database level — not just the UI.',
    tag: 'Core Policy',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
      </svg>
    ),
    title: 'Gemini File Search RAG',
    description: "Documents are indexed inside Google's enterprise Gemini File Search API — no third-party embedding services, no export risk. Your corpus stays inside Google's secure infrastructure.",
    tag: 'AI Architecture',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
    title: 'Company-Scoped Isolation',
    description: 'Each client organisation operates inside a dedicated Supabase environment with Row-Level Security. AI queries are scoped exclusively to your documents — cross-client data leakage is architecturally impossible.',
    tag: 'Data Isolation',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
      </svg>
    ),
    title: 'Full Audit Trail',
    description: 'Every approval, publication, rejection, login, and document access is logged to an immutable audit table. Regulatory accountability is built in by design.',
    tag: 'Compliance',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
    title: 'No Self-Signup Architecture',
    description: 'There is no public registration. Every client account is provisioned directly by an MN Legal lawyer. The platform cannot be accessed without a formal onboarding relationship.',
    tag: 'Access Control',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    title: 'Jurisdiction-Level Gating',
    description: 'Document access is enforced at the SQL row security level by jurisdiction — not the UI. A client in one regulatory scope cannot see documents outside it, regardless of how they query.',
    tag: 'Data Governance',
  },
];

export default function SecuritySection() {
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
              Security & Governance
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2
              className="font-serif leading-tight"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#1a2744' }}
            >
              Enterprise-Grade,{' '}
              <span className="italic" style={{ color: 'rgba(26,39,68,0.45)' }}>
                By Design.
              </span>
            </h2>
            <p className="font-sans text-sm max-w-xs" style={{ color: 'rgba(26,39,68,0.5)', lineHeight: 1.7 }}>
              Built around the principle that legal intelligence requires the highest standards of access control and auditability.
            </p>
          </div>
        </div>

        {/* Pillars grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px"
          style={{ background: '#d1cdc5' }}
        >
          {TRUST_PILLARS.map(pillar => (
            <div
              key={pillar.title}
              className="group px-8 py-8 flex flex-col gap-5 transition-all duration-300"
              style={{ background: '#f5f3ef' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.background = '#1a2744';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.background = '#f5f3ef';
              }}
            >
              {/* Icon */}
              <div
                className="w-11 h-11 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:text-white"
                style={{ color: '#8b1c3f', border: '1px solid rgba(139,28,63,0.2)' }}
              >
                {pillar.icon}
              </div>

              {/* Title + tag */}
              <div>
                <span
                  className="font-sans text-xs tracking-widest uppercase transition-colors duration-300 group-hover:text-white/40"
                  style={{ color: 'rgba(26,39,68,0.35)' }}
                >
                  {pillar.tag}
                </span>
                <h3
                  className="font-serif text-lg mt-1 transition-colors duration-300 group-hover:text-white"
                  style={{ color: '#1a2744' }}
                >
                  {pillar.title}
                </h3>
              </div>

              {/* Description */}
              <p
                className="font-sans text-sm leading-relaxed transition-colors duration-300 group-hover:text-white/55"
                style={{ color: 'rgba(26,39,68,0.55)' }}
              >
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
