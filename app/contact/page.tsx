import type { Metadata } from 'next';
import ContactPageClient from './contact-client';

export const metadata: Metadata = {
  title: 'Contact Us — RegWatch by MN Advocates LLP',
  description:
    'Speak to the MN Advocates LLP team about RegWatch onboarding, regulatory coverage, or an existing engagement. Every enquiry is handled confidentially by the firm in Nairobi, with a response within one business day.',
  alternates: {
    canonical: 'https://www.regwatchmnl.net/contact',
  },
  openGraph: {
    title: 'Contact Us — RegWatch',
    description:
      'Reach the MN Advocates LLP team behind RegWatch. Confidential enquiries, answered within one business day.',
    url: 'https://www.regwatchmnl.net/contact',
    siteName: 'RegWatch by MN Advocates LLP',
    locale: 'en_KE',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
