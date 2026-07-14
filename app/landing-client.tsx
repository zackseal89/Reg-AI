'use client';

import { useState } from 'react';
import HeaderSection from './components/landing/HeaderSection';
import HeroSection from './components/landing/HeroSection';
import JurisdictionGrid from './components/landing/JurisdictionGrid';
import IntelligencePreview from './components/landing/IntelligencePreview';
import SecuritySection from './components/landing/SecuritySection';
import FaqSection from './components/landing/FaqSection';
import FooterSection from './components/landing/FooterSection';
import RequestAccessForm from './components/landing/RequestAccessForm';

export default function LandingPageClient() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <main className="min-h-screen flex flex-col">
      <HeaderSection onRequestAccess={() => setIsFormOpen(true)} />
      <HeroSection onRequestAccess={() => setIsFormOpen(true)} />
      <div id="coverage" className="scroll-mt-20">
        <JurisdictionGrid />
      </div>
      <div id="how-it-works" className="scroll-mt-20">
        <IntelligencePreview />
      </div>
      <div id="governance" className="scroll-mt-20">
        <SecuritySection />
      </div>
      <FaqSection />
      <FooterSection onRequestAccess={() => setIsFormOpen(true)} />
      <RequestAccessForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </main>
  );
}

