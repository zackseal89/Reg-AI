import type { Metadata } from 'next';
import GovernancePageClient from './governance-client';

export const metadata: Metadata = {
  title: 'Security & Governance — RegWatch by MN Advocates LLP',
  description:
    'RegWatch is built with enterprise-grade security by design: Row-Level Security, human approval gates, full audit trails, no self-signup, and jurisdiction-level data isolation. Every layer is intentional.',
  alternates: {
    canonical: 'https://www.regwatchmnl.net/governance',
  },
  openGraph: {
    title: 'Security & Governance — RegWatch',
    description:
      'Six enterprise-grade security pillars: human approval gates, data isolation, full audit trails, no self-signup, jurisdiction gating, and Google enterprise AI infrastructure.',
    url: 'https://www.regwatchmnl.net/governance',
    siteName: 'RegWatch by MN Advocates LLP',
    locale: 'en_KE',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function GovernancePage() {
  return <GovernancePageClient />;
}
