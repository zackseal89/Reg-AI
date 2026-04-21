import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import ChatContent from './_components/chat-content'

// ---------------------------------------------------------------------------
// Build suggested prompts tailored to the client's jurisdictions and the
// documents MNL has actually published to them. Falls back to neutral MNL
// prompts when a client has no assigned documents yet.
// ---------------------------------------------------------------------------

function buildSuggestedPrompts({
  jurisdictions,
  documents,
}: {
  jurisdictions: string[]
  documents: { title: string; jurisdiction?: string | null }[]
}): string[] {
  const prompts: string[] = []

  // 1. Most recent document (if any) — most specific, highest signal.
  const recentDoc = documents[0]
  if (recentDoc) {
    prompts.push(`Summarise the key obligations in "${recentDoc.title}".`)
  }

  // 2. One prompt per active jurisdiction (cap at 2 so we stay under ~4 total).
  const jurisdictionPromptTemplates: Record<string, string> = {
    CBK: 'What are my current CBK obligations based on my published documents?',
    ODPC: 'Summarise my ODPC data protection obligations from my documents.',
    CMA: 'What CMA-related requirements apply to me in my documents?',
  }
  for (const j of jurisdictions.slice(0, 2)) {
    const tailored = jurisdictionPromptTemplates[j]
    prompts.push(
      tailored ?? `Summarise my obligations under ${j} in my published documents.`,
    )
  }

  // 3. A cross-document deadline prompt when the user has multiple docs.
  if (documents.length >= 2) {
    prompts.push('Are there any filing deadlines I should be tracking right now?')
  }

  // 4. Neutral fallback so the empty state always has something.
  if (prompts.length === 0) {
    prompts.push(
      'What regulatory updates should I be aware of?',
      'How can MNL Advocates help my compliance programme?',
    )
  }

  // Dedupe while preserving order; cap at 4 so the UI stays tidy.
  const seen = new Set<string>()
  return prompts.filter((p) => (seen.has(p) ? false : (seen.add(p), true))).slice(0, 4)
}

export default async function ChatPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let jurisdictions: string[] = []
  let documents: { title: string; jurisdiction?: string | null }[] = []

  if (user) {
    const [jurisdictionsRes, assignmentsRes] = await Promise.all([
      supabase
        .from('client_jurisdictions')
        .select('jurisdictions(name)')
        .eq('client_id', user.id),
      supabase
        .from('document_assignments')
        .select('documents ( title, status, created_at, jurisdictions ( name ) )')
        .eq('client_id', user.id)
        .order('assigned_at', { ascending: false })
        .limit(6),
    ])

    jurisdictions = (
      (jurisdictionsRes.data ?? []) as unknown as { jurisdictions: { name: string } | null }[]
    )
      .map((row) => row.jurisdictions?.name)
      .filter((n): n is string => !!n)

    documents = (
      (assignmentsRes.data ?? []) as unknown as {
        documents: {
          title: string
          status: string
          created_at: string
          jurisdictions: { name: string } | null
        } | null
      }[]
    )
      .map((row) => row.documents)
      .filter((d): d is NonNullable<typeof d> => !!d && d.status === 'published')
      .map((d) => ({ title: d.title, jurisdiction: d.jurisdictions?.name ?? null }))
  }

  const suggestedPrompts = buildSuggestedPrompts({ jurisdictions, documents })

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-[#1a2744]/35">Loading…</p>
        </div>
      }
    >
      <ChatContent suggestedPrompts={suggestedPrompts} />
    </Suspense>
  )
}
