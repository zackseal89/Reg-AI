import type { Metadata } from 'next';
import FirmPageClient from './firm-client';

export const metadata: Metadata = {
  title: 'The Firm Behind RegWatch — MN Advocates LLP',
  description:
    'RegWatch is built and operated by MN Advocates LLP, a Nairobi-based law firm. Every briefing is reviewed and approved by a qualified advocate before it reaches a client — the platform is an extension of the firm\'s legal practice, not a standalone product.',
  alternates: {
    canonical: 'https://www.regwatchmnl.net/firm',
  },
  openGraph: {
    title: 'The Firm Behind RegWatch — MN Advocates LLP',
    description:
      'Qualified advocates source, review, and approve every piece of regulatory intelligence on RegWatch. Learn how the platform integrates with MN Advocates LLP\'s legal practice.',
    url: 'https://www.regwatchmnl.net/firm',
    siteName: 'RegWatch by MN Advocates LLP',
    locale: 'en_KE',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function FirmPage() {
  return <FirmPageClient />;
}
