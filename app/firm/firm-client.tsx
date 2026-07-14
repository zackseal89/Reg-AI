'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Scale,
  FileSearch,
  PenLine,
  Stamp,
  MessagesSquare,
  ArrowUpRight,
  ShieldCheck,
  UserCheck,
  Lock,
  Mail,
  MapPin,
} from 'lucide-react';
import PageShell from '../components/landing/PageShell';

const PRACTICE_AREAS = [
  'Data Privacy & Protection',
  'Banking, Finance & Fintech Law',
  'Corporate & Commercial Law',
  'Intellectual Property',
  'Litigation & Dispute Resolution',
  'Conveyancing & Property Law',
  'Employment & Labour Law',
];

const FIRM_ROLES = [
  {
    icon: FileSearch,
    title: 'Source & curate',
    detail:
      'MNL advocates monitor the official gazettes, regulator circulars, and policy notices directly from the issuing bodies. Every document that enters RegWatch is selected, verified, and tagged by the legal team; nothing is scraped or ingested automatically.',
  },
  {
    icon: PenLine,
    title: 'Analyse & draft',
    detail:
      'Briefings are drafted by MNL associates with AI-assisted research, translating regulatory instruments into plain-language obligations, deadlines, and action items relevant to each client\'s operations.',
  },
  {
    icon: Stamp,
    title: 'Review & approve',
    detail:
      'No briefing or document reaches a client without a qualified advocate explicitly approving it. The approval is recorded against the advocate\'s name and timestamp, and this gate is enforced at the database layer, not by policy alone.',
  },
  {
    icon: MessagesSquare,
    title: 'Advise beyond the platform',
    detail:
      'When a briefing raises a question the platform cannot answer, clients escalate directly to the firm. RegWatch is the front door to a full legal practice, not a replacement for it.',
  },
];

const ENGAGEMENT_STEPS = [
  {
    step: '01',
    label: 'RegWatch briefing',
    sub: 'Advocate-approved regulatory intelligence, delivered to your dashboard',
  },
  {
    step: '02',
    label: 'AI follow-up',
    sub: 'Clarifying questions answered by AI, scoped to your assigned documents',
  },
  {
    step: '03',
    label: 'Advocate consultation',
    sub: 'Direct access to the MNL team when a matter needs human judgment',
  },
  {
    step: '04',
    label: 'Formal engagement',
    sub: 'Full legal representation and advisory through MNL Advocates LLP',
  },
];

const STANDARDS = [
  {
    icon: UserCheck,
    title: 'Named accountability',
    detail:
      'Every approval on the platform carries the name of the advocate who made it. Accountability is individual and permanent; approvals cannot be edited or deleted after the fact.',
  },
  {
    icon: Lock,
    title: 'Lawyer-led onboarding',
    detail:
      'There is no self-signup. Every client on RegWatch has been onboarded by an MNL advocate, with jurisdiction assignments configured to match their actual regulatory exposure.',
  },
  {
    icon: ShieldCheck,
    title: 'Confidentiality by design',
    detail:
      'Client documents and conversations are isolated per organisation at the database and AI layers. The same duty of confidentiality that governs the firm\'s practice governs the platform.',
  },
];

export default function FirmPageClient() {
  return (
    <PageShell
      eyebrow="The Firm"
      title={<>Built by advocates, <span className="italic text-cream/80">operated as a practice.</span></>}
      subtitle="RegWatch is not a software company's product with lawyers attached. It is MNL Advocates LLP's regulatory practice, delivered through a platform, and every piece of intelligence carries the firm's professional judgment."
    >
      {/* Who MNL is */}
      <section className="py-24 px-6 md:px-12 bg-white border-t border-hairline/60">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-7">
            <Image
              src="/mnl-logo.png"
              alt="MNL Advocates LLP (MN Legal)"
              width={220}
              height={70}
              className="h-12 w-auto mb-8"
            />
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8 bg-accent" />
              <span className="font-sans text-eyebrow uppercase tracking-[0.2em] text-accent">
                MNL Advocates LLP
              </span>
            </div>
            <h2
              className="font-serif font-semibold text-primary leading-tight max-w-2xl"
              style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.75rem)' }}
            >
              A Nairobi law firm, <span className="italic text-ink-muted">fluent in technology.</span>
            </h2>
            <div className="mt-6 flex flex-col gap-4 font-sans text-body-sm text-ink-muted leading-relaxed max-w-xl">
              <p>
                MNL Advocates LLP is a Nairobi-based law firm advising fintech and
                digital-asset businesses, SMEs, and international organisations
                operating in Kenya. The firm&apos;s practice sits at the intersection
                of financial regulation, data protection, and emerging technology.
              </p>
              <p>
                RegWatch grew out of a simple observation from that practice:
                clients don&apos;t just need legal advice when something goes wrong;
                they need to know what changed, what it means for them, and what to
                do about it, continuously. The platform is how the firm delivers
                that watchfulness at scale, without ever removing the advocate from
                the loop.
              </p>
            </div>
            <div className="mt-8">
              <span className="font-sans text-eyebrow uppercase tracking-wider text-ink-faint font-semibold block mb-3">
                The firm&apos;s practice extends well beyond RegWatch
              </span>
              <div className="flex flex-wrap gap-2">
                {PRACTICE_AREAS.map(area => (
                  <span
                    key={area}
                    className="px-3 py-1.5 rounded-full border border-hairline bg-canvas font-sans text-caption text-ink-muted"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
            <a
              href="https://www.mnlegal.net"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 font-sans text-eyebrow uppercase tracking-wider font-semibold text-accent hover:text-primary transition-colors group"
            >
              Visit the firm&apos;s website
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>

          {/* Principle card */}
          <div className="lg:col-span-5">
            <div className="bg-primary rounded-2xl p-8 md:p-10 shadow-soft relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-accent/20 blur-[60px] pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl border border-white/15 bg-white/5 text-[#d98da4] mb-6">
                  <Scale className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <p className="font-serif text-h3 md:text-h2 text-white leading-snug">
                  &ldquo;Nothing reaches a client that a qualified advocate has not
                  read, understood, and put their name to.&rdquo;
                </p>
                <p className="mt-6 font-sans text-caption text-white/50 uppercase tracking-wider">
                  The operating principle behind RegWatch
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The firm's role in the platform */}
      <section className="py-24 px-6 md:px-12 bg-canvas border-t border-hairline/60">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8 bg-accent" />
              <span className="font-sans text-eyebrow uppercase tracking-[0.2em] text-accent">
                The firm&apos;s role
              </span>
            </div>
            <h2
              className="font-serif font-semibold text-primary leading-tight max-w-2xl"
              style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.75rem)' }}
            >
              Where the advocates are, <span className="italic text-ink-muted">at every stage.</span>
            </h2>
            <p className="mt-4 font-sans text-body-sm text-ink-muted max-w-xl leading-relaxed">
              AI accelerates the work, but the firm owns it. These are the four
              places MNL advocates sit inside the RegWatch pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FIRM_ROLES.map(role => {
              const Icon = role.icon;
              return (
                <div
                  key={role.title}
                  className="bg-white border border-hairline rounded-xl p-6 md:p-8 shadow-soft"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl border border-accent/15 bg-accent/5 text-accent mb-5">
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-sans text-h3 font-semibold text-primary mb-3">
                    {role.title}
                  </h3>
                  <p className="font-sans text-body-sm text-ink-muted leading-relaxed">
                    {role.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Engagement continuum */}
      <section className="py-24 px-6 md:px-12 bg-white border-t border-hairline/60">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8 bg-accent" />
              <span className="font-sans text-eyebrow uppercase tracking-[0.2em] text-accent">
                Platform to practice
              </span>
            </div>
            <h2
              className="font-serif font-semibold text-primary leading-tight max-w-2xl"
              style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.75rem)' }}
            >
              One continuum, <span className="italic text-ink-muted">from briefing to counsel.</span>
            </h2>
            <p className="mt-4 font-sans text-body-sm text-ink-muted max-w-xl leading-relaxed">
              RegWatch and the firm are not separate services. A subscription is a
              standing relationship with MNL Advocates LLP; the platform handles the
              continuous monitoring, and the advocates step in wherever a matter
              needs them.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ENGAGEMENT_STEPS.map((item, idx) => (
              <div key={item.step} className="relative">
                <div className="bg-canvas border border-hairline rounded-xl p-6 h-full shadow-soft">
                  <span className="font-serif text-[2.5rem] font-semibold text-primary/10 leading-none select-none block mb-4">
                    {item.step}
                  </span>
                  <h3 className="font-sans text-body font-semibold text-primary mb-2">
                    {item.label}
                  </h3>
                  <p className="font-sans text-caption text-ink-muted leading-relaxed">
                    {item.sub}
                  </p>
                </div>
                {idx < ENGAGEMENT_STEPS.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-[18px] -translate-y-1/2 z-10 text-accent/50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="mt-8 font-sans text-caption text-ink-faint max-w-2xl leading-relaxed">
            RegWatch briefings are regulatory intelligence prepared by the firm for
            its clients. Where a matter requires formal legal advice or
            representation, it is handled through an engagement with MNL Advocates
            LLP in the ordinary course.
          </p>
        </div>
      </section>

      {/* Professional standards */}
      <section className="py-24 px-6 md:px-12 bg-canvas border-t border-hairline/60">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8 bg-accent" />
              <span className="font-sans text-eyebrow uppercase tracking-[0.2em] text-accent">
                Professional standards
              </span>
            </div>
            <h2
              className="font-serif font-semibold text-primary leading-tight max-w-2xl"
              style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.75rem)' }}
            >
              The duties of a law firm, <span className="italic text-ink-muted">built into the software.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STANDARDS.map(item => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white border border-hairline rounded-xl p-6 md:p-8 shadow-soft"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl border border-accent/15 bg-accent/5 text-accent mb-5">
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-sans text-body font-semibold text-primary mb-3">
                    {item.title}
                  </h3>
                  <p className="font-sans text-body-sm text-ink-muted leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <span className="font-sans text-caption text-ink-faint">
              Want the technical detail behind these guarantees?
            </span>
            <Link
              href="/governance"
              className="inline-flex items-center gap-1.5 font-sans text-eyebrow uppercase tracking-wider font-semibold text-accent hover:text-primary transition-colors group"
            >
              Read Security &amp; Governance
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact strip */}
      <section className="py-16 px-6 md:px-12 bg-white border-t border-hairline/60">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl border border-accent/15 bg-accent/5 text-accent shrink-0">
                <MapPin className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div>
                <span className="font-sans text-caption text-ink-faint uppercase tracking-wider block">Office</span>
                <span className="font-sans text-body-sm text-primary font-medium">Nairobi, Kenya</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl border border-accent/15 bg-accent/5 text-accent shrink-0">
                <Mail className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div>
                <span className="font-sans text-caption text-ink-faint uppercase tracking-wider block">Email</span>
                <a href="mailto:info@mnlegal.net" className="font-sans text-body-sm text-primary font-medium hover:text-accent transition-colors">
                  info@mnlegal.net
                </a>
              </div>
            </div>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 font-sans text-eyebrow uppercase tracking-wider font-semibold text-accent hover:text-primary transition-colors group shrink-0"
          >
            Get in touch with the firm
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
