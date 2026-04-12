import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ClientBriefingsPage() {
  const supabase = await createClient()

  const { data: briefings } = await supabase
    .from('briefings')
    .select(`
      id, title, content, status, created_at, sent_at,
      jurisdictions ( name )
    `)
    .eq('status', 'sent')
    .order('sent_at', { ascending: false })

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-serif font-semibold mb-1">Briefings</h1>
      <p className="text-sm text-primary/60 mb-6">Latest regulatory updates from your legal team.</p>

      {(!briefings || briefings.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-primary/30">
              <path d="M3 9h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path d="M3 9l9-6 9 6" />
            </svg>
          </div>
          <p className="text-primary/50 text-sm max-w-xs">
            No briefings yet. Your legal team will notify you when new regulatory updates are available.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {briefings.map(b => {
            const jurisdiction = b.jurisdictions as unknown as { name: string } | null
            const jName = jurisdiction?.name || ''
            const jColor = jName === 'CBK'
              ? 'bg-primary text-white'
              : jName === 'ODPC'
                ? 'bg-accent text-white'
                : 'bg-primary/10 text-primary'

            // 2-line preview
            const preview = b.content.length > 140
              ? b.content.slice(0, 140) + '...'
              : b.content

            return (
              <Link
                key={b.id}
                href={`/dashboard/briefings/${b.id}`}
                className="block border border-black/5 rounded-xl p-4 bg-white hover:border-black/15 transition-colors active:bg-cream/50 border-l-4 border-l-accent"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-semibold text-[15px] leading-tight flex-1">{b.title}</h3>
                  {jName && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider shrink-0 ${jColor}`}>
                      {jName}
                    </span>
                  )}
                </div>
                <p className="text-sm text-primary/60 leading-relaxed line-clamp-2 mb-2">{preview}</p>
                <span className="text-xs text-primary/40">
                  {b.sent_at ? new Date(b.sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
