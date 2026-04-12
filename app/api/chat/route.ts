import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY

// ---------------------------------------------------------------------------
// Embed query via Voyage AI
// ---------------------------------------------------------------------------

async function embedQuery(text: string): Promise<number[]> {
  const response = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${VOYAGE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'voyage-3',
      input: [text],
      input_type: 'query',
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Voyage embedding failed: ${response.status} ${err}`)
  }

  const data = await response.json()
  return data.data[0].embedding as number[]
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: Request) {
  const supabase = await createClient()

  // Auth guard — use getUser() for secure server-side auth
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const clientId = user.id

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

  const { message, context_document_id, conversation_history = [] } = body

  if (!message?.trim()) {
    return new Response('Message is required', { status: 400 })
  }

  // Check for Voyage API key
  if (!VOYAGE_API_KEY) {
    const noKeyMsg =
      'The AI assistant is not yet configured. Please contact MNL Advocates to enable this feature.'
    const stream = new ReadableStream({
      start(controller) {
        const enc = new TextEncoder()
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'citations', citations: [] })}\n\n`))
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'text', text: noKeyMsg })}\n\n`))
        controller.enqueue(enc.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })
    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
    })
  }

  // Embed user query
  let queryEmbedding: number[]
  try {
    queryEmbedding = await embedQuery(message)
  } catch (err) {
    console.error('[chat] embed error', err)
    return new Response('Embedding failed', { status: 502 })
  }

  // Use service role for match_chunks RPC (bypasses RLS, scoping is inside the function)
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: chunks, error: rpcErr } = await adminClient.rpc('match_chunks', {
    query_embedding: queryEmbedding,
    match_threshold: 0.65,
    match_count: 5,
    p_client_id: clientId,
  })

  if (rpcErr) {
    console.error('[chat] match_chunks error', rpcErr)
    return new Response('Vector search failed', { status: 502 })
  }

  // No relevant chunks found
  if (!chunks || chunks.length === 0) {
    const noContextMsg =
      'I could not find relevant information in your published documents to answer this question. ' +
      'Please contact MNL Advocates for advice specific to your situation.'

    const stream = new ReadableStream({
      start(controller) {
        const enc = new TextEncoder()
        // Send empty citations first
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'citations', citations: [] })}\n\n`))
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'text', text: noContextMsg })}\n\n`))
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

  // Build citations (deduplicated by document_id)
  const seen = new Set<string>()
  const citations: { document_id: string; document_title: string; document_type: string }[] = []
  for (const chunk of chunks) {
    if (!seen.has(chunk.document_id)) {
      seen.add(chunk.document_id)
      citations.push({
        document_id: chunk.document_id,
        document_title: chunk.document_title,
        document_type: chunk.document_type,
      })
    }
  }

  // Build context string from retrieved chunks
  const contextText = chunks
    .map((c: { document_title: string; chunk_text: string }, i: number) =>
      `[Source ${i + 1}: ${c.document_title}]\n${c.chunk_text}`
    )
    .join('\n\n---\n\n')

  const systemPrompt = `You are an AI regulatory assistant for MNL Advocates LLP, a Nairobi-based legal tech law firm.

You help clients understand their regulatory documents related to Kenyan regulations (CBK, ODPC, and related bodies).

IMPORTANT RULES:
- Answer ONLY using the context provided below. Do not use outside knowledge.
- If the context does not contain enough information to answer confidently, say so clearly.
- Do not speculate on regulatory requirements not explicitly stated in the context.
- For any matter requiring legal advice or deeper analysis, recommend that the client book a consultation with MNL Advocates.
- Be concise and professional.

DOCUMENT CONTEXT:
${contextText}`

  // Build Claude messages array
  const messages = [
    ...conversation_history.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: 'user' as const, content: message },
  ]

  // Stream from Claude
  const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
      stream: true,
    }),
  })

  if (!claudeResponse.ok || !claudeResponse.body) {
    const err = await claudeResponse.text()
    console.error('[chat] Claude error', err)
    return new Response('AI service error', { status: 502 })
  }

  // Pipe Claude SSE → client SSE, injecting citations as first event
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  const stream = new ReadableStream({
    async start(controller) {
      // Emit citations first
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'citations', citations })}\n\n`)
      )

      const reader = claudeResponse.body!.getReader()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6)
            if (data === '[DONE]') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              continue
            }

            try {
              const event = JSON.parse(data)
              if (
                event.type === 'content_block_delta' &&
                event.delta?.type === 'text_delta'
              ) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: 'text', text: event.delta.text })}\n\n`
                  )
                )
              }
            } catch {
              // skip malformed events
            }
          }
        }
      } finally {
        controller.close()
        reader.releaseLock()
      }
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
