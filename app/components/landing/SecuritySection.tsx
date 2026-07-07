import {
  ShieldCheck,
  Landmark,
  Users,
  ScrollText,
  Lock,
  Globe2,
} from 'lucide-react';

const TRUST_PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Human approval gate',
    description:
      'No briefing or document ever reaches a client without explicit approval from a qualified MNL advocate. Enforced at the database level — not just the UI.',
    tag: 'Core policy',
  },
  {
    icon: Landmark,
    title: 'Enterprise AI retrieval',
    description:
      "Documents are indexed inside Google's enterprise AI infrastructure — no third-party embedding services, no export risk. Your corpus stays in one secure environment.",
    tag: 'AI architecture',
  },
  {
    icon: Users,
    title: 'Company-scoped isolation',
    description:
      'Each client organisation operates behind Row-Level Security. AI queries are scoped exclusively to your documents — cross-client data leakage is architecturally impossible.',
    tag: 'Data isolation',
  },
  {
    icon: ScrollText,
    title: 'Full audit trail',
    description:
      'Every approval, publication, rejection, login, and document access is logged to an immutable audit table. Regulatory accountability is built in by design.',
    tag: 'Compliance',
  },
  {
    icon: Lock,
    title: 'No self-signup architecture',
    description:
      'There is no public registration. Every client account is provisioned directly by an MNL lawyer. The platform cannot be accessed without a formal onboarding relationship.',
    tag: 'Access control',
  },
  {
    icon: Globe2,
    title: 'Jurisdiction-level gating',
    description:
      'Document access is enforced at the SQL row-security level by jurisdiction — not the UI. A client in one regulatory scope cannot see documents outside it.',
    tag: 'Data governance',
  },
];

export default function SecuritySection() {
  return (
    <section className="py-24 px-6 md:px-12 bg-surface border-t border-hairline/60">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-8 bg-accent" />
            <span className="font-sans text-eyebrow uppercase tracking-[0.2em] text-accent">
              Security &amp; governance
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2
              className="font-serif font-semibold text-primary leading-tight"
              style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.75rem)' }}
            >
              Enterprise-grade,{' '}
              <span className="italic text-ink-muted">by design.</span>
            </h2>
            <p className="font-sans text-body-sm text-ink-muted max-w-xs leading-relaxed">
              Built around the principle that legal intelligence requires the
              highest standards of access control and auditability.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TRUST_PILLARS.map(pillar => {
            const Icon = pillar.icon;
            return (
              <article
                key={pillar.title}
                className="flex flex-col gap-5 bg-white border border-hairline rounded-lg p-6 transition-shadow duration-200 hover:shadow-soft"
              >
                <div className="w-11 h-11 flex items-center justify-center flex-shrink-0 rounded-md border border-accent/20 text-accent">
                  <Icon className="w-5 h-5" strokeWidth={1.75} />
                </div>

                <div>
                  <span className="font-sans text-eyebrow uppercase text-ink-faint">
                    {pillar.tag}
                  </span>
                  <h3 className="text-title text-primary mt-1">
                    {pillar.title}
                  </h3>
                </div>

                <p className="font-sans text-body-sm text-ink-muted leading-relaxed">
                  {pillar.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
