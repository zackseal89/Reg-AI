'use client';

import { FaqItem } from '@/components/ui/faq-item';

export default function FaqSection() {
  return (
    <section id="faq" className="py-24 px-6 md:px-12 bg-white border-t border-hairline/60">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-5 justify-center">
            <div className="h-px w-8 bg-accent" />
            <span className="font-sans text-eyebrow uppercase tracking-[0.2em] text-accent">
              Frequently Asked Questions
            </span>
            <div className="h-px w-8 bg-accent" />
          </div>
          <h2
            className="font-serif font-semibold text-primary leading-tight"
            style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.75rem)' }}
          >
            Clear answers, <span className="italic text-ink-muted">transparent process.</span>
          </h2>
        </div>

        <div className="border border-hairline rounded-xl bg-surface divide-y divide-hairline p-6 md:p-8 shadow-soft">
          <FaqItem question="Who is RegWatch designed for?">
            RegWatch is designed for fintech and crypto startups, SMEs, and international organisations operating in Kenya who need to navigate complex, fast-changing regulatory landscapes (such as CBK licensing or ODPC compliance) without the overhead of manual tracking.
          </FaqItem>

          <FaqItem question="What is the role of MNL Advocates in RegWatch?">
            RegWatch is not a generic automated SaaS. It is an extension of MNL Advocates LLP&apos;s legal practice. Every single regulatory briefing, analysis, and circular summary on your dashboard has been reviewed, cross-checked, and approved by a qualified practicing advocate before publication.
          </FaqItem>

          <FaqItem question="How is client data kept secure and isolated?">
            Data security is built into our core database architecture. We enforce strict Row-Level Security (RLS) at the database layer. Your company&apos;s documents are indexed in a dedicated, isolated storage environment. Cross-client data exposure or model leakage is architecturally impossible.
          </FaqItem>

          <FaqItem question="How does the AI search and chat work?">
            When you ask questions in the compliance chat, our RAG pipeline searches the specific documents assigned to your organisation (such as your licences, compliance audits, or relevant circulars) using Google&apos;s enterprise-grade AI. It extracts relevant facts and compiles them with direct citations, ensuring no AI hallucinations.
          </FaqItem>

          <FaqItem question="Can any business sign up immediately?">
            No. To maintain strict professional standards and legal compliance, we do not support open self-registration. Access is restricted to clients of MN Advocates LLP. If you are interested, request concierge access, and a team member will reach out to discuss the onboarding relationship.
          </FaqItem>
        </div>
      </div>
    </section>
  );
}
