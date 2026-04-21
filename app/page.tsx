import type { Metadata } from 'next';
import LandingPageClient from './landing-client';

export const metadata: Metadata = {
  title: 'RegWatch — Regulatory Intelligence for East Africa | MN Advocates LLP',
  description:
    'The exclusive regulatory intelligence platform for clients of MN Advocates LLP. Navigate Kenya\'s regulatory landscape — CBK, ODPC, CMA — with AI-powered briefings, every one approved by a qualified advocate.',
  keywords: [
    'regulatory intelligence Kenya',
    'CBK compliance',
    'ODPC data protection',
    'fintech regulation Kenya',
    'MN Legal',
    'MN Advocates LLP',
    'East Africa regulatory',
    'legal technology Nairobi',
  ],
  openGraph: {
    title: 'RegWatch — Regulatory Intelligence for East Africa',
    description:
      'AI-powered regulatory briefings, every one approved by a practising advocate. Exclusive to clients of MN Advocates LLP.',
    url: 'https://www.regwatchmnl.net',
    siteName: 'RegWatch by MN Advocates LLP',
    locale: 'en_KE',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://www.regwatchmnl.net',
  },
};

// JSON-LD structured data
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://mnlegal.net/#organization',
      name: 'MN Advocates LLP',
      url: 'https://mnlegal.net',
      sameAs: ['https://www.regwatchmnl.net'],
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Nairobi',
        addressCountry: 'KE',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'info@mnlegal.net',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.regwatchmnl.net/#website',
      url: 'https://www.regwatchmnl.net',
      name: 'RegWatch',
      description: 'Regulatory intelligence platform for East Africa',
      publisher: {
        '@id': 'https://mnlegal.net/#organization',
      },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'RegWatch',
      applicationCategory: 'BusinessApplication',
      description:
        'AI-powered regulatory briefings for fintech and business operating in Kenya, approved by qualified advocates.',
      publisher: {
        '@id': 'https://mnlegal.net/#organization',
      },
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        availability: 'https://schema.org/InvitationOnly',
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPageClient />
    </>
  );
}
