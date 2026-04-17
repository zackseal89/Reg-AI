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
 * @returns The Gemini file name (resource ID) for later deletion
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

  return uploaded.name! // Save as documents.gemini_file_id
}

/**
 * Remove a document from a client's FileSearchStore (on unpublish).
 * Lists store documents and deletes any that match the given file ID.
 */
export async function removeDocumentFromStore(
  storeName: string,
  geminiFileId: string
): Promise<void> {
  try {
    const docs = await ai.fileSearchStores.documents.list({
      parent: storeName,
    })
    for await (const doc of docs) {
      if (doc.name?.includes(geminiFileId)) {
        await ai.fileSearchStores.documents.delete({ name: doc.name })
        break
      }
    }
  } catch (err) {
    console.error('[gemini] removeDocumentFromStore error:', err)
    // Non-fatal — the store is still usable; log and move on
  }
}
