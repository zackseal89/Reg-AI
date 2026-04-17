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
    <div className="py-2">
      <h1 className="text-3xl font-serif font-semibold mb-2 tracking-tight text-primary">Briefings</h1>
      <p className="text-sm font-sans text-primary/60 mb-8 max-w-xl leading-relaxed">
        Exclusive regulatory intelligence and foresight prepared directly by your MN Legal counsel.
      </p>

      {(!briefings || briefings.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border-t border-primary/5">
          <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} className="w-8 h-8 text-primary/30">
              <path d="M3 9h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path d="M3 9l9-6 9 6" />
            </svg>
          </div>
          <p className="text-primary/60 font-sans text-sm max-w-xs leading-relaxed">
            No briefings yet. Your legal team will notify you when new regulatory insights are distributed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {briefings.map((b, idx) => {
            const jurisdiction = b.jurisdictions as unknown as { name: string } | null
            const jName = jurisdiction?.name || ''
            const jColor = jName === 'CBK'
              ? 'bg-primary text-white border-primary'
              : jName === 'ODPC'
                ? 'bg-accent text-white border-accent'
                : 'bg-primary/5 text-primary border-primary/10'

            const preview = b.content?.length > 160
              ? b.content.slice(0, 160) + '…'
              : b.content

            const isRecent = idx === 0 && b.sent_at &&
              (Date.now() - new Date(b.sent_at).getTime()) < 7 * 24 * 60 * 60 * 1000

            return (
              <Link
                key={b.id}
                href={`/dashboard/briefings/${b.id}`}
                className="group relative flex overflow-hidden bg-white border border-primary/10 rounded-xl transition-all duration-300 hover:border-accent/30 hover:shadow-[0_8px_30px_-10px_rgba(26,39,68,0.1)] active:scale-[0.99] overflow-hidden"
              >
                {/* Left accent stripe */}
                <div className="w-1.5 shrink-0 bg-accent opacity-0 translate-x-[-100%] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out" />

                <div className="flex-1 px-5 py-5 transition-transform duration-300 group-hover:translate-x-1">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="font-serif font-bold text-lg leading-snug tracking-tight text-primary flex-1 group-hover:text-accent transition-colors duration-300">
                      {b.title}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0 pt-0.5">
                      {isRecent && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                        </span>
                      )}
                      {jName && (
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${jColor}`}>
                          {jName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Preview */}
                  <p className="text-[13px] font-sans text-primary/70 leading-[1.7] line-clamp-2 mb-4">
                    {preview}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-primary/5 pt-3">
                    <span className="text-[11px] font-sans text-primary/40 font-medium tracking-wide uppercase">
                      {b.sent_at
                        ? new Date(b.sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                        : ''}
                    </span>
                    <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-accent opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 flex items-center gap-1.5">
                      Read Analysis
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
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
