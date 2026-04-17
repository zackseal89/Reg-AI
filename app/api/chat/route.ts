import { createClient } from '@/lib/supabase/server'
import { ai, CHAT_MODEL } from '@/lib/gemini'

export const runtime = 'nodejs'

// ---------------------------------------------------------------------------
// System prompt — grounded regulatory assistant
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are an AI regulatory assistant for MNL Advocates LLP, a Nairobi-based legal tech law firm.

You help clients understand their regulatory documents related to Kenyan regulations (CBK, ODPC, and related bodies).

IMPORTANT RULES:
- Answer ONLY using the context retrieved from the client's documents. Do not use outside knowledge.
- If the retrieved context does not contain enough information to answer confidently, say so clearly.
- Do not speculate on regulatory requirements not explicitly stated in the retrieved documents.
- For any matter requiring legal advice or deeper analysis, recommend that the client book a consultation with MNL Advocates.
- Be concise and professional.
- When citing sources, refer to the document titles naturally in your response.`

// ---------------------------------------------------------------------------
// SSE helper: return a graceful "not configured" message
// ---------------------------------------------------------------------------

function notConfiguredStream(): Response {
  const msg =
    'The AI assistant is not yet configured for your account. Please contact MNL Advocates to enable this feature.'
  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder()
      controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'citations', citations: [] })}\n\n`))
      controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'text', text: msg })}\n\n`))
      controller.enqueue(enc.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: Request) {
  const supabase = await createClient()

  // 1. Auth guard — use getUser() for secure server-side auth
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // 2. Get user's company and their Gemini FileSearchStore
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, companies(gemini_store_name)')
    .eq('id', user.id)
    .single()

  const storeName = (profile?.companies as unknown as { gemini_store_name: string | null } | null)?.gemini_store_name

  // 3. Parse request body
  let body: {
    message: string
    context_document_id?: string
    conversation_history?: { role: 'user' | 'assistant'; content: string }[]
  }

  try {
    body = await req.json()
  } catch {
    return new Response('Bad request', { status: 400 })
  }

  const { message, conversation_history = [] } = body

  if (!message?.trim()) {
    return new Response('Message is required', { status: 400 })
  }

  // 4. Check for GEMINI_API_KEY and store availability
  if (!process.env.GEMINI_API_KEY || !storeName) {
    return notConfiguredStream()
  }

  // 5. Build Gemini contents from conversation history
  const contents = [
    ...conversation_history.map((m) => ({
      role: m.role === 'assistant' ? 'model' as const : 'user' as const,
      parts: [{ text: m.content }],
    })),
    { role: 'user' as const, parts: [{ text: message }] },
  ]

  // 6. Stream from Gemini with fileSearch tool
  try {
    const stream = await ai.models.generateContentStream({
      model: CHAT_MODEL,
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [
          {
            fileSearch: {
              fileSearchStoreNames: [storeName],
            },
          },
        ],
      },
    })

    // 7. Pipe Gemini stream → SSE, extracting citations from groundingMetadata
    const encoder = new TextEncoder()
    let citationsSent = false

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            // Extract citations from grounding metadata (sent once)
            if (
              !citationsSent &&
              chunk.candidates?.[0]?.groundingMetadata?.groundingChunks
            ) {
              const seen = new Set<string>()
              const citations: { document_title: string }[] = []

              for (const gc of chunk.candidates[0].groundingMetadata.groundingChunks) {
                const title =
                  gc.retrievedContext?.title ?? 'Document'
                if (!seen.has(title)) {
                  seen.add(title)
                  citations.push({ document_title: title })
                }
              }

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: 'citations', citations })}\n\n`
                )
              )
              citationsSent = true
            }

            // Stream text delta
            const text = chunk.text
            if (text) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: 'text', text })}\n\n`
                )
              )
            }
          }

          // If no citations were found at all, send empty array
          if (!citationsSent) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'citations', citations: [] })}\n\n`
              )
            )
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } catch (streamErr) {
          console.error('[chat] Gemini stream error:', streamErr)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'text', text: 'An error occurred while generating the response. Please try again.' })}\n\n`
            )
          )
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('[chat] Gemini generateContent error:', err)
    return new Response('AI service error', { status: 502 })
  }
}
