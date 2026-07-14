'use client';

import PageShell from '../components/landing/PageShell';
import SecuritySection from '../components/landing/SecuritySection';

const ACCESS_MATRIX = [
  {
    action: 'Upload regulatory documents',
    admin: true,
    lawyer: true,
    client: false,
  },
  {
    action: 'Approve & publish briefings',
    admin: true,
    lawyer: true,
    client: false,
  },
  {
    action: 'View draft / unapproved content',
    admin: true,
    lawyer: true,
    client: false,
  },
  {
    action: 'View published briefings',
    admin: true,
    lawyer: true,
    client: true,
  },
  {
    action: 'Chat with AI (document-scoped)',
    admin: true,
    lawyer: true,
    client: true,
  },
  {
    action: 'Download assigned documents',
    admin: true,
    lawyer: true,
    client: true,
  },
  {
    action: 'Manage lawyer accounts',
    admin: true,
    lawyer: false,
    client: false,
  },
  {
    action: 'Onboard & manage clients',
    admin: true,
    lawyer: true,
    client: false,
  },
  {
    action: 'View audit logs',
    admin: true,
    lawyer: false,
    client: false,
  },
];

const AUDIT_ENTRIES = [
  {
    timestamp: '2026-07-14  14:23:01 UTC',
    actor: 'Z. Mwangi (Lawyer)',
    action: 'APPROVED briefing',
    detail: '"CBK Circular 7/2026: VASP Due Diligence Requirements"',
    outcome: 'Published',
    outcomeBg: 'bg-green-500/10 text-green-700 border-green-500/20',
  },
  {
    timestamp: '2026-07-14  09:11:44 UTC',
    actor: 'Client (Acme Fintech Ltd)',
    action: 'ACCESSED document',
    detail: '"KRA Digital Services Tax Guidance 2025.pdf"',
    outcome: 'Success',
    outcomeBg: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  },
  {
    timestamp: '2026-07-13  17:58:22 UTC',
    actor: 'Z. Mwangi (Lawyer)',
    action: 'REJECTED briefing',
    detail: '"ODPC Draft Guidance: Returned to draft for revision"',
    outcome: 'Draft',
    outcomeBg: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  },
];

const DATA_FLOW_STEPS = [
  { label: 'Lawyer uploads PDF', sub: 'Supabase Storage', color: 'bg-primary text-white' },
  { label: 'Gemini Files API', sub: 'Google enterprise AI', color: 'bg-blue-700 text-white' },
  { label: 'FileSearchStore', sub: 'Scoped per client', color: 'bg-accent text-white' },
  { label: 'Client AI Chat', sub: 'Document-scoped query', color: 'bg-primary text-white' },
  { label: 'Answer + Citations', sub: 'No cross-client data', color: 'bg-green-700 text-white' },
];

export default function GovernancePageClient() {
  return (
    <PageShell
      eyebrow="Security & Governance"
      title={<>Enterprise-grade, <span className="italic text-cream/80">by design.</span></>}
      subtitle="Every architectural choice in RegWatch was made with one principle: legal intelligence requires the highest standards of access control, auditability, and data isolation."
    >
      {/* Reused SecuritySection */}
      <SecuritySection />

      {/* Data Flow Diagram */}
      <section className="py-24 px-6 md:px-12 bg-white border-t border-hairline/60">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8 bg-accent" />
              <span className="font-sans text-eyebrow uppercase tracking-[0.2em] text-accent">
                Data architecture
              </span>
            </div>
            <h2
              className="font-serif font-semibold text-primary leading-tight max-w-2xl"
              style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.75rem)' }}
            >
              How your data flows, <span className="italic text-ink-muted">and where it stays.</span>
            </h2>
            <p className="mt-4 font-sans text-body-sm text-ink-muted max-w-xl leading-relaxed">
              Documents are uploaded, indexed, queried, and answered entirely within Google&apos;s enterprise AI infrastructure and MNL&apos;s Supabase database. At no point does client data pass through a third-party embedding or retrieval service.
            </p>
          </div>

          {/* Flow diagram */}
          <div className="bg-canvas border border-hairline rounded-2xl p-8 md:p-12 overflow-x-auto">
            <div className="flex flex-col md:flex-row items-center justify-center gap-0 min-w-[500px]">
              {DATA_FLOW_STEPS.map((step, idx) => (
                <div key={step.label} className="flex flex-col md:flex-row items-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className={`${step.color} rounded-xl px-5 py-4 text-center shadow-soft min-w-[140px]`}>
                      <span className="font-sans text-body-sm font-semibold block leading-snug">
                        {step.label}
                      </span>
                      <span className="font-sans text-[10px] font-medium opacity-70 block mt-0.5 tracking-wide uppercase">
                        {step.sub}
                      </span>
                    </div>
                    {/* Step number */}
                    <span className="font-serif text-[10px] font-semibold text-ink-faint uppercase tracking-widest">
                      Step {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  {/* Arrow */}
                  {idx < DATA_FLOW_STEPS.length - 1 && (
                    <div className="flex items-center justify-center my-3 md:my-0 md:mx-3 rotate-90 md:rotate-0">
                      <svg className="w-6 h-6 text-accent/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-4 text-center">
              {[
                { label: 'No third-party embeddings', icon: '🔒' },
                { label: 'No vector database', icon: '🛡️' },
                { label: 'Cross-client isolation guaranteed', icon: '⚔️' },
              ].map(item => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-hairline rounded-full shadow-soft"
                >
                  <span className="text-body">{item.icon}</span>
                  <span className="font-sans text-caption text-primary font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Access Control Matrix */}
      <section className="py-24 px-6 md:px-12 bg-canvas border-t border-hairline/60">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8 bg-accent" />
              <span className="font-sans text-eyebrow uppercase tracking-[0.2em] text-accent">
                Access control
              </span>
            </div>
            <h2
              className="font-serif font-semibold text-primary leading-tight max-w-2xl"
              style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.75rem)' }}
            >
              Who can do what, <span className="italic text-ink-muted">by role.</span>
            </h2>
            <p className="mt-4 font-sans text-body-sm text-ink-muted max-w-xl leading-relaxed">
              Three roles, Admin, Lawyer, and Client, each with a precisely defined permission scope. Enforced at the database row-security level, not the UI.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-hairline shadow-soft bg-white">
            <table className="w-full text-left min-w-[520px]">
              <thead>
                <tr className="border-b border-hairline bg-surface">
                  <th className="px-6 py-4 font-sans text-eyebrow uppercase tracking-wider text-ink-muted font-semibold">
                    Action
                  </th>
                  {['Admin', 'Lawyer', 'Client'].map(role => (
                    <th key={role} className="px-6 py-4 text-center font-sans text-eyebrow uppercase tracking-wider text-ink-muted font-semibold">
                      {role}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline/60">
                {ACCESS_MATRIX.map((row, idx) => (
                  <tr key={row.action} className={idx % 2 === 0 ? 'bg-white' : 'bg-canvas/50'}>
                    <td className="px-6 py-4 font-sans text-body-sm text-primary">
                      {row.action}
                    </td>
                    {[row.admin, row.lawyer, row.client].map((allowed, i) => (
                      <td key={i} className="px-6 py-4 text-center">
                        {allowed ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500/10 border border-green-500/20">
                            <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                          </span>
                        ) : (
                          <span className="font-sans text-body-sm text-ink-faint">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Audit Trail explainer */}
      <section className="py-24 px-6 md:px-12 bg-white border-t border-hairline/60">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8 bg-accent" />
              <span className="font-sans text-eyebrow uppercase tracking-[0.2em] text-accent">
                Audit trail
              </span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <h2
                className="font-serif font-semibold text-primary leading-tight max-w-xl"
                style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.75rem)' }}
              >
                Every action, <span className="italic text-ink-muted">permanently logged.</span>
              </h2>
              <p className="font-sans text-body-sm text-ink-muted max-w-xs leading-relaxed">
                Approvals, rejections, logins, document accesses: all written to an immutable audit table. Accountability is architectural, not optional.
              </p>
            </div>
          </div>

          {/* Mock audit log */}
          <div className="rounded-xl border border-hairline overflow-hidden shadow-soft">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-5 py-3 bg-primary border-b border-white/10">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
              </div>
              <span className="font-sans text-eyebrow uppercase tracking-widest text-white/50">
                Audit Log: RegWatch Platform
              </span>
            </div>
            {/* Header row */}
            <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-surface border-b border-hairline font-sans text-eyebrow uppercase tracking-wider text-ink-faint">
              <span className="col-span-3">Timestamp</span>
              <span className="col-span-3">Actor</span>
              <span className="col-span-4">Action & Subject</span>
              <span className="col-span-2 text-right">Outcome</span>
            </div>
            {/* Entries */}
            {AUDIT_ENTRIES.map((entry, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-hairline/60 last:border-b-0 hover:bg-canvas/50 transition-colors"
              >
                <div className="col-span-3">
                  <span className="font-mono text-caption text-ink-muted">{entry.timestamp}</span>
                </div>
                <div className="col-span-3">
                  <span className="font-sans text-body-sm text-primary font-medium">{entry.actor}</span>
                </div>
                <div className="col-span-4">
                  <span className="font-sans text-caption text-ink-muted font-semibold uppercase tracking-wider block">
                    {entry.action}
                  </span>
                  <span className="font-sans text-caption text-ink-faint italic block mt-0.5 leading-relaxed">
                    {entry.detail}
                  </span>
                </div>
                <div className="col-span-2 flex justify-end items-start">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border font-sans text-eyebrow font-semibold uppercase tracking-wider ${entry.outcomeBg}`}>
                    {entry.outcome}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 font-sans text-caption text-ink-faint text-right">
            Audit entries are immutable; they cannot be edited or deleted after creation.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
