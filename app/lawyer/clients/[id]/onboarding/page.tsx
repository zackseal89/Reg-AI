import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'

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
    <div className="max-w-5xl">
      <div className="mb-6">
        <Link
          href="/lawyer/clients"
          className="text-[12px] font-bold uppercase tracking-widest text-primary/50 hover:text-accent transition-colors"
        >
          ← Back to Clients
        </Link>
      </div>

      <div className="flex items-center justify-between mb-10 pb-6 border-b border-primary/5">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">Pilot Onboarding</h1>
          <p className="text-[15px] font-sans text-primary/60">
            {client.first_name} {client.last_name}
            {company?.name ? ` · ${company.name}` : ''}
          </p>
          <p className="text-[13px] font-sans text-primary/40 mt-1">{client.email}</p>
        </div>
        <div className="text-right">
          <div className="text-[12px] font-bold uppercase tracking-widest text-primary/50 mb-1">
            Progress
          </div>
          <div className="text-3xl font-serif font-bold text-primary">
            {completedCount}
            <span className="text-primary/30"> / {totalCount}</span>
          </div>
          {allDone && (
            <div className="mt-2 text-[11px] font-bold uppercase tracking-widest text-green-700">
              Ready to go live
            </div>
          )}
        </div>
      </div>

      <ol className="space-y-4">
        {steps.map(step => (
          <li
            key={step.num}
            className={`flex gap-5 p-6 border rounded-2xl bg-white shadow-sm transition-all ${
              step.done ? 'border-green-200/60' : 'border-primary/10'
            }`}
          >
            <div
              className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] ${
                step.done
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-primary/5 text-primary/60 border border-primary/10'
              }`}
            >
              {step.done ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                step.num
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-lg font-semibold text-primary mb-1">{step.title}</h3>
              <p className="text-[14px] font-sans text-primary/60 mb-3 leading-relaxed">
                {step.description}
              </p>
              {!step.done && step.href && step.cta && (
                <Link
                  href={step.href}
                  className="inline-block px-4 py-2 text-[11px] font-bold uppercase tracking-wider bg-primary/5 border border-primary/10 rounded-lg text-primary hover:bg-primary/10 hover:border-primary/20 transition-all"
                >
                  {step.cta}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
