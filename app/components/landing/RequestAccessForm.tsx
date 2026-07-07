'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface RequestAccessFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const AREAS_OF_INTEREST = [
  'Central Bank of Kenya (CBK) Compliance',
  'Data Protection & ODPC Compliance',
  'Capital Markets Authority (CMA)',
  'Kenya Revenue Authority (KRA)',
  'Competition Authority of Kenya (CAK)',
  'Fintech / Crypto Regulatory Guidance',
  'General Regulatory Intelligence',
];

export default function RequestAccessForm({ isOpen, onClose }: RequestAccessFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    area: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const formRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus first input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    } else {
      setStatus('idle');
      setFormData({ name: '', company: '', email: '', area: '', message: '' });
    }
  }, [isOpen]);

  // Escape key close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    // Simulate async submission — wire to API route later
    await new Promise(r => setTimeout(r, 1400));
    setStatus('success');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-primary/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div
        ref={formRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-form-title"
        className="fixed right-0 top-0 h-full z-50 flex flex-col overflow-y-auto bg-white shadow-elevated"
        style={{
          width: 'min(520px, 100vw)',
          animation: 'slideIn 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
          @media (prefers-reduced-motion: reduce) {
            [role="dialog"] { animation: none !important; }
          }
        `}</style>

        {/* Header */}
        <div className="px-8 sm:px-10 py-8 flex items-start justify-between border-b border-hairline">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px w-5 bg-accent" />
              <span className="font-sans text-eyebrow uppercase tracking-[0.15em] text-accent">
                MNL Advocates LLP
              </span>
            </div>
            <h2 id="request-form-title" className="text-h3 font-serif text-primary leading-tight">
              Request confidential access
            </h2>
          </div>
          <button
            onClick={onClose}
            className="mt-1 p-2 rounded-md text-ink-muted hover:text-primary hover:bg-primary/5 transition-colors"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-8 sm:px-10 py-8">
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-success/10">
                <Check className="w-8 h-8 text-success" strokeWidth={1.5} />
              </div>
              <h3 className="text-h3 font-serif text-primary mb-3">Request received</h3>
              <p className="font-sans text-body-sm text-ink-muted leading-relaxed max-w-sm">
                Thank you. A member of the MNL team will be in touch within one
                business day to discuss your onboarding.
              </p>
              <Button variant="outline" onClick={onClose} className="mt-8">
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
              <p className="font-sans text-body-sm text-ink-muted leading-relaxed">
                This platform is exclusively available to clients of MNL
                Advocates LLP. Complete the form below and our team will reach
                out to discuss onboarding.
              </p>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="req-name">
                  Full name <span className="text-accent">*</span>
                </Label>
                <Input
                  ref={firstInputRef}
                  id="req-name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="req-company">
                  Company / organisation <span className="text-accent">*</span>
                </Label>
                <Input
                  id="req-company"
                  name="company"
                  type="text"
                  required
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Your company or organisation"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="req-email">
                  Work email <span className="text-accent">*</span>
                </Label>
                <Input
                  id="req-email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="req-area">Primary regulatory area</Label>
                <Select
                  id="req-area"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                >
                  <option value="">Select an area of interest</option>
                  {AREAS_OF_INTEREST.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="req-message">
                  Brief context{' '}
                  <span className="normal-case text-ink-faint">(optional)</span>
                </Label>
                <Textarea
                  id="req-message"
                  name="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleChange}
                  className="min-h-[90px]"
                  placeholder="Any specific compliance areas or timelines we should know about..."
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={status === 'submitting'}
                className="mt-2 w-full"
                id="request-form-submit-btn"
              >
                {status === 'submitting' ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Submitting…
                  </>
                ) : (
                  <>
                    Submit request
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <p className="font-sans text-caption text-ink-faint text-center">
                All enquiries are treated with strict confidentiality.
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 sm:px-10 py-6 flex items-center gap-3 border-t border-hairline bg-surface">
          <div className="flex items-center justify-center w-8 h-8 rounded-full border border-hairline bg-white">
            <span className="font-serif text-eyebrow text-primary">MN</span>
          </div>
          <span className="font-sans text-caption text-ink-muted">
            MNL Advocates LLP · Nairobi, Kenya
          </span>
        </div>
      </div>
    </>
  );
}
