import type { Metadata } from 'next';
import CoveragePageClient from './coverage-client';

export const metadata: Metadata = {
  title: 'Regulatory Coverage — RegWatch by MN Advocates LLP',
  description:
    'RegWatch monitors CBK, ODPC, CMA, KRA, and CAK — all five of Kenya\'s primary regulators. One platform, lawyer-curated, updated within 24 hours of every gazette notice.',
  alternates: {
    canonical: 'https://www.regwatchmnl.net/coverage',
  },
  openGraph: {
    title: 'Regulatory Coverage — RegWatch',
    description:
      'Comprehensive monitoring of Kenya\'s five primary regulators — CBK, ODPC, CMA, KRA, and CAK — in a single lawyer-curated platform.',
    url: 'https://www.regwatchmnl.net/coverage',
    siteName: 'RegWatch by MN Advocates LLP',
    locale: 'en_KE',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function CoveragePage() {
  return <CoveragePageClient />;
}
