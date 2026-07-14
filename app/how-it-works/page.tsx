import type { Metadata } from 'next';
import HowItWorksPageClient from './how-it-works-client';

export const metadata: Metadata = {
  title: 'How RegWatch Works: AI-Powered Intelligence, Human-Approved | MNL Advocates LLP',
  description:
    'Every RegWatch briefing goes through a four-step pipeline: document ingestion, Gemini AI analysis, MNL advocate review, and delivery to your dashboard. No AI output ever reaches a client without a qualified lawyer signing off.',
  alternates: {
    canonical: 'https://www.regwatchmnl.net/how-it-works',
  },
  openGraph: {
    title: 'How RegWatch Works: AI-Powered, Human-Approved',
    description:
      'A four-step pipeline of ingestion, AI analysis, lawyer review, and delivery ensures every briefing is accurate, timely, and approved by a qualified advocate.',
    url: 'https://www.regwatchmnl.net/how-it-works',
    siteName: 'RegWatch by MNL Advocates LLP',
    locale: 'en_KE',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function HowItWorksPage() {
  return <HowItWorksPageClient />;
}
