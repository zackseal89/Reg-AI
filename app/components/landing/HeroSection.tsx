'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onRequestAccess: () => void;
}

export default function HeroSection({ onRequestAccess }: HeroSectionProps) {
  // Typing simulation state
  const [typingState, setTypingState] = useState<'prompt' | 'loading' | 'response' | 'idle'>('prompt');
  const [promptText, setPromptText] = useState('');
  const [responseText, setResponseText] = useState('');
  const fullPrompt = 'Who is affected by the CBK 2026 VASP circular?';
  const fullResponse = 'Based on CBK Circular No. 7/2026, all Virtual Asset Service Providers (VASPs) operating in Kenya must register and implement enhanced due diligence (KYC/AML) protocols by October 2026.';

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (typingState === 'prompt') {
      if (promptText.length < fullPrompt.length) {
        timer = setTimeout(() => {
          setPromptText(fullPrompt.slice(0, promptText.length + 1));
        }, 50);
      } else {
        timer = setTimeout(() => {
          setTypingState('loading');
        }, 800);
      }
    } else if (typingState === 'loading') {
      timer = setTimeout(() => {
        setTypingState('response');
      }, 1200);
    } else if (typingState === 'response') {
      if (responseText.length < fullResponse.length) {
        timer = setTimeout(() => {
          setResponseText(fullResponse.slice(0, responseText.length + 1));
        }, 20);
      } else {
        timer = setTimeout(() => {
          setTypingState('idle');
        }, 5000);
      }
    } else if (typingState === 'idle') {
      timer = setTimeout(() => {
        setPromptText('');
        setResponseText('');
        setTypingState('prompt');
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [typingState, promptText, responseText]);

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-primary pt-24 md:pt-16">
      {/* Background glow orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-accent/15 blur-[150px]" />
        {/* SVG Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Hairline accent at the base */}
      <div
        className="absolute bottom-0 left-0 w-full h-px z-10"
        style={{
          background: 'linear-gradient(90deg, transparent, #8b1c3f, transparent)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-20 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Content Column */}
        <div className="lg:col-span-7 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-8 backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="font-sans text-[11px] uppercase tracking-widest text-[#d98da4]">
              MNL Advocates LLP · Concierge Compliance
            </span>
          </div>

          <h1
            className="font-serif font-semibold text-white leading-[1.08] mb-6 animate-in fade-in slide-in-from-left-4 duration-500"
            style={{ fontSize: 'clamp(2.75rem, 5.5vw, 4.5rem)' }}
          >
            Regulatory intelligence,{' '}
            <span className="italic text-cream/90 block lg:inline">human-approved.</span>
          </h1>

          <p className="font-sans text-white/85 leading-relaxed mb-6 max-w-xl text-body md:text-[19px] animate-in fade-in slide-in-from-left-6 duration-600">
            East Africa&apos;s regulatory foresight platform. Every briefing,
            every document — reviewed and approved by a practising advocate
            before it reaches your desk.
          </p>

          <p className="font-sans text-caption text-white/50 tracking-widest uppercase mb-12 animate-in fade-in slide-in-from-left-8 duration-700">
            CBK · ODPC · CMA · KRA · CAK
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-6 duration-800">
            <Button
              onClick={onRequestAccess}
              size="lg"
              id="hero-request-access-btn"
              className="group cursor-pointer"
            >
              Request concierge access
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Button>

            <Link href="/login" id="hero-client-login-link" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full">
                Client access
              </Button>
            </Link>
          </div>
        </div>

        {/* Visual Mockup Column */}
        <div className="lg:col-span-5 hidden lg:block animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-elevated w-full max-w-[420px] ml-auto relative group">
            {/* Soft decorative glow behind */}
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 to-white/5 opacity-50 group-hover:opacity-80 transition-opacity" />

            {/* Window Header */}
            <div className="relative flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
              </div>
              <span className="font-sans text-[11px] text-white/40 uppercase tracking-widest font-semibold">
                RegWatch AI Assistant
              </span>
              <div className="w-10" />
            </div>

            {/* Window Content */}
            <div className="relative p-5 flex flex-col gap-4 min-h-[300px] font-sans text-body-sm">
              {/* User message (prompt) */}
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-[10px] text-white/40">User Query</span>
                <div className="bg-accent/90 text-white px-4 py-2.5 rounded-2xl rounded-tr-none max-w-[90%] leading-relaxed border border-white/5 shadow-soft">
                  {promptText}
                  {typingState === 'prompt' && <span className="inline-block w-1.5 h-3.5 bg-white ml-0.5 animate-pulse" />}
                </div>
              </div>

              {/* AI Loading state */}
              {typingState === 'loading' && (
                <div className="flex flex-col items-start gap-1.5 self-start w-full animate-in fade-in duration-200">
                  <span className="text-[10px] text-white/40">RegWatch AI</span>
                  <div className="flex items-center gap-1.5 px-4 py-3 bg-white/5 rounded-2xl rounded-tl-none border border-white/10 text-white/50 shadow-soft">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              {/* AI Response */}
              {(typingState === 'response' || typingState === 'idle') && (
                <div className="flex flex-col items-start gap-2.5 self-start w-full animate-in fade-in duration-300">
                  <span className="text-[10px] text-white/40">RegWatch AI</span>
                  <div className="bg-white/5 text-white/90 px-4 py-3 rounded-2xl rounded-tl-none leading-relaxed border border-white/10 shadow-soft">
                    {responseText}
                    {typingState === 'response' && <span className="inline-block w-1.5 h-3.5 bg-white/80 ml-0.5 animate-pulse" />}
                  </div>

                  {/* Sources Citation */}
                  {responseText.length > 30 && (
                    <div className="mt-1 flex items-center gap-2 self-start animate-in slide-in-from-bottom-2 duration-300">
                      <span className="text-[10px] text-white/40">Approved Source:</span>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 border border-white/10 rounded-md text-white/80 shadow-soft">
                        <ShieldCheck className="w-3.5 h-3.5 text-success" />
                        <span className="text-[11px] font-medium font-serif">CBK Circular 7/2026</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
