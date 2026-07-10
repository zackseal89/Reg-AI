---
last_verified: 2026-07-09
applies_to: lib/gemini.ts, app/lawyer/documents/actions.ts
---

# Verifying document indexing (publish/unpublish → Gemini FileSearchStore)

## Symptom

A document was unpublished, but a client's Ask RegWatch chat still returns answers grounded in it — or `documents.gemini_file_id` in the database holds a value starting with `files/` instead of `fileSearchStores/{store}/documents/{doc}`.

## Root cause

Publishing a document (`publishDocumentAction` in `app/lawyer/documents/actions.ts`) calls `triggerGeminiIndexing`, which calls `indexDocumentInStore` (`lib/gemini.ts`). That function does two Gemini API calls in sequence: first `ai.files.upload(...)` (the Files API, a temporary 48h-TTL upload, resource name shaped `files/xxx`), then `ai.fileSearchStores.importFile(...)` to actually index it into the client's persistent FileSearchStore, whose completed operation returns a *different* resource — the store document, shaped `fileSearchStores/{store}/documents/{doc}`.

`lib/gemini.ts:66-86` stores that second, store-document name as `documents.gemini_file_id` — this is deliberate and load-bearing: `removeDocumentFromStore` (called by `unpublishDocumentAction` → `triggerGeminiRemoval`) looks up the document to delete by this exact resource name. If the wrong namespace was ever stored (the `files/xxx` name instead of the `fileSearchStores/.../documents/...` name), the delete call in `removeDocumentFromStore` fails — but that function wraps the delete in a try/catch that only `console.error`s and returns (`lib/gemini.ts:107-110`), so **the failure is silent to the user**. `unpublishDocumentAction` still flips `documents.status` back to `assigned` and clears `gemini_file_id` on the Postgres side regardless of whether the actual Gemini-side deletion succeeded — so the app looks like unpublish worked, while the document may still be retrievable by the client's chat.

## Fix

There is no code fix needed if `gemini_file_id` was stored correctly in the first place — this runbook is about verifying that it was, not correcting a wrong value after the fact (recovering from a wrong stored value would mean manually calling the Gemini API to find and delete the orphaned store document, which isn't covered by any existing script).

To confirm indexing is wired correctly for a given document, after publishing:
1. Check `documents.processed` — should be `true` (set at `app/lawyer/documents/actions.ts:78`, inside the per-assignment loop in `triggerGeminiIndexing`).
2. Check `documents.gemini_file_id` — should match the pattern `fileSearchStores/.+/documents/.+`, never bare `files/...`.
3. Check `companies.gemini_store_name` for the assigned client — should be non-null and match the store name referenced in `gemini_file_id`.

## How to confirm it's fixed

As the assigned client, ask Ask RegWatch a question whose answer only exists in the newly published document — a grounded answer with a citation to that document confirms indexing succeeded end-to-end. After unpublishing, ask the same question again: the client should no longer get an answer grounded in that document. If it still does, check the server logs for a `[gemini] removeDocumentFromStore error:` line (from `lib/gemini.ts:108`) — that confirms the silent-failure path described above was hit.
