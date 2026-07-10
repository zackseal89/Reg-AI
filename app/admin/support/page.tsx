import { Mail, ScrollText } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { PanelCard } from '@/components/ui/panel-card'
import { FaqItem } from '@/components/ui/faq-item'
import { Button } from '@/components/ui/button'

export default function AdminSupportPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Support"
        description="Platform administration references and where to escalate issues."
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
                For infrastructure, billing, or account escalations, contact MN Legal.
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
          <FaqItem question="Where do I check why a briefing email failed to send?">
            Audit Logs, filtered by &quot;Briefing Email Failed&quot;. The details
            column shows the exact error the email provider returned for that
            recipient — most commonly a sandbox or unverified-domain restriction.
          </FaqItem>
          <FaqItem question="How do I deactivate a lawyer or suspend a client?">
            From Lawyers or Clients, use the row&apos;s actions menu. Deactivating
            a lawyer revokes their sign-in without deleting their history;
            reactivating restores it.
          </FaqItem>
          <FaqItem question="Admin pages are throwing 'supabaseKey is required' — why?">
            The server-role Supabase client couldn&apos;t find
            <code className="mx-1 px-1.5 py-0.5 rounded bg-primary/[0.05] text-caption">
              SUPABASE_SERVICE_ROLE_KEY
            </code>
            in the environment. Add it to the deployment&apos;s environment
            variables from Supabase → Project Settings → API.
          </FaqItem>
          <FaqItem question="What sends the client onboarding invite email?">
            Supabase Auth&apos;s built-in invite mechanism — a separate pipeline
            from the Resend-based briefing notifications, so a working briefing
            send doesn&apos;t guarantee onboarding invites are delivering too.
          </FaqItem>
        </div>
      </PanelCard>

      <Link href="/admin/audit-logs">
        <Card className="p-4 hover:border-primary/20 hover:shadow-soft transition-all duration-200">
          <div className="flex items-center gap-3">
            <ScrollText className="w-4 h-4 text-ink-faint shrink-0" strokeWidth={1.75} />
            <span className="text-body-sm text-ink-muted">
              Go to Audit Logs to review every significant action on the
              platform, filterable by action and user.
            </span>
          </div>
        </Card>
      </Link>
    </div>
  )
}
