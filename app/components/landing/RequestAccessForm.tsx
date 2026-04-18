'use client';

import { useState, useEffect, useRef } from 'react';

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
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{ background: 'rgba(10, 16, 33, 0.75)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div
        ref={formRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-form-title"
        className="fixed right-0 top-0 h-full z-50 flex flex-col overflow-y-auto"
        style={{
          width: 'min(520px, 100vw)',
          background: '#f5f3ef',
          boxShadow: '-8px 0 40px rgba(10,16,33,0.35)',
          animation: 'slideIn 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
        `}</style>

        {/* Header */}
        <div
          className="px-10 py-8 flex items-start justify-between"
          style={{ borderBottom: '1px solid #d1cdc5' }}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px w-5" style={{ background: '#8b1c3f' }} />
              <span className="font-sans text-xs tracking-[0.2em] uppercase" style={{ color: '#8b1c3f' }}>
                MN Advocates LLP
              </span>
            </div>
            <h2
              id="request-form-title"
              className="font-serif text-2xl leading-tight"
              style={{ color: '#1a2744' }}
            >
              Initiate a Confidential<br />Access Request
            </h2>
          </div>
          <button
            onClick={onClose}
            className="mt-1 p-2 transition-opacity hover:opacity-60"
            aria-label="Close panel"
            style={{ color: '#1a2744' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-10 py-8">
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                style={{ background: 'rgba(26,39,68,0.08)' }}
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#1a2744" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="font-serif text-2xl mb-3" style={{ color: '#1a2744' }}>Request Received</h3>
              <p className="font-sans text-sm leading-relaxed" style={{ color: 'rgba(26,39,68,0.6)' }}>
                Thank you. A member of the MN Legal team will be in touch within one business day to discuss your onboarding.
              </p>
              <button
                onClick={onClose}
                className="mt-8 px-6 py-3 font-sans text-xs tracking-widest uppercase transition-opacity hover:opacity-70"
                style={{ color: '#8b1c3f', borderBottom: '1px solid #8b1c3f' }}
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-7" noValidate>
              <p className="font-sans text-sm leading-relaxed" style={{ color: 'rgba(26,39,68,0.55)' }}>
                This platform is exclusively available to clients of MN Advocates LLP. Complete the form below and our team will reach out to discuss onboarding.
              </p>

              {/* Name */}
              <div className="flex flex-col gap-1">
                <label htmlFor="req-name" className="font-sans text-xs tracking-widest uppercase" style={{ color: '#1a2744' }}>
                  Full Name <span style={{ color: '#8b1c3f' }}>*</span>
                </label>
                <input
                  ref={firstInputRef}
                  id="req-name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="font-sans text-sm py-3 bg-transparent outline-none"
                  style={{ borderBottom: '1px solid #d1cdc5', color: '#1a2744' }}
                  placeholder="Your full name"
                />
              </div>

              {/* Company */}
              <div className="flex flex-col gap-1">
                <label htmlFor="req-company" className="font-sans text-xs tracking-widest uppercase" style={{ color: '#1a2744' }}>
                  Company / Organisation <span style={{ color: '#8b1c3f' }}>*</span>
                </label>
                <input
                  id="req-company"
                  name="company"
                  type="text"
                  required
                  value={formData.company}
                  onChange={handleChange}
                  className="font-sans text-sm py-3 bg-transparent outline-none"
                  style={{ borderBottom: '1px solid #d1cdc5', color: '#1a2744' }}
                  placeholder="Your company or organisation"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label htmlFor="req-email" className="font-sans text-xs tracking-widest uppercase" style={{ color: '#1a2744' }}>
                  Work Email <span style={{ color: '#8b1c3f' }}>*</span>
                </label>
                <input
                  id="req-email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="font-sans text-sm py-3 bg-transparent outline-none"
                  style={{ borderBottom: '1px solid #d1cdc5', color: '#1a2744' }}
                  placeholder="name@company.com"
                />
              </div>

              {/* Area of Interest */}
              <div className="flex flex-col gap-1">
                <label htmlFor="req-area" className="font-sans text-xs tracking-widest uppercase" style={{ color: '#1a2744' }}>
                  Primary Regulatory Area
                </label>
                <select
                  id="req-area"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className="font-sans text-sm py-3 bg-transparent outline-none appearance-none cursor-pointer"
                  style={{ borderBottom: '1px solid #d1cdc5', color: formData.area ? '#1a2744' : 'rgba(26,39,68,0.4)' }}
                >
                  <option value="">Select an area of interest</option>
                  {AREAS_OF_INTEREST.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1">
                <label htmlFor="req-message" className="font-sans text-xs tracking-widest uppercase" style={{ color: '#1a2744' }}>
                  Brief Context <span className="normal-case opacity-50">(optional)</span>
                </label>
                <textarea
                  id="req-message"
                  name="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleChange}
                  className="font-sans text-sm py-3 bg-transparent outline-none resize-none"
                  style={{ borderBottom: '1px solid #d1cdc5', color: '#1a2744' }}
                  placeholder="Any specific compliance areas or timelines we should know about..."
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="relative flex items-center justify-center gap-2 py-4 font-sans text-sm tracking-widest uppercase transition-all duration-200 mt-2"
                style={{
                  background: '#1a2744',
                  color: '#f5f3ef',
                  opacity: status === 'submitting' ? 0.7 : 1,
                  letterSpacing: '0.12em',
                }}
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
                    Submit Request
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                    </svg>
                  </>
                )}
              </button>

              <p className="font-sans text-xs text-center" style={{ color: 'rgba(26,39,68,0.4)' }}>
                All enquiries are treated with strict confidentiality.
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-10 py-6 flex items-center gap-3"
          style={{ borderTop: '1px solid #d1cdc5' }}
        >
          <div className="flex items-center justify-center w-8 h-8" style={{ border: '1px solid rgba(26,39,68,0.15)', borderRadius: '50%' }}>
            <span className="font-serif text-xs" style={{ color: '#1a2744' }}>MN</span>
          </div>
          <span className="font-sans text-xs" style={{ color: 'rgba(26,39,68,0.4)' }}>
            MN Advocates LLP · Nairobi, Kenya
          </span>
        </div>
      </div>
    </>
  );
}
