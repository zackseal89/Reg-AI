import { Mail, ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { PanelCard } from '@/components/ui/panel-card'
import { FaqItem } from '@/components/ui/faq-item'
import { Button } from '@/components/ui/button'

export default function ClientSupportPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Support"
        description="Help with your RegWatch portal and how to reach MNL Advocates."
      />

      <Card className="mb-6">
        <CardContent className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/8 text-primary flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-title font-serif font-bold text-primary mb-0.5">
                Contact your legal team
              </h3>
              <p className="text-body-sm text-ink-muted">
                For anything specific to your business, reach MNL Advocates directly.
              </p>
            </div>
          </div>
          <a href="mailto:info@mnlegal.net">
            <Button variant="outline">Email us</Button>
          </a>
        </CardContent>
      </Card>

      <PanelCard title="Frequently asked questions">
        <div className="divide-y divide-hairline/60">
          <FaqItem question="Why can't I see a briefing that's still being drafted?">
            Every briefing is reviewed and approved by a practising advocate
            before it is sent. Drafts and pending approvals are never visible
            on your portal — only briefings your lawyer has explicitly
            approved and sent.
          </FaqItem>
          <FaqItem question="How is my jurisdiction coverage decided?">
            Your lawyer assigns the regulators relevant to your business (for
            example CBK or ODPC) when onboarding you. Your briefings, documents,
            and Ask RegWatch answers are scoped strictly to those jurisdictions.
          </FaqItem>
          <FaqItem question="Is Ask RegWatch a substitute for legal advice?">
            No. Ask RegWatch answers are grounded only in documents MNL Advocates
            has published to your portal, but they are not legal advice for your
            specific circumstances — always confirm with your assigned lawyer
            before acting on anything material.
          </FaqItem>
          <FaqItem question="Can I share my login with a colleague?">
            Accounts are issued per person by your lawyer. Ask your assigned
            lawyer to onboard a colleague separately rather than sharing
            credentials.
          </FaqItem>
        </div>
      </PanelCard>

      <div className="flex items-start gap-2.5 mt-6 px-1">
        <ShieldCheck className="w-4 h-4 text-ink-faint shrink-0 mt-0.5" />
        <p className="text-caption text-ink-faint leading-relaxed">
          RegWatch is not a law firm communication channel for urgent matters.
          For time-sensitive issues, contact your assigned lawyer directly.
        </p>
      </div>
    </div>
  )
}
