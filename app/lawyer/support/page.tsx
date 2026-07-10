import { Mail, ScrollText } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { PanelCard } from '@/components/ui/panel-card'
import { FaqItem } from '@/components/ui/faq-item'
import { Button } from '@/components/ui/button'

export default function LawyerSupportPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Support"
        description="Help with the RegWatch workspace and where to escalate platform issues."
      />

      <Card className="mb-6">
        <CardContent className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/8 text-primary flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-title font-serif font-bold text-primary mb-0.5">
                Platform support
              </h3>
              <p className="text-body-sm text-ink-muted">
                For account access, permissions, or bugs, contact MN Legal.
              </p>
            </div>
          </div>
          <a href="mailto:info@mnlegal.net">
            <Button variant="outline">Email us</Button>
          </a>
        </CardContent>
      </Card>

      <PanelCard title="Frequently asked questions" className="mb-6">
        <div className="divide-y divide-hairline/60">
          <FaqItem question="Why can't I see another lawyer's clients?">
            By default, each lawyer only manages their own client portfolio.
            Ask an admin to grant you access if you need visibility into a
            colleague&apos;s clients.
          </FaqItem>
          <FaqItem question="What happens when I approve a briefing?">
            It moves from Draft to Approved and becomes ready to send. Sending
            triggers the client-facing email and marks the briefing Sent —
            these are two separate, deliberate steps.
          </FaqItem>
          <FaqItem question="Why did a briefing email fail to send?">
            Open Audit Logs and filter by &quot;Briefing Email Failed&quot; — the
            details column shows the exact error returned by the email
            provider for that recipient.
          </FaqItem>
          <FaqItem question="How do I unpublish a document?">
            From Documents, open the row&apos;s menu and choose Unpublish. This
            removes it from the client&apos;s AI store immediately; it can be
            republished at any time.
          </FaqItem>
        </div>
      </PanelCard>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <ScrollText className="w-4 h-4 text-ink-faint shrink-0" strokeWidth={1.75} />
          <span className="text-body-sm text-ink-muted">
            Looking for a record of what happened on an account? Audit Logs are
            visible to admins — ask one to look up the entry if you need it.
          </span>
        </div>
      </Card>
    </div>
  )
}
