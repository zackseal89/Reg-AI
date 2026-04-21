import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight, FileText } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'

export default async function ClientBriefingsPage() {
  const supabase = await createClient()
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now()

  const { data: briefings } = await supabase
    .from('briefings')
    .select(
      `id, title, content, status, created_at, sent_at,
      jurisdictions ( name )`
    )
    .eq('status', 'sent')
    .order('sent_at', { ascending: false })

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Briefings"
        description="Exclusive regulatory intelligence and foresight prepared directly by your MN Legal counsel."
      />

      {!briefings || briefings.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-6 h-6" />}
          title="No briefings yet"
          description="Your legal team will notify you when new regulatory insights are distributed."
        />
      ) : (
        <div className="space-y-4">
          {briefings.map((b, idx) => {
            const jurisdiction = b.jurisdictions as unknown as {
              name: string
            } | null
            const jName = jurisdiction?.name || ''
            const preview =
              b.content?.length > 200
                ? b.content.slice(0, 200) + '…'
                : b.content

            const isRecent =
              idx === 0 &&
              b.sent_at &&
              now - new Date(b.sent_at).getTime() <
                7 * 24 * 60 * 60 * 1000

            return (
              <Link
                key={b.id}
                href={`/dashboard/briefings/${b.id}`}
                className="group relative flex overflow-hidden bg-white border border-primary/10 rounded-2xl transition-all duration-300 hover:border-accent/30 hover:shadow-[0_8px_30px_-10px_rgba(26,39,68,0.1)]"
              >
                <div className="w-1 shrink-0 bg-accent opacity-0 translate-x-[-100%] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out" />

                <div className="flex-1 px-6 py-5 transition-transform duration-300 group-hover:translate-x-1">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="font-serif font-bold text-xl leading-snug tracking-tight text-primary flex-1 group-hover:text-accent transition-colors duration-300">
                      {b.title}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0 pt-1">
                      {isRecent && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                        </span>
                      )}
                      {jName && <Badge variant="accent">{jName}</Badge>}
                    </div>
                  </div>

                  <p className="text-[14px] text-primary/70 leading-relaxed line-clamp-2 mb-4">
                    {preview}
                  </p>

                  <div className="flex items-center justify-between border-t border-primary/5 pt-3">
                    <span className="text-[11px] text-primary/40 font-semibold tracking-wider uppercase">
                      {b.sent_at
                        ? new Date(b.sent_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : ''}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-accent opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 flex items-center gap-1.5">
                      Read analysis
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
