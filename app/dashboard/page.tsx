import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FileText, FolderOpen, MessageSquare, Globe2, ShieldCheck, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { PanelCard } from '@/components/ui/panel-card'
import { ListRow } from '@/components/ui/list-row'
import { StatCard } from '@/components/ui/stat-card'
import { Button } from '@/components/ui/button'
import { timeAgo } from '@/lib/utils'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default async function DashboardHomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, companies ( name )')
    .eq('id', user!.id)
    .single()

  const company = profile?.companies as unknown as { name: string } | null

  const [
    { data: jurisdictionsRaw },
    { data: briefings, count: briefingsTotal },
    { data: documents, count: documentsTotal },
  ] = await Promise.all([
    supabase
      .from('client_jurisdictions')
      .select('jurisdictions ( id, name )')
      .eq('client_id', user!.id),
    supabase
      .from('briefings')
      .select('id, title, content, sent_at, jurisdictions ( name )', {
        count: 'exact',
      })
      .eq('status', 'sent')
      .order('sent_at', { ascending: false })
      .limit(5),
    supabase
      .from('documents')
      .select('id, title, created_at, jurisdictions ( name )', {
        count: 'exact',
      })
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const jurisdictions = (jurisdictionsRaw ?? [])
    .map(cj => cj.jurisdictions as unknown as { id: string; name: string })
    .filter(Boolean)

  const suggestedPrompts =
    jurisdictions.length > 0
      ? jurisdictions.slice(0, 2).map(j => `${j.name} obligations`)
      : ['Regulatory updates', 'Compliance guidance']
  if (documents && documents.length > 0) {
    suggestedPrompts.push('Recent document summary')
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-h1 font-serif font-bold text-primary tracking-tight">
          {greeting()}, {profile?.first_name || 'there'}.
        </h1>
        <p className="text-body-sm text-ink-muted mt-1.5 max-w-2xl">
          Your regulatory intelligence, lawyer reviewed
          {company?.name ? ` for ${company.name}` : ''}.
        </p>

        {jurisdictions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {jurisdictions.map(j => (
              <Badge key={j.id} variant="accent">
                {j.name}
              </Badge>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <PanelCard
          title="Latest Briefings"
          viewAllHref="/dashboard/briefings"
          className="lg:col-span-2"
        >
          {!briefings || briefings.length === 0 ? (
            <p className="text-body-sm text-ink-muted py-8 text-center">
              Your briefings will appear here once your legal team sends one.
            </p>
          ) : (
            <div className="divide-y divide-hairline/60">
              {briefings.map(b => (
                <ListRow
                  key={b.id}
                  icon={FileText}
                  title={b.title}
                  meta={(b.jurisdictions as unknown as { name: string } | null)?.name}
                  href={`/dashboard/briefings/${b.id}`}
                  right={b.sent_at ? timeAgo(b.sent_at) : undefined}
                />
              ))}
            </div>
          )}
        </PanelCard>

        <PanelCard
          title={
            <span className="flex items-center gap-2">
              Ask RegWatch
              <Badge variant="accent" className="text-[9px]">
                AI
              </Badge>
            </span>
          }
        >
          <div className="flex flex-col h-full">
            <div className="w-10 h-10 rounded-xl bg-primary/8 text-primary flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <p className="text-body-sm text-ink-muted leading-relaxed mb-4">
              Get answers grounded in Kenya law and regulations. All responses
              are lawyer-reviewed.
            </p>
            <Link href="/dashboard/chat">
              <Button variant="outline" className="w-full justify-between mb-4">
                Ask a regulatory question
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {suggestedPrompts.map(prompt => (
                <Link key={prompt} href="/dashboard/chat">
                  <span className="inline-block text-caption font-medium text-primary/80 bg-primary/[0.04] border border-hairline rounded-full px-3 py-1.5 hover:border-accent/30 hover:text-accent transition-colors">
                    {prompt}
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-auto pt-4 border-t border-hairline/60 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-ink-faint shrink-0 mt-0.5" />
              <p className="text-caption text-ink-faint leading-relaxed">
                Built on trusted sources — Kenya laws, regulations, circulars
                and guidance, reviewed by MN Legal.
              </p>
            </div>
          </div>
        </PanelCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <PanelCard title="Your Documents" viewAllHref="/dashboard/documents">
          {!documents || documents.length === 0 ? (
            <p className="text-body-sm text-ink-muted py-8 text-center">
              Published documents will appear here.
            </p>
          ) : (
            <div className="divide-y divide-hairline/60">
              {documents.map(d => (
                <ListRow
                  key={d.id}
                  icon={FolderOpen}
                  title={d.title}
                  meta={(d.jurisdictions as unknown as { name: string } | null)?.name}
                  href={`/dashboard/documents/${d.id}`}
                  right={timeAgo(d.created_at)}
                />
              ))}
            </div>
          )}
        </PanelCard>

        <PanelCard title="Your Jurisdictions">
          {jurisdictions.length === 0 ? (
            <p className="text-body-sm text-ink-muted py-8 text-center">
              No jurisdictions assigned yet.
            </p>
          ) : (
            <div className="divide-y divide-hairline/60">
              {jurisdictions.map(j => (
                <ListRow key={j.id} icon={Globe2} title={j.name} />
              ))}
            </div>
          )}
        </PanelCard>

        <div className="grid grid-rows-2 gap-5">
          <StatCard
            label="Briefings Received"
            value={briefingsTotal ?? 0}
            icon={FileText}
            tone="accent"
            href="/dashboard/briefings"
          />
          <StatCard
            label="Documents Shared"
            value={documentsTotal ?? 0}
            icon={FolderOpen}
            tone="primary"
            href="/dashboard/documents"
          />
        </div>
      </div>
    </div>
  )
}
