'use client';

import { useState } from 'react';

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

const DEMO_QUESTIONS = [
  {
    id: 'q1',
    question: 'What are the compliance deadlines?',
    answer:
      'VASPs must complete registration by 31 October 2026 and implement enhanced KYC/AML protocols within 90 days of the circular date (i.e. by 30 July 2026).',
    highlight: [0, 1, 2],
  },
  {
    id: 'q2',
    question: 'Does this apply to crypto exchanges?',
    answer:
      'Yes. The circular explicitly covers crypto exchanges and digital asset brokers under the VASP definition, including platforms offering custody, trading, or transfer services.',
    highlight: [1, 2, 3],
  },
  {
    id: 'q3',
    question: 'What penalties apply for non-compliance?',
    answer:
      'Non-compliant VASPs face licence revocation, fines up to KES 1 million per violation, and potential criminal prosecution under Section 57 of the Banking Act.',
    highlight: [3, 4, 5],
  },
];

const BRIEFING_LINES = [85, 92, 78, 66, 90, 55];

export default function IntelligencePreview() {
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [displayedAnswer, setDisplayedAnswer] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleQuestion = (q: typeof DEMO_QUESTIONS[0]) => {
    if (isTyping) return;
    setActiveQuestion(q.id);
    setDisplayedAnswer('');
    setIsTyping(true);

    let i = 0;
    const interval = setInterval(() => {
      if (i < q.answer.length) {
        setDisplayedAnswer(q.answer.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 18);
  };

  const activeQ = DEMO_QUESTIONS.find(q => q.id === activeQuestion);

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
                <div className="flex-shrink-0 min-w-7 pt-0.5">
                  <span className="font-serif text-caption tracking-widest text-accent font-semibold">
                    {step.step}
                  </span>
                </div>
                <div>
                  <h3 className="text-title text-primary mb-1.5 font-sans font-semibold">
                    {step.title}
                  </h3>
                  <p className="font-sans text-body-sm text-ink-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Briefing Demo */}
          <div className="relative">
            <div className="relative rounded-xl overflow-hidden bg-white border border-hairline shadow-elevated">
              {/* Card header */}
              <div className="flex items-center justify-between px-6 py-4 bg-primary">
                <div className="flex items-center gap-3">
                  <span className="font-sans text-eyebrow uppercase tracking-widest text-white/70">
                    Regulatory briefing
                  </span>
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 bg-success text-white font-sans text-eyebrow font-medium">
                    ✓ Approved
                  </span>
                </div>
                <span className="font-sans text-eyebrow text-white/50">
                  CBK · April 2026
                </span>
              </div>

              {/* Briefing content */}
              <div className="px-6 py-6">
                <h4 className="text-title text-primary mb-1 leading-snug font-sans font-semibold">
                  CBK Circular No. 7/2026: Enhanced Due Diligence for Virtual
                  Asset Service Providers
                </h4>
                <p className="font-sans text-caption text-ink-faint mb-5">
                  Approved by your MNL counsel · Sent to your dashboard
                </p>

                <div className="flex flex-col gap-2">
                  {BRIEFING_LINES.map((w, i) => (
                    <div
                      key={i}
                      className={`h-2 rounded-full transition-all duration-500 ${
                        activeQ?.highlight.includes(i)
                          ? 'bg-accent/30 scale-y-[1.4]'
                          : 'bg-primary/[0.07]'
                      }`}
                      style={{ width: `${w}%` }}
                    />
                  ))}
                </div>

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

              {/* Interactive AI chat area */}
              <div className="px-6 py-5 bg-surface border-t border-hairline/70">
                <p className="font-sans text-caption text-ink-muted mb-3 font-medium">
                  Ask RegWatch AI about this briefing:
                </p>

                {/* Demo question buttons */}
                <div className="flex flex-col gap-2 mb-4">
                  {DEMO_QUESTIONS.map(q => (
                    <button
                      key={q.id}
                      onClick={() => handleQuestion(q)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-left transition-all duration-200 cursor-pointer w-full ${
                        activeQuestion === q.id
                          ? 'bg-primary text-white border-primary shadow-soft'
                          : 'bg-white border-hairline text-ink-muted hover:border-accent/30 hover:text-primary hover:bg-cream'
                      }`}
                    >
                      <span className="font-sans text-body-sm leading-snug flex-1">
                        {q.question}
                      </span>
                      <div
                        className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full transition-colors ${
                          activeQuestion === q.id ? 'bg-white/10' : 'bg-accent/10'
                        }`}
                      >
                        <svg
                          className={`w-2.5 h-2.5 ${
                            activeQuestion === q.id ? 'text-white' : 'text-accent'
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
                          />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>

                {/* AI response */}
                {activeQuestion && (
                  <div className="bg-white border border-hairline rounded-lg px-4 py-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 rounded-full bg-accent/10 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      </div>
                      <span className="font-sans text-eyebrow text-accent uppercase tracking-widest font-semibold">
                        RegWatch AI
                      </span>
                    </div>
                    <p className="font-sans text-body-sm text-ink-muted leading-relaxed">
                      {displayedAnswer}
                      {isTyping && (
                        <span className="inline-block w-1 h-3.5 bg-accent ml-0.5 animate-pulse rounded-full" />
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Human-approved badge */}
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
              <span className="font-sans text-eyebrow uppercase tracking-widest text-white font-semibold">
                Human-approved
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
