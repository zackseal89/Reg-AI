import { createClient } from 'jsr:@supabase/supabase-js@2'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!
const VOYAGE_API_KEY = Deno.env.get('VOYAGE_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// ---------------------------------------------------------------------------
// Chunking helpers
// ---------------------------------------------------------------------------

function chunkText(text: string, chunkSize = 2000, overlap = 200): string[] {
  const chunks: string[] = []
  let start = 0
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    chunks.push(text.slice(start, end))
    if (end === text.length) break
    start = end - overlap
  }
  return chunks
}

// ---------------------------------------------------------------------------
// PDF text extraction via Claude
// ---------------------------------------------------------------------------

async function extractTextFromPdf(pdfBase64: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-beta': 'pdfs-2024-09-25',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: pdfBase64,
              },
            },
            {
              type: 'text',
              text: 'Extract and return the full text content of this document. Return only the extracted text, no commentary.',
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Claude extraction failed: ${response.status} ${err}`)
  }

  const data = await response.json()
  return data.content[0].text as string
}

// ---------------------------------------------------------------------------
// Embedding via Voyage AI
// ---------------------------------------------------------------------------

async function embedChunks(texts: string[]): Promise<number[][]> {
  const response = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${VOYAGE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'voyage-3',
      input: texts,
      input_type: 'document',
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Voyage embedding failed: ${response.status} ${err}`)
  }

  const data = await response.json()
  return (data.data as { embedding: number[] }[]).map((d) => d.embedding)
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  try {
    const payload = await req.json()

    // Supabase Storage webhook payload shape
    const record = payload.record ?? payload
    const documentId: string = record.id

    if (!documentId) {
      return new Response('Missing document id', { status: 400 })
    }

    // Fetch document row
    const { data: doc, error: docErr } = await supabase
      .from('documents')
      .select('id, storage_path, title, jurisdiction_id, uploaded_by')
      .eq('id', documentId)
      .single()

    if (docErr || !doc) {
      throw new Error(`Document not found: ${docErr?.message}`)
    }

    // Determine client_id from document_assignments (may not exist yet at upload time)
    const { data: assignments } = await supabase
      .from('document_assignments')
      .select('client_id')
      .eq('document_id', documentId)

    const clientId: string | null = assignments?.[0]?.client_id ?? null

    // Download PDF from Storage
    const { data: fileData, error: fileErr } = await supabase.storage
      .from('documents')
      .download(doc.storage_path)

    if (fileErr || !fileData) {
      throw new Error(`Storage download failed: ${fileErr?.message}`)
    }

    const arrayBuffer = await fileData.arrayBuffer()
    const pdfBase64 = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    )

    // Extract text
    const fullText = await extractTextFromPdf(pdfBase64)

    if (!fullText.trim()) {
      throw new Error('No text extracted from document')
    }

    // Chunk
    const textChunks = chunkText(fullText, 2000, 200)

    // Embed in batches of 64 (Voyage rate limits)
    const BATCH = 64
    const allEmbeddings: number[][] = []
    for (let i = 0; i < textChunks.length; i += BATCH) {
      const batch = textChunks.slice(i, i + BATCH)
      const embeddings = await embedChunks(batch)
      allEmbeddings.push(...embeddings)
    }

    // Delete any previously processed chunks for this document
    await supabase.from('chunks').delete().eq('document_id', documentId)

    // Insert chunks
    const chunkRows = textChunks.map((text, idx) => ({
      document_id: documentId,
      client_id: clientId,
      jurisdiction_id: doc.jurisdiction_id,
      chunk_text: text,
      embedding: allEmbeddings[idx],
      chunk_index: idx,
    }))

    const { error: insertErr } = await supabase.from('chunks').insert(chunkRows)
    if (insertErr) {
      throw new Error(`Chunk insert failed: ${insertErr.message}`)
    }

    // Mark document as processed
    await supabase
      .from('documents')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('id', documentId)

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: doc.uploaded_by,
      action: 'document_processed',
      entity_type: 'document',
      entity_id: documentId,
      details: {
        chunk_count: chunkRows.length,
        char_count: fullText.length,
      },
    })

    return new Response(
      JSON.stringify({ success: true, chunks: chunkRows.length }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[on_document_upload]', err)
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
