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
    color: 'from-green-500/5 to-transparent',
    iconColor: 'text-green-600',
    iconBg: 'bg-green-500/8 border-green-500/20',
  },
  {
    icon: Landmark,
    title: 'Enterprise AI retrieval',
    description:
      "Documents are indexed inside Google's enterprise AI infrastructure — no third-party embedding services, no export risk. Your corpus stays in one secure environment.",
    tag: 'AI architecture',
    color: 'from-blue-500/5 to-transparent',
    iconColor: 'text-blue-700',
    iconBg: 'bg-blue-500/8 border-blue-500/20',
  },
  {
    icon: Users,
    title: 'Company-scoped isolation',
    description:
      'Each client organisation operates behind Row-Level Security. AI queries are scoped exclusively to your documents — cross-client data leakage is architecturally impossible.',
    tag: 'Data isolation',
    color: 'from-accent/5 to-transparent',
    iconColor: 'text-accent',
    iconBg: 'bg-accent/8 border-accent/20',
  },
  {
    icon: ScrollText,
    title: 'Full audit trail',
    description:
      'Every approval, publication, rejection, login, and document access is logged to an immutable audit table. Regulatory accountability is built in by design.',
    tag: 'Compliance',
    color: 'from-amber-500/5 to-transparent',
    iconColor: 'text-amber-700',
    iconBg: 'bg-amber-500/8 border-amber-500/20',
  },
  {
    icon: Lock,
    title: 'No self-signup architecture',
    description:
      'There is no public registration. Every client account is provisioned directly by an MNL lawyer. The platform cannot be accessed without a formal onboarding relationship.',
    tag: 'Access control',
    color: 'from-primary/5 to-transparent',
    iconColor: 'text-primary',
    iconBg: 'bg-primary/8 border-primary/20',
  },
  {
    icon: Globe2,
    title: 'Jurisdiction-level gating',
    description:
      'Document access is enforced at the SQL row-security level by jurisdiction — not the UI. A client in one regulatory scope cannot see documents outside it.',
    tag: 'Data governance',
    color: 'from-teal-500/5 to-transparent',
    iconColor: 'text-teal-700',
    iconBg: 'bg-teal-500/8 border-teal-500/20',
  },
];

export default function SecuritySection() {
  return (
    <section className="py-24 px-6 md:px-12 bg-canvas border-t border-hairline/60">
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
                className={`group flex flex-col gap-4 bg-white border border-hairline rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated hover:border-accent/15 relative overflow-hidden`}
              >
                {/* Subtle gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${pillar.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <div className="relative flex items-start justify-between">
                  <div className={`w-11 h-11 flex items-center justify-center flex-shrink-0 rounded-lg border ${pillar.iconBg} ${pillar.iconColor} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <span className="font-sans text-eyebrow uppercase tracking-wider text-ink-faint bg-surface px-2 py-0.5 rounded border border-hairline text-[10px]">
                    {pillar.tag}
                  </span>
                </div>

                <div className="relative">
                  <h3 className="text-title text-primary font-sans font-semibold mb-2">
                    {pillar.title}
                  </h3>
                  <p className="font-sans text-body-sm text-ink-muted leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
