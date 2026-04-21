import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight, FileText, FolderOpen, MessageSquare } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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

  const { data: jurisdictionsRaw } = await supabase
    .from('client_jurisdictions')
    .select('jurisdictions ( id, name )')
    .eq('client_id', user!.id)

  const jurisdictions = (jurisdictionsRaw ?? [])
    .map(cj => cj.jurisdictions as unknown as { id: string; name: string })
    .filter(Boolean)

  const [{ data: briefings }, { data: documents }] = await Promise.all([
    supabase
      .from('briefings')
      .select(
        `id, title, content, sent_at,
        jurisdictions ( name )`
      )
      .eq('status', 'sent')
      .order('sent_at', { ascending: false })
      .limit(4),
    supabase
      .from('documents')
      .select(
        `id, title, doc_type, created_at,
        jurisdictions ( name )`
      )
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  const hero = briefings?.[0]
  const otherBriefings = (briefings ?? []).slice(1)

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary tracking-tight mb-2">
          {greeting()}, {profile?.first_name || 'there'}.
        </h1>
        <p className="text-[15px] text-primary/60 leading-relaxed max-w-2xl">
          Your latest regulatory intelligence from MN Legal counsel{' '}
          {company?.name ? `for ${company.name}` : ''}.
        </p>

        {jurisdictions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5">
            {jurisdictions.map(j => (
              <Badge key={j.id} variant="accent">
                {j.name}
              </Badge>
            ))}
          </div>
        )}
      </section>

      {hero && (
        <section>
          <h2 className="text-[11px] font-bold text-primary/40 uppercase tracking-widest mb-4">
            Most recent briefing
          </h2>
          <Link
            href={`/dashboard/briefings/${hero.id}`}
            className="group block"
          >
            <Card className="p-8 hover:border-primary/25 hover:shadow-[0_8px_30px_-10px_rgba(26,39,68,0.1)] transition-all duration-300">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="font-serif text-2xl font-bold text-primary leading-tight group-hover:text-accent transition-colors">
                  {hero.title}
                </h3>
                {(hero.jurisdictions as unknown as { name: string } | null)
                  ?.name && (
                  <Badge variant="accent">
                    {
                      (hero.jurisdictions as unknown as { name: string })
                        .name
                    }
                  </Badge>
                )}
              </div>
              <p className="text-sm text-primary/70 leading-relaxed line-clamp-3 mb-5">
                {hero.content}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-primary/5">
                <span className="text-xs text-primary/50">
                  {hero.sent_at
                    ? new Date(hero.sent_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : ''}
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-1.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  Read analysis <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Card>
          </Link>
        </section>
      )}

      {otherBriefings.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-[11px] font-bold text-primary/40 uppercase tracking-widest">
              Other unread briefings
            </h2>
            <Link
              href="/dashboard/briefings"
              className="text-xs font-semibold text-accent hover:text-accent/80 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherBriefings.map(b => (
              <Link
                key={b.id}
                href={`/dashboard/briefings/${b.id}`}
                className="group"
              >
                <Card className="p-5 h-full hover:border-primary/25 transition-all">
                  <h4 className="font-serif font-semibold text-base text-primary mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                    {b.title}
                  </h4>
                  <p className="text-xs text-primary/60 line-clamp-2 mb-3 leading-relaxed">
                    {b.content}
                  </p>
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-primary/40">
                    {b.sent_at
                      ? new Date(b.sent_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })
                      : ''}
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-[11px] font-bold text-primary/40 uppercase tracking-widest mb-4">
          Ask MN Legal AI
        </h2>
        <Link href="/dashboard/chat" className="group block">
          <Card className="p-6 bg-gradient-to-br from-primary to-primary/90 text-white border-primary hover:shadow-xl transition-all">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-lg font-semibold mb-1">
                  Ask about your regulatory landscape
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Every answer is grounded in documents reviewed by your
                  lawyers at MN Legal.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 mt-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>
      </section>

      {documents && documents.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-[11px] font-bold text-primary/40 uppercase tracking-widest">
              Recent documents
            </h2>
            <Link
              href="/dashboard/documents"
              className="text-xs font-semibold text-accent hover:text-accent/80 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {documents.map(d => {
              const jur = d.jurisdictions as unknown as {
                name: string
              } | null
              return (
                <Link
                  key={d.id}
                  href={`/dashboard/documents/${d.id}`}
                  className="flex items-center gap-4 p-4 bg-white border border-primary/10 rounded-xl hover:border-primary/25 transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                    <FolderOpen className="w-4 h-4 text-primary/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary truncate group-hover:text-accent transition-colors">
                      {d.title}
                    </p>
                    <p className="text-xs text-primary/50 mt-0.5">
                      {jur?.name}
                      {jur?.name && ' · '}
                      {new Date(d.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {(!briefings || briefings.length === 0) &&
        (!documents || documents.length === 0) && (
          <Card className="p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-5">
              <FileText className="w-6 h-6 text-primary/40" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-primary mb-2">
              Your briefings will appear here
            </h3>
            <p className="text-sm text-primary/60 max-w-sm mx-auto leading-relaxed">
              Your legal team will notify you once your first regulatory
              briefing has been approved and sent.
            </p>
          </Card>
        )}
    </div>
  )
}
