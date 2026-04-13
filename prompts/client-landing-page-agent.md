# RegWatch — Client Landing Page Agent Prompts
# For AI agents with image generation + web build capabilities
# Purpose: Convert fintech/crypto founders into paying RegWatch clients

---

## MASTER BRIEF (Read First — Context for All Prompts)

```
You are building a client-facing landing page for RegWatch, a regulatory intelligence
platform operated exclusively by MNL Advocates LLP, a Nairobi-based legal tech law firm.

PRODUCT: RegWatch delivers lawyer-approved regulatory briefings, a searchable document
library, and AI compliance chat to fintech startups, crypto companies, and SMEs operating
in Kenya under CBK (Central Bank of Kenya) and ODPC (Office of the Data Protection
Commissioner) frameworks.

PRICE: KES 15,000/month (~$115 USD)

THE AUDIENCE: Founders and compliance leads at fintech startups, crypto exchanges, and
data-heavy SMEs in Kenya. They are:
- Time-poor and overwhelmed by regulatory complexity
- Scared of enforcement actions and fines (CBK can revoke licences; ODPC can fine up to KES 5M)
- Skeptical of generic AI tools — they've been burned by hallucinations
- Respectful of MNL Advocates' legal authority and reputation
- Likely running a lean team with no in-house compliance officer

THE CONVERSION GOAL: Get them to submit a "Request Access" form (email + company name +
jurisdiction focus). This is not a free trial — it is a gated, lawyer-onboarded product.
The scarcity and exclusivity are features, not bugs. Lean into them.

THE EMOTIONAL JOURNEY THIS PAGE MUST TAKE THEM ON:
1. Recognition — "That is exactly what's happening to us"
2. Fear — "I didn't realise how exposed we are"
3. Relief — "There's a solution built specifically for this"
4. Trust — "MNL lawyers are reviewing everything — this isn't just an AI toy"
5. Urgency — "The next CBK circular could drop tomorrow"
6. Action — "Request Access before we close the waitlist"

BRAND:
- Primary colour: Navy #1a2744
- Accent: Burgundy #8b1c3f
- Background: Cream #f5f3ef
- Fonts: Playfair Display (headings), Inter (body)
- Tone: Authoritative, calm, premium. Not startup-y. Not aggressive. Think The Economist
  meets a boutique law firm meets Y Combinator.

DO NOT:
- Use generic stock photo language ("diverse team smiling at laptop")
- Make it sound like a SaaS product — it is legal intelligence
- Promise anything the lawyers haven't approved (no "we cover all regulations")
- Use the word "chatbot" — use "Compliance Chat" or "AI advisor"
- Show pricing as a discount — it is a professional service retainer, not a deal
```

---

## PROMPT 01 — Hero Section Image

```
Generate a hero image for a premium legal intelligence platform called RegWatch, serving
fintech and crypto startups in Nairobi, Kenya.

Visual concept: A founder sitting alone at a minimal desk late at night in a modern
Nairobi high-rise office. The city skyline — Upperhill or Westlands — glows through
floor-to-ceiling windows behind them. On their laptop screen, a clean dashboard interface
glows softly: a regulatory briefing titled "CBK Payment Services Directive — July 2026"
with a green "Approved by Lawyer" badge visible. On the desk: a glass of water, a printed
CBK document with handwritten margin notes, a phone face-down.

The mood is focused, late-night urgency, but controlled. This person is ahead of the
problem — not drowning in it. Warm amber desk lamp light, cool blue city glow from the
window, the laptop screen provides a third cool white light.

Colour palette dominant: deep navy, warm amber, cream white. No bright colours.

Style: Editorial photography aesthetic. Shallow depth of field. Shot from slightly above
and to the side. Cinematic. Similar visual language to a Bloomberg Businessweek cover.

Aspect ratio: 16:9 widescreen. High resolution. No text overlay — this is a background
image that will have text placed over it.

Do NOT include: generic office scenes, diverse-team-smiling clichés, any visible brand
logos, cluttered desks, generic skylines that look like New York or London. This must
feel unmistakably Nairobi.
```

---

## PROMPT 02 — The Fear Section Image (Problem Visualisation)

```
Generate an editorial illustration visualising regulatory overwhelm for a Kenyan fintech
founder. Style: Flat design with depth, similar to Bloomberg or FT Weekend illustration
style. Colour palette strictly: navy #1a2744, burgundy #8b1c3f, cream #f5f3ef, with
accent in muted gold #c9a84c.

Concept: A small human figure stands at the centre, looking up at a towering flood of
official-looking documents raining down from above. The documents are labelled with
regulatory terms: "CBK Circular No. 14/2026", "ODPC Enforcement Notice", "Data
Protection Act — Amendment", "E-Money Licensing Requirements", "Payment Services
Directive". The documents are all slightly crumpled, urgent-looking, overlapping.

The figure is not panicking — they look determined but overwhelmed. They hold a single
document they're trying to read while ten others are already at their feet.

Around the edges: faint clock faces showing time passing. A lawyer's briefcase sits
unopened nearby — expensive help they can't access fast enough.

No human faces needed. Keep it abstract-editorial. The mood is: "there is too much
regulatory information, arriving too fast, for a single founder to process alone."

Size: Square 1:1, suitable for a section background or card illustration.
```

---

## PROMPT 03 — Trust Signal Image (The Lawyer Approval Moment)

```
Generate a clean, premium editorial illustration showing the moment a lawyer approves
a document before it reaches a client. This is the core trust signal of the RegWatch
platform — nothing reaches clients without human legal review.

Visual concept: Split composition. Left half: a lawyer's desk — dark wood, a fountain
pen, a physical document with annotations and a signature being applied. The lawyer's
hand (only the hand, no face needed) is placing a stamp or signing. The document header
reads "APPROVED — MNL Advocates LLP". Right half: the same document appearing cleanly
on a mobile phone screen, with a notification reading "New Briefing — CBK Payment
Services" and a small "Verified by Lawyer ✓" badge in burgundy.

The transition between the two halves uses a subtle gradient dissolve — physical to
digital, human to client.

Colour palette: Navy and burgundy dominant. Cream paper texture on the left. Clean
white digital UI on the right. Gold pen accent.

Style: Premium editorial. Could work as a Forbes Africa or The Economist illustration.
No text beyond what's described. No stock-photo faces. The hands should look professional,
authoritative — a senior lawyer's hands, not generic.

Aspect ratio: 3:2 landscape.
```

---

## PROMPT 04 — Compliance Chat UI Mockup Image

```
Generate a high-fidelity UI mockup of the RegWatch Compliance Chat interface, shown on
a MacBook Pro screen at a slight angle (product photography style). The interface
should look like a premium, minimal legal intelligence tool — not a generic chatbot.

UI details to show on screen:

Left sidebar: Dark navy (#1a2744) background. RegWatch logo at top (serif typeface).
Navigation items: "Briefings", "Documents", "Compliance Chat", "Book Consultation".
User avatar initials "PW" at bottom with "Pendo Waweru — CBK Licence" subtitle.

Main chat area: Cream (#f5f3ef) background. Clean chat thread visible.

User message bubble (right-aligned, navy): "What are the minimum capital requirements
for a Payment Service Provider licence under the new CBK framework?"

AI response (left-aligned, white card with subtle shadow):
"Under CBK's revised National Payment System Regulations (Circular 14/2026), PSPs
are required to maintain a minimum unimpaired capital of KES 20 million. This applies
to Tier 2 operators processing between KES 1M–50M monthly. [Source: CBK Circular
14/2026, Section 4.2, paragraph 3]"

Below the AI response: A small burgundy badge reading "Source: CBK Circular 14/2026 — 
Published to your account by MNL Advocates, 14 Apr 2026"

Below that: A subtle CTA button in burgundy — "Book a Consultation with MNL →"

The overall impression: This is not a chatbot. This is a legal intelligence tool that
knows your specific documents, cites its sources, and knows when to hand you to a lawyer.

MacBook should be on a cream/linen surface. Slight warm lighting. Premium product
photography aesthetic. No people. No background clutter.

Aspect ratio: 16:9.
```

---

## PROMPT 05 — Full Client Landing Page (Build Prompt)

```
Build a single-file HTML landing page for RegWatch — a client-facing, conversion-focused
page designed to get fintech founders, crypto operators, and data-heavy SMEs in Kenya to
submit a "Request Access" form.

This is NOT the same as the internal pitch deck. This speaks directly to the client,
in second person ("you", "your"), and every section answers one question: "Why should
I pay KES 15,000/month for this?"

---

PAGE ARCHITECTURE (in order):

[1] STICKY NAV
- Logo: "RegWatch" in Playfair Display, navy
- Links: Problems | How It Works | Pricing | Testimonials
- CTA button: "Request Access" (burgundy, pill shape)
- Appears with blur/backdrop after scrolling 80px
- Mobile: collapse to hamburger with slide-in drawer

[2] HERO SECTION
- Full-viewport height
- Background: Use the generated hero image (Nairobi founder at desk) as a background
  with a dark navy overlay gradient (left side darker for text legibility)
- Headline (Playfair Display, white, large):
  "The CBK just issued a new directive. Do you know what it means for your licence?"
- Sub-headline (Inter, white/70%, smaller):
  "RegWatch delivers lawyer-approved regulatory briefings, a searchable document library,
  and AI compliance answers — scoped exactly to your business. Exclusively for MNL Advocates clients."
- Two CTAs:
  Primary: "Request Access →" (burgundy button)
  Secondary: "See How It Works ↓" (ghost button, white border)
- Bottom: Three trust badges in a row:
  "⚖️ Lawyer-Reviewed" | "🔒 Client-Isolated" | "📋 CBK + ODPC Covered"

[3] CREDIBILITY BAR
- Thin strip, navy background
- Text: "Operated exclusively by MNL Advocates LLP · Nairobi · Est. 2019 · Regulated legal practice"
- Subtle animated scroll of regulatory body logos (CBK, ODPC wordmarks as text, not images)

[4] THE RECOGNITION SECTION (Pain)
Headline: "If this sounds familiar, you need RegWatch."
Layout: Three cards, each with an icon, a short scenario title, and a 2-line scenario.
  Card 1: 😰 "You heard about a CBK update from a WhatsApp group — three weeks after it dropped."
  Card 2: 📧 "You emailed your lawyer. They replied four days later. The deadline was in two."
  Card 3: 🔍 "A regulator asked for your compliance history. You searched Gmail for an hour."
Each card: Cream background, subtle red left-border, icon in red-tinted circle.
Below the cards: Bold centred text — "These are not hypotheticals. These are the calls MNL receives."

[5] THE STAKES SECTION (Fear)
Full-width navy background section.
Headline (white, Playfair): "The cost of getting it wrong in Kenya is not a slap on the wrist."
Two-column layout:
  Left: Stat cards (large number + description):
    "KES 5,000,000" — Maximum ODPC fine for a personal data breach
    "KES 100,000+" — Minimum CBK administrative penalty per violation
    "30 days" — Notice period before CBK can suspend a payment licence
    "Immediate" — ODPC can issue a stop-processing order without warning
  Right: Paragraph text:
    "The regulatory environment in Kenya tightened significantly in 2024–2026. The CBK's
    National Payment Systems Act amendments and the ODPC's first wave of enforcement actions
    have made compliance a business continuity issue — not a legal formality.
    
    One missed circular. One unread guideline. One document you didn't know applied to you.
    That's all it takes.
    
    RegWatch exists so that never happens to your business."
Stat numbers should animate (count up) on scroll entry.

[6] HOW IT WORKS (Product)
Headline: "You get intelligence. Your lawyer handles the review. You never get both confused."
Subtitle: "Here's exactly what happens from the moment a CBK circular drops to the moment you understand it."

Animated horizontal timeline (desktop) / vertical (mobile) with 5 steps:
Step 1 — 🏛️ Regulation Published
  "CBK or ODPC publishes a circular, notice, or guideline."
Step 2 — 🤖 AI Analyses It
  "Claude reads the full document and generates a plain-language briefing."
Step 3 — ⚖️ Lawyer Approves (HIGHLIGHTED in burgundy, slightly larger)
  "An MNL associate reviews, edits, and approves. Nothing moves without this step."
  Badge: "REQUIRED — No Exceptions"
Step 4 — 📨 You Receive It
  "The approved briefing arrives in your inbox and your RegWatch dashboard within 48 hours."
Step 5 — 💬 You Ask Questions
  "Use Compliance Chat to ask anything. The AI answers from your documents only — with source citations."

Below timeline: Use the generated Compliance Chat UI mockup image as a product screenshot,
with a caption: "The Compliance Chat — your document library, searchable in plain English."

[7] WHAT YOU GET (Features)
Headline: "Everything you need. Nothing you don't."
Four feature cards in a 2x2 grid:
  📋 Regulatory Briefings
  "Lawyer-approved summaries of every CBK and ODPC publication relevant to your licence
  type. In your inbox before your competitors hear about it."
  
  📁 Document Library
  "Every regulatory document assigned to you — date-stamped, immutable, downloadable.
  When a regulator asks for your compliance history, you have it in three clicks."
  
  💬 Compliance Chat
  "Ask anything about your documents in plain English. The AI cites the exact clause it
  drew from. No hallucinations — it only sees your published documents."
  
  ⚖️ Lawyer Access
  "One click to book a consultation with the MNL associate who already knows your
  jurisdiction, your documents, and your business. No re-briefing required."

Each card: White background, burgundy top-border reveal on hover, icon with navy gradient
background, subtle entrance animation on scroll.

[8] WHO IT'S FOR
Headline: "Built for operators who can't afford to miss a regulation."
Four audience cards:
  🏦 Fintech Startups — Payment aggregators, e-money issuers, mobile lenders under CBK frameworks
  ₿ Crypto & Digital Asset — Exchanges and custodians tracking the CBK's virtual asset framework
  🏢 Data-Heavy SMEs — Any business subject to the Data Protection Act and ODPC enforcement
  🌍 International Orgs — Multinationals entering Kenya who need grounded local intelligence

Each card has a large ghosted emoji background that floats/scales on hover.

[9] THE TRUST SECTION (Social Proof Placeholder)
Headline: "Trusted by operators who cannot afford compliance gaps."
Design: Three testimonial card placeholders in navy background, white card style.
Each card has:
  - A short quote in Playfair italic
  - A role/company attribution (no names for privacy — "Head of Compliance, CBK-licensed PSP")
  - A jurisdiction badge (CBK or ODPC)
Note in a comment in the HTML: <!-- Replace with real testimonials when available -->
Placeholder quotes to use:
  Quote 1: "We received the ODPC enforcement guidance 36 hours before it was being discussed
  in Fintech Association group chats. That lead time was everything."
  — Head of Compliance, Payment Service Provider (CBK-licensed)
  
  Quote 2: "I asked RegWatch's chat interface about capital adequacy requirements at 11pm
  before a board meeting. It cited the exact clause. I walked in prepared."
  — CEO, Digital Lending Platform
  
  Quote 3: "The fact that a lawyer has read every briefing before it reaches me is the
  reason I'm paying. I don't need more AI tools. I need verified intelligence."
  — Founder, Crypto Exchange (KE)

[10] PRICING
Headline: "One compliance incident costs more than 20 years of RegWatch."
Two-column comparison:
  Left (Without RegWatch — red-tinted):
    "KES 300,000+" header
    "What a single compliance breach costs"
    List: CBK administrative penalties | Emergency legal counsel | Operational disruption
    | Banking partner damage | ODPC fines up to KES 5M | Investor confidence collapse
  
  Right (With RegWatch — green-tinted):
    "KES 15,000 /month" header (burgundy colour)
    "Everything included. No surprises."
    List: ✓ Unlimited briefings (CBK + ODPC) | ✓ Full document library
    | ✓ Unlimited compliance chat | ✓ Lawyer review on every briefing
    | ✓ Jurisdiction-scoped to your business | ✓ Full audit trail

Below: Dark navy strip — "One prevented incident pays for 20+ years of RegWatch."
CTA button: "Request Access — KES 15,000/month →"

[11] REQUEST ACCESS FORM (Conversion)
Headline: "Request access to RegWatch."
Subheadline: "Onboarding is by invitation only. Complete the form and an MNL associate will contact you within one business day."

Form fields:
  - Full Name (text)
  - Company Name (text)
  - Work Email (email)
  - Regulatory Focus (select: CBK — Payments/Fintech | ODPC — Data Protection | Both CBK + ODPC)
  - Brief description of your compliance challenge (textarea, optional)

Submit button: "Submit Request →" (full-width, burgundy, with loading state)
Below form: "🔒 Your information is used only to onboard you with an MNL lawyer. We do not share data."

On submit: Show a success state — "Request received. An MNL associate will be in touch within one business day."
Form action: mailto:contact@mnladvocates.com (or make it a fetch() to a placeholder endpoint)

[12] FOOTER
- RegWatch logo + MNL Advocates LLP
- Links: Privacy Policy | Terms | Contact
- "© 2026 MNL Advocates LLP. RegWatch is an exclusive service for MNL clients. All regulatory content reviewed by qualified Kenyan legal practitioners."

---

TECHNICAL REQUIREMENTS:
- Single .html file, no external build tools
- Inline CSS and JavaScript only
- Load fonts from Google Fonts (Playfair Display + Inter)
- Images: use the generated images by embedding them as base64 OR reference them as
  relative paths (./hero.jpg, ./chat-mockup.jpg, ./lawyer-approval.jpg, ./overwhelm.jpg)
  corresponding to the 4 generated images above
- Scroll animations using IntersectionObserver (no libraries)
- Animated counters for the stat numbers
- Form validation before submit
- Fully responsive (mobile-first)
- Accessible (aria-labels on form fields, semantic HTML)
- NO external JavaScript libraries (no jQuery, no GSAP, no Framer)
- Page should load fast — no unnecessary assets

COLOURS AND FONTS (match RegWatch brand exactly):
  --navy:     #1a2744
  --burgundy: #8b1c3f
  --cream:    #f5f3ef
  --muted:    #6b7280
  Headings: Playfair Display
  Body: Inter

The final page should feel like it was built by a premium law firm, not a startup.
Authoritative. Minimal. Every word earns its place. The goal is not to impress —
it is to convert.
```

---

## PROMPT 06 — Copy Refinement (Run After Build)

```
Review the landing page copy for the RegWatch client landing page. Apply these rules:

TONE RULES:
1. Never start a sentence with "We". Start with the client's problem or the product's
   outcome. "We send you briefings" → "Lawyer-approved briefings arrive in your inbox."
2. Replace all passive voice with active voice.
3. Every heading should create a question in the reader's mind, or answer one they already have.
4. Replace any generic adjective ("powerful", "seamless", "robust") with a specific fact.
5. Numbers beat adjectives. "Fast" → "Within 48 hours." "Comprehensive" → "CBK + ODPC, both covered."
6. The word "solution" is banned. The word "platform" is fine. "Product" is fine.
   "Tool" is acceptable. "Chatbot" is banned — use "Compliance Chat".
7. Scarcity is real: onboarding is by invitation only through MNL Advocates.
   Mention this at least twice but don't over-dramatise it.
8. The word "lawyer" should appear at least once in every major section. It is the
   differentiator from every other compliance AI tool.

CONVERSION RULES:
1. The primary CTA must appear at the top (hero), middle (after How It Works), and
   bottom (after pricing). Three placements minimum.
2. The pricing section must include the "one incident pays for 20 years" calculation
   made explicit: KES 300,000 incident cost ÷ KES 15,000/month = 20 months.
3. The form section must include a trust statement addressing the #1 objection:
   "Is this just another AI tool that makes things up?" Answer: "Every briefing is
   reviewed by a qualified Kenyan lawyer before it reaches your dashboard."
4. The footer CTA should feel different from the hero CTA — it catches people who
   scrolled all the way down and are ready. Use: "You've read this far. Request access."

OUTPUT: Return the full revised copy for each section, ready to drop into the HTML.
Do not rewrite the HTML structure — only the text content.
```

---

## PROMPT 07 — Mobile Experience Audit (Run After Build)

```
Audit the RegWatch client landing page for mobile experience on a 390px wide screen
(iPhone 14 standard). Check and fix the following:

1. HERO: Does the headline text wrap properly at 390px? It should be no more than
   4 lines. If it wraps to 5+, shorten the headline or reduce font size.

2. NAVIGATION: The sticky nav links must collapse on mobile. If they don't, implement
   a hamburger menu with a slide-in drawer in navy background. The "Request Access"
   CTA must remain visible on mobile nav.

3. PIPELINE DIAGRAM: The 5-step horizontal pipeline must convert to a vertical
   stacked layout on mobile. Each step should be full width with an arrow pointing down.

4. BEFORE/AFTER GRID: Must stack to single column on mobile. Before card on top, After
   card below. No horizontal scrolling.

5. PRICING COMPARISON: Must stack to single column. "Without RegWatch" first, then
   "With RegWatch". Add a visual divider between them.

6. FORM: All inputs must be full width. The submit button must be full width. Labels
   above inputs, not beside them.

7. TOUCH TARGETS: All buttons and links must be minimum 44px tall.

8. TEXT SIZES: Body text minimum 16px on mobile (prevent iOS zoom on input focus).
   No text smaller than 14px visible on mobile.

9. IMAGES: All images must be responsive (max-width: 100%, height: auto).
   The hero background image must have a stronger dark overlay on mobile for text
   legibility (the ambient light from the city may wash out white text on small screens).

10. PERFORMANCE: Check that no single image is being loaded at full desktop resolution
    on mobile. If images are embedded as base64, this is acceptable. If referenced
    externally, add appropriate loading="lazy" attributes.

Return a list of issues found and the CSS/HTML fixes for each.
```

---

## PROMPT 08 — Conversion Optimisation (A/B Variants)

```
Generate two alternative headlines for the RegWatch landing page hero section.
These are A/B test variants against the current headline:
"The CBK just issued a new directive. Do you know what it means for your licence?"

VARIANT A: Lead with the consequence (fear-based, outcome-focused)
The headline should make the reader feel the specific, concrete consequence of missing
a CBK circular. Reference a real type of enforcement action (licence suspension,
administrative fine). Should be 12 words or fewer.

VARIANT B: Lead with the solution (aspiration-based, authority-focused)
The headline should make the reader feel what it's like to already be on top of their
compliance — confident, ahead of the market, backed by real lawyers. Should position
RegWatch as the difference between founders who get caught and founders who don't.
Should be 12 words or fewer.

For each variant, also provide:
- A matching sub-headline (2 sentences max)
- A matching CTA button text (3-5 words)
- Which audience segment this variant is likely stronger for and why

Also generate one alternative for the pricing section headline:
Current: "One compliance incident costs more than 20 years of RegWatch."
Alternative: A headline that uses a different emotional trigger (not fear — try authority,
scarcity, or social proof). Same factual basis, different angle.
```

---

## HOW TO USE THESE PROMPTS

```
RECOMMENDED SEQUENCE:

1. Run PROMPT 01 → 04 (image generation) first.
   Save outputs as:
     hero.jpg (hero background)
     overwhelm.jpg (problem section)
     lawyer-approval.jpg (trust section)
     chat-mockup.jpg (product screenshot)

2. Run PROMPT 05 (full page build) with the 4 images available.
   Reference them as relative paths in the HTML.

3. Run PROMPT 06 (copy refinement) on the generated HTML.
   Apply the revised copy to the built page.

4. Run PROMPT 07 (mobile audit) and apply fixes.

5. Run PROMPT 08 (A/B variants) and implement as a simple URL param switch:
   ?v=a or ?v=b controls which hero headline shows.
   This lets you test conversion without a separate tool.

6. Deploy to here.now (or Vercel) as a standalone file.

AGENT CAPABILITY REQUIREMENTS:
- Image generation (Flux, Midjourney, DALL-E 3, or Ideogram)
- HTML/CSS/JS code generation
- Web hosting or file output
- Copy review and refinement

EXPECTED OUTPUT: One complete client-facing landing page that converts
fintech founders in Kenya into RegWatch subscribers at KES 15,000/month.
```
