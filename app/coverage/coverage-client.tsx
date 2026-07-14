'use client';

import { Landmark, ShieldCheck, TrendingUp, FileText, Scale } from 'lucide-react';
import PageShell from '../components/landing/PageShell';
import JurisdictionGrid from '../components/landing/JurisdictionGrid';

const JURISDICTION_DEEP_DIVES = [
  {
    id: 'cbk',
    code: 'CBK',
    name: 'Central Bank of Kenya',
    icon: Landmark,
    iconColor: 'text-blue-700',
    iconBg: 'bg-blue-500/8 border-blue-500/20',
    what:
      'The CBK licenses and supervises commercial banks, microfinance banks, forex bureaus, payment service providers (PSPs), and Virtual Asset Service Providers (VASPs). It is the primary prudential and consumer protection regulator for Kenya\'s financial sector.',
    obligations: [
      'Licensing and ongoing regulatory capital requirements',
      'Anti-Money Laundering (AML) and Know-Your-Customer (KYC) programmes',
      'Periodic reporting: monthly, quarterly, and annual statutory returns',
      'Consumer complaint handling and dispute resolution frameworks',
      'For VASPs: enhanced due diligence, transaction monitoring, travel rule compliance',
    ],
    instruments: [
      'Banking Act Cap 488 & CBK Act Cap 491',
      'National Payments Systems Act 2011',
      'CBK Prudential Guidelines',
      'CBK VASP Regulatory Framework 2025',
      'CBK Circulars (issued monthly)',
    ],
    frequency: 'High — circulars and guidance issued on average 2–3 times monthly.',
    example: 'CBK Circular No. 7/2026 — Enhanced Due Diligence Requirements for Virtual Asset Service Providers',
  },
  {
    id: 'odpc',
    code: 'ODPC',
    name: 'Office of the Data Protection Commissioner',
    icon: ShieldCheck,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-500/8 border-green-500/20',
    what:
      'The ODPC enforces Kenya\'s Data Protection Act 2019 (DPA). Any business that collects, processes, or stores personal data of Kenyan residents — regardless of where the business is incorporated — is subject to DPA obligations.',
    obligations: [
      'Registration as a Data Controller or Data Processor with the ODPC',
      'Appointment of a Data Protection Officer (DPO) for high-risk processing',
      'Lawful basis for processing personal data (consent, legitimate interest, contract)',
      'Data Transfer Impact Assessments for cross-border transfers',
      'Breach notification to the ODPC within 72 hours of discovery',
      'Data localisation for categories of sensitive personal data',
    ],
    instruments: [
      'Data Protection Act 2019',
      'Data Protection (General) Regulations 2021',
      'Data Protection (Registration of Data Controllers and Processors) Regulations 2021',
      'ODPC Guidance Notes (issued periodically)',
    ],
    frequency: 'Medium — regulations are maturing with new guidance notes and enforcement decisions every quarter.',
    example: 'ODPC Guidance Note on Cross-Border Data Transfers (March 2026)',
  },
  {
    id: 'cma',
    code: 'CMA',
    name: 'Capital Markets Authority',
    icon: TrendingUp,
    iconColor: 'text-accent',
    iconBg: 'bg-accent/8 border-accent/20',
    what:
      'The CMA regulates Kenya\'s capital markets including stockbrokers, fund managers, collective investment schemes, and increasingly, virtual asset exchanges under its regulatory sandbox framework.',
    obligations: [
      'Licensing: stockbroker, investment adviser, fund manager, REIT manager',
      'Prospectus approval for public offers of securities',
      'Continuous disclosure obligations for listed entities',
      'Regulatory sandbox applications for fintech and VASP models',
      'Compliance with CMA Market Conduct Rules and anti-market abuse provisions',
    ],
    instruments: [
      'Capital Markets Act Cap 485A',
      'Capital Markets (Securities) (Public Offers, Listing and Disclosures) Regulations',
      'Capital Markets (Regulatory Sandbox) Guidelines 2019',
      'CMA Digital Asset Exchange Guidance (2025)',
    ],
    frequency: 'Medium-High — active regulatory development, especially in crypto and digital assets space.',
    example: 'CMA Digital Asset Exchange Licensing Framework — Consultation Paper (Q1 2026)',
  },
  {
    id: 'kra',
    code: 'KRA',
    name: 'Kenya Revenue Authority',
    icon: FileText,
    iconColor: 'text-amber-700',
    iconBg: 'bg-amber-500/8 border-amber-500/20',
    what:
      'The KRA administers all national tax obligations including corporate income tax, VAT, withholding tax, and the Digital Service Tax that applies to non-resident digital platform operators.',
    obligations: [
      'Annual corporate tax returns (30% standard rate for resident companies)',
      'Monthly VAT returns and remittance (standard rate 16%)',
      'Withholding Tax on payments to non-residents (dividends, royalties, services)',
      'Digital Services Tax (DST) for non-resident digital marketplace operators',
      'Transfer pricing documentation for related-party transactions',
      'Pay-As-You-Earn (PAYE) returns for employers',
    ],
    instruments: [
      'Income Tax Act Cap 470',
      'Value Added Tax Act 2013',
      'Tax Procedures Act 2015',
      'Digital Service Tax Regulations 2020',
      'Annual Finance Acts (most recently Finance Act 2025)',
    ],
    frequency: 'Medium — annual Finance Acts and periodic practice notes and ruling changes.',
    example: 'Finance Act 2025 — Changes to DST scope and threshold for non-resident platforms',
  },
  {
    id: 'cak',
    code: 'CAK',
    name: 'Competition Authority of Kenya',
    icon: Scale,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/8 border-primary/20',
    what:
      'The CAK enforces Kenya\'s competition law including pre-merger notifications, investigations into anti-competitive conduct, and consumer protection standards across all sectors.',
    obligations: [
      'Pre-merger notification for transactions meeting the notification threshold (KES 1bn combined turnover)',
      'Prohibition on anti-competitive agreements, price fixing, and market sharing',
      'Prohibition on abuse of dominant market position',
      'Consumer protection: misleading advertising, unfair contract terms',
      'Sector-specific market inquiries (the CAK may initiate at any time)',
    ],
    instruments: [
      'Competition Act 2010',
      'Merger Threshold Guidelines 2019',
      'Consumer Protection Act 2012',
      'CAK Sector Inquiries and Determinations',
    ],
    frequency: 'Low-Medium — major merger decisions and occasional guidelines or market inquiries.',
    example: 'CAK Determination on Merger of Two Nairobi Fintech Firms — Q4 2025',
  },
];

const STATS = [
  { value: '100+', label: 'Regulatory instruments tracked', detail: 'Circulars, gazettes, guidance notes, policy statements' },
  { value: '5', label: 'Primary regulatory bodies', detail: 'CBK · ODPC · CMA · KRA · CAK' },
  { value: '24 hrs', label: 'Maximum update lag', detail: 'New instruments indexed within one business day of publication' },
];

export default function CoveragePageClient() {
  return (
    <PageShell
      eyebrow="Regulatory Coverage"
      title={<>Every regulator. <span className="italic text-cream/80">One platform.</span></>}
      subtitle="RegWatch monitors and synthesises changes across Kenya's five primary regulatory bodies — a single, lawyer-curated view of what matters to your business."
    >
      {/* Stats row */}
      <section className="py-14 px-6 md:px-12 bg-primary border-b border-white/10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 rounded-xl overflow-hidden shadow-elevated">
          {STATS.map(stat => (
            <div key={stat.label} className="flex flex-col items-center text-center px-8 py-10 bg-primary">
              <span
                className="font-serif text-white font-semibold mb-1"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
              >
                {stat.value}
              </span>
              <span className="font-sans text-caption font-semibold text-[#d98da4] uppercase tracking-widest mb-2">
                {stat.label}
              </span>
              <span className="font-sans text-eyebrow text-white/50">{stat.detail}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Jurisdiction grid — reused from landing */}
      <JurisdictionGrid />

      {/* Deep Dive Section */}
      <section className="py-24 px-6 md:px-12 bg-white border-t border-hairline/60">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8 bg-accent" />
              <span className="font-sans text-eyebrow uppercase tracking-[0.2em] text-accent">
                Deep dive
              </span>
            </div>
            <h2
              className="font-serif font-semibold text-primary leading-tight max-w-2xl"
              style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.75rem)' }}
            >
              What we monitor, <span className="italic text-ink-muted">regulator by regulator.</span>
            </h2>
          </div>

          <div className="flex flex-col gap-6">
            {JURISDICTION_DEEP_DIVES.map(j => {
              const Icon = j.icon;
              return (
                <details
                  key={j.id}
                  className="group bg-white border border-hairline rounded-xl overflow-hidden transition-shadow duration-200 open:shadow-elevated"
                >
                  <summary className="flex items-center gap-5 px-6 py-5 cursor-pointer list-none hover:bg-canvas transition-colors">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-lg border ${j.iconBg} ${j.iconColor} shrink-0`}>
                      <Icon className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-sans text-eyebrow font-semibold tracking-wider text-ink-muted bg-surface px-2 py-0.5 rounded border border-hairline">
                          {j.code}
                        </span>
                        <h3 className="font-sans text-title font-semibold text-primary">{j.name}</h3>
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-ink-faint shrink-0 transition-transform duration-200 group-open:rotate-180"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </summary>

                  <div className="px-6 pb-8 pt-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: What & Obligations */}
                    <div className="flex flex-col gap-6">
                      <div>
                        <h4 className="font-sans text-caption font-semibold uppercase tracking-wider text-accent mb-2">
                          What they regulate
                        </h4>
                        <p className="font-sans text-body-sm text-ink-muted leading-relaxed">{j.what}</p>
                      </div>
                      <div>
                        <h4 className="font-sans text-caption font-semibold uppercase tracking-wider text-accent mb-3">
                          Typical compliance obligations
                        </h4>
                        <ul className="flex flex-col gap-2">
                          {j.obligations.map(ob => (
                            <li key={ob} className="flex items-start gap-2.5 font-sans text-body-sm text-ink-muted leading-relaxed">
                              <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-accent/50" />
                              {ob}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Right: Instruments, Frequency & Example */}
                    <div className="flex flex-col gap-6">
                      <div>
                        <h4 className="font-sans text-caption font-semibold uppercase tracking-wider text-accent mb-3">
                          Key instruments monitored
                        </h4>
                        <ul className="flex flex-col gap-2">
                          {j.instruments.map(ins => (
                            <li key={ins} className="flex items-start gap-2.5 font-sans text-body-sm text-ink-muted leading-relaxed">
                              <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-primary/30" />
                              {ins}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-sans text-caption font-semibold uppercase tracking-wider text-accent mb-2">
                          Update frequency
                        </h4>
                        <p className="font-sans text-body-sm text-ink-muted leading-relaxed">{j.frequency}</p>
                      </div>
                      <div className="bg-surface border border-hairline rounded-lg p-4">
                        <span className="font-sans text-eyebrow uppercase tracking-wider text-ink-faint block mb-1.5">
                          Example instrument tracked
                        </span>
                        <p className="font-sans text-body-sm text-primary font-medium leading-snug italic">
                          &ldquo;{j.example}&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
