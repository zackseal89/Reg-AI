'use client';

import { Upload, Cpu, UserCheck, LayoutDashboard, MessageSquare } from 'lucide-react';
import PageShell from '../components/landing/PageShell';
import IntelligencePreview from '../components/landing/IntelligencePreview';

const STEP_DETAILS = [
  {
    step: '01',
    icon: Upload,
    title: 'Document ingestion',
    summary: 'Our team uploads regulatory circulars, gazettes, and policy notices to a secure document store — indexed by jurisdiction.',
    detail:
      'MNL associates source documents directly from the official gazettes, regulator websites, and legal databases. Supported document types include CBK Circulars, Kenya Gazette Notices, ODPC guidance notes, CMA policy statements, and KRA public rulings. Each document is tagged with its issuing body, publication date, and jurisdiction before being uploaded. Nothing enters the system untagged.',
    techNote: 'Documents are stored in Supabase Storage and processed through the Google Gemini Files API, creating a dedicated FileSearchStore scoped to each client company.',
  },
  {
    step: '02',
    icon: Cpu,
    title: 'AI analysis',
    summary: 'AI-powered search extracts, indexes, and connects relevant content across all your assigned documents.',
    detail:
      'Once a document is uploaded, it is indexed into the client\'s dedicated Gemini FileSearchStore. The AI model can then perform semantic search and retrieval across the entire corpus — finding relevant passages even when the exact wording differs from the query. The system connects obligations, definitions, and effective dates across multiple instruments automatically.',
    techNote: 'Built on Google\'s Gemini 2.5 Flash with File Search (RAG). No manual chunking, no third-party embedding services, no vector database. The model retrieves and generates in a single API call.',
  },
  {
    step: '03',
    icon: UserCheck,
    title: 'Lawyer review',
    summary: 'A qualified MNL advocate reviews every automated analysis and briefing before it is approved for publication.',
    detail:
      'The MNL lawyer review checklist covers: factual accuracy against the primary source document, correct interpretation of legal obligations under Kenyan law, appropriate scope (the client\'s specific jurisdiction assignments), tone and clarity for a non-lawyer audience, and identification of action items with realistic timelines. A briefing cannot leave \'draft\' status without an explicit lawyer approval click — enforced at the database layer.',
    techNote: 'Approval is recorded in the `briefings` table with the approving advocate\'s user ID and timestamp. This entry is immutable — it cannot be altered post-approval.',
  },
  {
    step: '04',
    icon: LayoutDashboard,
    title: 'Delivered to your dashboard',
    summary: 'Approved briefings appear in your RegWatch dashboard — ask follow-up questions via AI chat, scoped only to your documents.',
    detail:
      'Once approved, the briefing is published to the client\'s dashboard and an email notification dispatched via Resend. Clients can read the full briefing, download it, and then ask clarifying questions via the RegWatch AI chat — which is scoped exclusively to documents assigned to their organisation. No cross-client data access is possible.',
    techNote: 'Email delivery uses React Email templates rendered server-side and dispatched via Resend. Chat queries use the same Gemini File Search pipeline as step 02, scoped to the client\'s store.',
  },
];

const TECH_STACK = [
  {
    name: 'Google Gemini 2.5 Flash',
    role: 'AI analysis & RAG pipeline',
    note: 'Enterprise-hosted. Documents never leave Google\'s secure infrastructure.',
  },
  {
    name: 'Supabase (PostgreSQL + Storage)',
    role: 'Database, auth & file storage',
    note: 'Row-Level Security enforces data isolation at the database layer.',
  },
  {
    name: 'Resend + React Email',
    role: 'Briefing delivery & notifications',
    note: 'Transactional email with branded templates for every client communication.',
  },
  {
    name: 'Vercel (Next.js 16)',
    role: 'Frontend & API hosting',
    note: 'Server-side rendering with App Router for performance and SEO.',
  },
];

export default function HowItWorksPageClient() {
  return (
    <PageShell
      eyebrow="How it works"
      title={<>Intelligence that has <span className="italic text-cream/80">passed muster.</span></>}
      subtitle="A four-step pipeline — document ingestion, AI analysis, lawyer review, and client delivery — ensures every briefing is accurate, timely, and approved by a qualified advocate."
    >
      {/* Reused IntelligencePreview with interactive demo */}
      <IntelligencePreview />

      {/* Step-by-step expanded detail */}
      <section className="py-24 px-6 md:px-12 bg-white border-t border-hairline/60">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8 bg-accent" />
              <span className="font-sans text-eyebrow uppercase tracking-[0.2em] text-accent">
                Step by step
              </span>
            </div>
            <h2
              className="font-serif font-semibold text-primary leading-tight max-w-2xl"
              style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.75rem)' }}
            >
              Each step, <span className="italic text-ink-muted">in full detail.</span>
            </h2>
          </div>

          <div className="flex flex-col gap-8">
            {STEP_DETAILS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start"
                >
                  {/* Step number & icon column */}
                  <div className="lg:col-span-2 flex lg:flex-col items-center lg:items-start gap-4 lg:gap-3 pt-1">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl border border-accent/15 bg-accent/5 text-accent shrink-0">
                      <Icon className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <span className="font-serif text-[3rem] font-semibold text-primary/10 leading-none select-none hidden lg:block">
                      {step.step}
                    </span>
                    <span className="font-serif italic text-h2 text-primary/10 lg:hidden">
                      {step.step}
                    </span>
                  </div>

                  {/* Content column */}
                  <div className="lg:col-span-10 bg-white border border-hairline rounded-xl p-6 md:p-8 shadow-soft">
                    <h3 className="font-sans text-h3 font-semibold text-primary mb-3">
                      {step.title}
                    </h3>
                    <p className="font-sans text-body text-ink-muted leading-relaxed mb-6">
                      {step.detail}
                    </p>
                    <div className="flex items-start gap-3 px-4 py-3 bg-primary/[0.03] border border-primary/10 rounded-lg">
                      <div className="w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center">
                        <Cpu className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                      </div>
                      <p className="font-sans text-caption text-ink-muted leading-relaxed">
                        <span className="font-semibold text-primary">Technical note: </span>
                        {step.techNote}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why human review matters */}
      <section className="py-20 px-6 md:px-12 bg-canvas border-t border-hairline/60">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white border border-hairline rounded-xl overflow-hidden shadow-soft grid grid-cols-1 lg:grid-cols-5">
            {/* Dark panel */}
            <div className="lg:col-span-2 bg-primary px-8 py-12 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.06]">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="hiw-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                      <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#hiw-grid)" />
                </svg>
              </div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-px w-6 bg-[#d98da4]" />
                  <span className="font-sans text-eyebrow uppercase tracking-[0.2em] text-[#d98da4]">
                    Core principle
                  </span>
                </div>
                <h3
                  className="font-serif font-semibold text-white leading-tight"
                  style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)' }}
                >
                  Why human review <span className="italic text-cream/80">matters.</span>
                </h3>
              </div>
            </div>

            {/* Content panel */}
            <div className="lg:col-span-3 px-8 py-12 flex flex-col gap-6">
              <p className="font-sans text-body text-ink-muted leading-relaxed">
                AI language models excel at finding, summarising, and connecting regulatory text — but they can hallucinate, misinterpret jurisdiction-specific nuances, or apply the wrong legal standard to a novel fact pattern.
              </p>
              <p className="font-sans text-body text-ink-muted leading-relaxed">
                MNL advocates cross-check every AI-generated briefing against the primary source instrument before it is published. They correct errors, add interpretive context where AI falls short, and flag action items with realistic Kenyan compliance timelines.
              </p>
              <div className="flex items-start gap-4 p-4 bg-accent/5 border border-accent/15 rounded-lg">
                <UserCheck className="w-5 h-5 text-accent mt-0.5 shrink-0" strokeWidth={1.5} />
                <p className="font-sans text-body-sm text-primary font-medium leading-relaxed">
                  No briefing or document ever reaches a client without an explicit approval click from a qualified MNL advocate — enforced at the database level, not just the UI.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech stack transparency */}
      <section className="py-20 px-6 md:px-12 bg-primary border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8 bg-[#d98da4]" />
              <span className="font-sans text-eyebrow uppercase tracking-[0.2em] text-[#d98da4]">
                Technology
              </span>
            </div>
            <h2
              className="font-serif font-semibold text-white leading-tight"
              style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.75rem)' }}
            >
              Enterprise infrastructure, <span className="italic text-cream/80">nothing custom-rolled.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TECH_STACK.map(tech => (
              <div
                key={tech.name}
                className="flex flex-col gap-2 bg-white/5 border border-white/10 rounded-xl px-6 py-5 hover:bg-white/8 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-sans font-semibold text-white text-body-sm">{tech.name}</span>
                  <span className="font-sans text-eyebrow uppercase tracking-wider text-[#d98da4] shrink-0 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    {tech.role}
                  </span>
                </div>
                <p className="font-sans text-body-sm text-white/55 leading-relaxed">{tech.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Chat teaser */}
      <section className="py-20 px-6 md:px-12 bg-canvas border-t border-hairline/60">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="max-w-lg">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8 bg-accent" />
              <span className="font-sans text-eyebrow uppercase tracking-[0.2em] text-accent">
                After delivery
              </span>
            </div>
            <h3
              className="font-serif font-semibold text-primary leading-tight mb-4"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)' }}
            >
              Ask follow-up questions. <span className="italic text-ink-muted">Instantly.</span>
            </h3>
            <p className="font-sans text-body-sm text-ink-muted leading-relaxed">
              Once briefings arrive on your dashboard, RegWatch AI is available for document-scoped chat. Ask about compliance deadlines, affected entities, penalty provisions — all answers drawn only from your organisation&apos;s assigned documents.
            </p>
          </div>

          <div className="w-full md:w-auto shrink-0 flex flex-col gap-3 bg-white border border-hairline rounded-xl p-5 shadow-soft max-w-sm">
            {[
              { q: 'What is the VASP registration deadline?', a: '31 October 2026 per CBK Circular 7/2026.' },
              { q: 'Are crypto wallets covered?', a: 'Yes — custodial wallets fall under VASP definition.' },
            ].map(item => (
              <div key={item.q} className="flex flex-col gap-1.5">
                <div className="self-end bg-primary text-white text-eyebrow rounded-xl rounded-tr-none px-3 py-2 max-w-[85%] leading-relaxed">
                  {item.q}
                </div>
                <div className="self-start bg-surface border border-hairline text-body-sm text-ink-muted rounded-xl rounded-tl-none px-3 py-2 max-w-[90%] leading-relaxed">
                  {item.a}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2 px-3 py-2 bg-surface border border-hairline rounded-lg mt-1">
              <MessageSquare className="w-3.5 h-3.5 text-ink-faint shrink-0" strokeWidth={1.5} />
              <span className="font-sans text-caption text-ink-faint">Ask anything about your briefings…</span>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
