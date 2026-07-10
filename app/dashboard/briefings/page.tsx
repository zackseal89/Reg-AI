import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight, FileText } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
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
    <div className="max-w-5xl mx-auto">
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
        <div className="divide-y divide-hairline">
          {briefings.map((b, idx) => {
            const jurisdiction = b.jurisdictions as unknown as {
              name: string
            } | null
            const jName = jurisdiction?.name || ''
            const preview =
              b.content?.length > 220
                ? b.content.slice(0, 220) + 'â€¦'
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
                className="group block py-7 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-2.5 mb-2.5">
                  {jName && (
                    <span className="text-eyebrow font-semibold uppercase tracking-wider text-accent">
                      {jName}
                    </span>
                  )}
                  {isRecent && (
                    <span className="flex h-1.5 w-1.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-h3 font-semibold text-primary leading-snug tracking-tight max-w-[34ch] mb-2.5 transition-colors duration-200 group-hover:text-accent">
                  {b.title}
                </h3>

                <p className="text-body-sm text-ink-secondary leading-relaxed max-w-[56ch] line-clamp-2 mb-4">
                  {preview}
                </p>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-caption text-ink-faint">
                    {b.sent_at
                      ? new Date(b.sent_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : ''}
                  </span>
                  <span className="text-eyebrow font-semibold uppercase tracking-widest text-ink-faint opacity-0 -translate-x-1 transition-all duration-200 flex items-center gap-1.5 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-accent">
                    Read analysis
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
