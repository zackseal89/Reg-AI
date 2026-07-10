---
status: accepted
date: 2026-07-09
---

# 0003: Typography and iconography — Fraunces, Instrument Sans, uniform 1.5 icon stroke

## Context

The platform originally shipped with Playfair Display for headings and Inter for body text. Looking for a more premium feel, we studied Harvey AI's design as a reference point — a legal-tech competitor whose editorial, low-contrast serif headings (their "Reckless" typeface) read as more considered than the high-contrast, display-style Playfair Display previously in use. Playfair Display's dramatic thick/thin contrast suits a wedding-invitation or luxury-brand register; it does not suit dense numerals in stat cards or long-form legal briefing text as well as a lower-contrast serif does.

At the same time, icons throughout the app (Lucide) carried inconsistent per-instance `strokeWidth` values scattered across components, with no single source of truth for how "heavy" an icon should look in a given context.

## Decision

Replace Playfair Display with **Fraunces** (`next/font/google`, `axes: ["opsz"]` for optical sizing) as the closest readily available match to Harvey's editorial serif register, and replace Inter with **Instrument Sans** for body text — narrower and slightly warmer than Inter's now-ubiquitous "default SaaS" look. Both are wired in `app/layout.tsx` via CSS variables (`--font-instrument`, `--font-fraunces`) and consumed through `--font-sans` / `--font-serif` in `app/globals.css`, so no component-level font-family changes were needed — the swap is isolated to two files.

Two alternatives were considered for the serif and explicitly rejected: **Newsreader** (quieter, more conventional newspaper serif — passed over as less distinctive) and **Source Serif 4** (sturdier, closer to Tiempos — passed over as reading more "document" than "editorial"). Fraunces' optical-size axis was the deciding factor: it can flex between a display-weight headline register and a smaller, still-legible register for stat-card numerals without switching typefaces.

For icons, a single global rule was added — `svg.lucide { stroke-width: 1.5; }` in `app/globals.css` — that overrides every per-icon `strokeWidth` prop throughout the codebase. Icon emphasis (e.g. an active sidebar item) now comes from color and background treatment only, never from a heavier stroke.

## Consequences

- Font changes are isolated to `app/layout.tsx` and the two `--font-*` variable mappings in `app/globals.css` — no component was touched to pick up the new typefaces, which made this a low-risk, easily reversible swap.
- The global icon-stroke rule removes a whole class of "does this icon look heavier than that one for no reason" inconsistency, but it also means any future component that genuinely needs a heavier icon stroke for a specific reason (e.g. a warning glyph) must fight this rule with a more specific selector rather than just passing `strokeWidth`.
- Fraunces and Instrument Sans are both variable Google Fonts loaded via `next/font/google`, which self-hosts and subsets them at build time — no new runtime dependency or external font-loading request beyond what the previous Playfair/Inter setup already did.
- This ADR only covers the in-app product typography. The transactional email template (`supabase/functions/on_briefing_sent/_templates/briefing.tsx`) still hardcodes `fontFamily: 'Playfair Display, Georgia, serif'` for its heading — it was not updated as part of this change and is now visually inconsistent with the rest of the product. Flagged here rather than fixed silently, since changing an email template is a product decision, not a documentation one.
