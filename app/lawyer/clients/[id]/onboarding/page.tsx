import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Step = {
  num: number
  title: string
  description: string
  done: boolean
  href?: string
  cta?: string
}

export default async function ClientOnboardingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: clientId } = await params
  const admin = createAdminClient()

  const { data: client } = await admin
    .from('profiles')
    .select('id, first_name, last_name, email, role, company_id, companies ( id, name, sector, gemini_store_name )')
    .eq('id', clientId)
    .eq('role', 'client')
    .maybeSingle()

  if (!client) notFound()

  const company = client.companies as unknown as
    | { id: string; name: string; sector: string | null; gemini_store_name: string | null }
    | null

  const [
    { count: jurisdictionCount },
    { data: assignments },
    { data: authResult },
  ] = await Promise.all([
    admin
      .from('client_jurisdictions')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId),
    admin
      .from('document_assignments')
      .select('document_id, documents!inner ( status )')
      .eq('client_id', clientId),
    admin.auth.admin.getUserById(clientId),
  ])

  const assignedCount = assignments?.length ?? 0
  const publishedCount =
    assignments?.filter(
      a => (a.documents as unknown as { status: string } | null)?.status === 'published'
    ).length ?? 0
  const isActivated = !!authResult.user?.email_confirmed_at

  const steps: Step[] = [
    {
      num: 1,
      title: 'Company profile created',
      description: company
        ? `${company.name}${company.sector ? ` · ${company.sector}` : ''}`
        : 'No company record is linked to this client.',
      done: !!company,
    },
    {
      num: 2,
      title: 'Regulators assigned',
      description:
        jurisdictionCount && jurisdictionCount > 0
          ? `${jurisdictionCount} regulator${jurisdictionCount === 1 ? '' : 's'} linked to this client.`
          : 'No regulators linked. Without jurisdictions, RLS will hide all content from this client.',
      done: !!jurisdictionCount && jurisdictionCount > 0,
      href: '/lawyer/clients',
      cta: 'Manage on Clients page',
    },
    {
      num: 3,
      title: 'Gemini FileSearchStore provisioned',
      description: company?.gemini_store_name
        ? 'Client has a dedicated RAG store. AI chat is wired to it.'
        : 'Store creation failed or was skipped. Chat will not work until a store is attached.',
      done: !!company?.gemini_store_name,
    },
    {
      num: 4,
      title: 'Documents assigned',
      description:
        assignedCount > 0
          ? `${assignedCount} document${assignedCount === 1 ? '' : 's'} assigned to this client.`
          : 'No documents assigned yet.',
      done: assignedCount > 0,
      href: '/lawyer/documents',
      cta: 'Go to Documents',
    },
    {
      num: 5,
      title: 'Documents published',
      description:
        publishedCount > 0
          ? `${publishedCount} of ${assignedCount} assigned document${assignedCount === 1 ? '' : 's'} published to the client's store.`
          : 'Nothing published. Client cannot chat with any regulation until at least one document is published.',
      done: publishedCount > 0,
      href: '/lawyer/documents',
      cta: 'Publish documents',
    },
    {
      num: 6,
      title: 'Client account activated',
      description: isActivated
        ? 'Email is confirmed. Client can sign in.'
        : 'Account is still pending. Use Activate on the Clients page to confirm the email.',
      done: isActivated,
      href: '/lawyer/clients',
      cta: 'Activate client',
    },
  ]

  const completedCount = steps.filter(s => s.done).length
  const totalCount = steps.length
  const allDone = completedCount === totalCount

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Link
          href="/lawyer/clients"
          className="inline-flex items-center gap-1.5 text-eyebrow font-bold uppercase tracking-widest text-ink-muted hover:text-accent transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Clients
        </Link>
      </div>

      <div className="flex items-center justify-between mb-10 pb-6 border-b border-hairline/60">
        <div>
          <h1 className="text-h1 font-serif font-bold text-primary mb-2">
            Pilot Onboarding
          </h1>
          <p className="text-body font-sans text-ink-secondary">
            {client.first_name} {client.last_name}
            {company?.name ? ` · ${company.name}` : ''}
          </p>
          <p className="text-caption font-sans text-ink-faint mt-1">{client.email}</p>
        </div>
        <div className="text-right">
          <div className="text-eyebrow font-bold uppercase tracking-widest text-ink-muted mb-1">
            Progress
          </div>
          <div className="text-h1 font-serif font-bold text-primary">
            {completedCount}
            <span className="text-ink-faint"> / {totalCount}</span>
          </div>
          {allDone && (
            <Badge variant="active" className="mt-2">
              Ready to go live
            </Badge>
          )}
        </div>
      </div>

      <ol className="space-y-4">
        {steps.map(step => (
          <li key={step.num}>
            <Card
              className={cn(
                'flex gap-5 p-6 shadow-soft transition-all',
                step.done && 'border-success/30'
              )}
            >
              <div
                className={cn(
                  'shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-body-sm border',
                  step.done
                    ? 'bg-success/10 text-success border-success/25'
                    : 'bg-primary/5 text-ink-secondary border-hairline'
                )}
              >
                {step.done ? <Check className="w-5 h-5" /> : step.num}
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-title font-bold text-primary mb-1">
                  {step.title}
                </h3>
                <p className="text-body-sm font-sans text-ink-secondary mb-3 leading-relaxed">
                  {step.description}
                </p>
                {!step.done && step.href && step.cta && (
                  <Link href={step.href}>
                    <Button variant="subtle" size="sm">
                      {step.cta}
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          </li>
        ))}
      </ol>
    </div>
  )
}
