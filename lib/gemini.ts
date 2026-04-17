import { GoogleGenAI } from '@google/genai'

// ---------------------------------------------------------------------------
// Singleton Gemini client — used across all Next.js server code
// ---------------------------------------------------------------------------

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

/** Model used for chat generation with File Search */
export const CHAT_MODEL = 'gemini-2.5-flash'

// ---------------------------------------------------------------------------
// FileSearchStore helpers
// ---------------------------------------------------------------------------

/**
 * Create a FileSearchStore for a newly onboarded client.
 * Returns the store resource name (e.g. 'fileSearchStores/abc123...')
 */
export async function createClientStore(companyId: string): Promise<string> {
  const store = await ai.fileSearchStores.create({
    config: { displayName: `regwatch-${companyId}` },
  })
  return store.name!
}

/**
 * Upload a PDF and import it into a client's FileSearchStore.
 * Polls the long-running operation until indexing completes.
 *
 * @returns The store document resource name (fileSearchStores/.../documents/...)
 *          stored as documents.gemini_file_id — used for deletion on unpublish.
 */
export async function indexDocumentInStore(
  storeName: string,
  pdfBuffer: Buffer,
  documentTitle: string,
  documentId: string
): Promise<string> {
  // Step 1 — Upload raw file to Files API (temporary, 48h TTL)
  const uploaded = await ai.files.upload({
    file: new Blob([new Uint8Array(pdfBuffer)], { type: 'application/pdf' }),
    config: {
      mimeType: 'application/pdf',
      displayName: documentTitle,
    },
  })

  // Step 2 — Import into FileSearchStore (async long-running operation)
  let op = await ai.fileSearchStores.importFile({
    fileSearchStoreName: storeName,
    fileName: uploaded.name!,
    config: {
      customMetadata: [
        { key: 'document_id', stringValue: documentId },
      ],
    },
  })

  // Step 3 — Poll until done (5s intervals)
  while (!op.done) {
    await new Promise((r) => setTimeout(r, 5_000))
    op = await ai.operations.get({ operation: op })
  }

  // Step 4 — Extract the store document name from the completed operation.
  // The operation response contains the created Document resource whose name is
  // in format fileSearchStores/{store}/documents/{doc} — this is what we need
  // to store for deletion, NOT the Files API resource name (files/xxx) which
  // is a different namespace and would never match on lookup.
  const storeDocName = (op.response as { document?: { name?: string } } | undefined)?.document?.name
  if (!storeDocName) {
    throw new Error(`[gemini] importFile operation completed but response.document.name is missing. op: ${JSON.stringify(op)}`)
  }

  return storeDocName
}

/**
 * Remove a document from a client's FileSearchStore (on unpublish).
 *
 * @param storeDocumentName  The store document resource name stored in
 *                           documents.gemini_file_id, format:
 *                           fileSearchStores/{store}/documents/{doc}
 */
export async function removeDocumentFromStore(
  _storeName: string,
  storeDocumentName: string
): Promise<void> {
  try {
    // force: true required — documents with chunks reject deletion without it.
    await ai.fileSearchStores.documents.delete({
      name: storeDocumentName,
      force: true,
    })
  } catch (err) {
    console.error('[gemini] removeDocumentFromStore error:', err)
    // Non-fatal — the store is still usable; log and move on
  }
}
