'use client';

import { useState } from 'react';
import { ArrowRight, Check, Mail, MapPin, Clock, ShieldCheck } from 'lucide-react';
import PageShell from '../components/landing/PageShell';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const ENQUIRY_TYPES = [
  'Becoming a RegWatch client',
  'Existing client support',
  'Regulatory coverage question',
  'Partnership or media enquiry',
  'Something else',
];

const CONTACT_CHANNELS = [
  {
    icon: Mail,
    label: 'Email',
    value: 'info@mnlegal.net',
    detail: 'For general and confidential enquiries',
    href: 'mailto:info@mnlegal.net',
  },
  {
    icon: MapPin,
    label: 'Office',
    value: 'Nairobi, Kenya',
    detail: 'MNL Advocates LLP',
  },
  {
    icon: Clock,
    label: 'Response time',
    value: 'Within one business day',
    detail: 'Monday to Friday, 8am–6pm EAT',
  },
];

export default function ContactPageClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organisation: '',
    enquiry: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    // Simulate async submission; wire to API route later
    await new Promise(r => setTimeout(r, 1400));
    setStatus('success');
  };

  return (
    <PageShell
      eyebrow="Contact"
      title={
        <>
          Speak directly with{' '}
          <span className="italic text-white/70">the firm.</span>
        </>
      }
      subtitle="Whether you are exploring RegWatch, an existing client, or a regulator with a question, every enquiry reaches a member of the MNL Advocates team, not a ticketing queue."
    >
      <section className="py-20 px-6 md:px-12 bg-white border-t border-hairline/60">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Contact channels */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8 bg-accent" />
              <span className="font-sans text-eyebrow uppercase tracking-[0.2em] text-accent">
                Direct channels
              </span>
            </div>
            <h2
              className="font-serif font-semibold text-primary leading-tight mb-8"
              style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.1rem)' }}
            >
              A law firm, <span className="italic text-ink-muted">not a call centre.</span>
            </h2>

            <ul className="flex flex-col divide-y divide-hairline border-y border-hairline">
              {CONTACT_CHANNELS.map(channel => (
                <li key={channel.label} className="flex items-start gap-4 py-5">
                  <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-xs bg-primary/[0.06] text-primary">
                    <channel.icon className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-sans text-eyebrow uppercase tracking-wider text-ink-faint">
                      {channel.label}
                    </p>
                    {channel.href ? (
                      <a
                        href={channel.href}
                        className="font-serif text-title text-primary hover:text-accent transition-colors"
                      >
                        {channel.value}
                      </a>
                    ) : (
                      <p className="font-serif text-title text-primary">{channel.value}</p>
                    )}
                    <p className="font-sans text-caption text-ink-muted mt-0.5">
                      {channel.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex items-start gap-3 rounded-xs bg-surface border border-hairline p-5">
              <ShieldCheck className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <p className="font-sans text-caption text-ink-muted leading-relaxed">
                All correspondence is treated under the firm&apos;s duty of
                confidentiality. Nothing you share here creates an
                advocate–client relationship until an engagement is formally
                agreed.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {status === 'success' ? (
              <div
                role="status"
                className="flex flex-col items-center justify-center text-center rounded-xs bg-surface border border-hairline px-8 py-20 h-full"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-success/10">
                  <Check className="w-8 h-8 text-success" strokeWidth={1.5} />
                </div>
                <h3 className="text-h3 font-serif text-primary mb-3">Message received</h3>
                <p className="font-sans text-body-sm text-ink-muted leading-relaxed max-w-sm">
                  Thank you. A member of the MNL Advocates team will respond
                  within one business day.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="rounded-xs bg-surface border border-hairline p-8 md:p-10 flex flex-col gap-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="contact-name">
                      Full name <span className="text-accent">*</span>
                    </Label>
                    <Input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="contact-email">
                      Work email <span className="text-accent">*</span>
                    </Label>
                    <Input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@company.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="contact-organisation">
                      Company / organisation{' '}
                      <span className="normal-case text-ink-faint">(optional)</span>
                    </Label>
                    <Input
                      id="contact-organisation"
                      name="organisation"
                      type="text"
                      value={formData.organisation}
                      onChange={handleChange}
                      placeholder="Your organisation"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="contact-enquiry">
                      Nature of enquiry <span className="text-accent">*</span>
                    </Label>
                    <Select
                      id="contact-enquiry"
                      name="enquiry"
                      required
                      value={formData.enquiry}
                      onChange={handleChange}
                    >
                      <option value="">Select an option</option>
                      {ENQUIRY_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="contact-message">
                    Message <span className="text-accent">*</span>
                  </Label>
                  <Textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="min-h-[130px]"
                    placeholder="Tell us how we can help: regulatory areas, timelines, or anything specific to your situation."
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={status === 'submitting'}
                    className="sm:w-auto w-full group"
                  >
                    {status === 'submitting' ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Sending…
                      </>
                    ) : (
                      <>
                        Send message
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </Button>
                  <p className="font-sans text-caption text-ink-faint">
                    Handled confidentially by MNL Advocates LLP.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
