'use client';

import { useState } from 'react';
import HeroSection from './components/landing/HeroSection';
import JurisdictionGrid from './components/landing/JurisdictionGrid';
import IntelligencePreview from './components/landing/IntelligencePreview';
import SecuritySection from './components/landing/SecuritySection';
import FooterSection from './components/landing/FooterSection';
import RequestAccessForm from './components/landing/RequestAccessForm';

export default function LandingPageClient() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <main className="min-h-screen flex flex-col">
      <HeroSection onRequestAccess={() => setIsFormOpen(true)} />
      <JurisdictionGrid />
      <IntelligencePreview />
      <SecuritySection />
      <FooterSection onRequestAccess={() => setIsFormOpen(true)} />
      <RequestAccessForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </main>
  );
}
