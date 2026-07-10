/**
 * Seed script — populates the `templates` library with 15 reusable starter
 * templates (regulatory briefings + compliance documents) adapted for MNL's
 * Kenya / CBK / ODPC / fintech practice.
 *
 * Idempotent: rows are matched by title, so re-running updates existing
 * templates in place rather than duplicating them.
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   npx tsx scripts/seed-templates.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

type TemplateSeed = {
  title: string
  kind: 'briefing' | 'document'
  category:
    | 'regulatory_briefing'
    | 'data_protection'
    | 'banking_fintech'
    | 'board_reporting'
    | 'client_onboarding'
  jurisdiction: string
  description: string
  body: string
  adaptation_notes: string
  source: string
  source_url: string
  sort_order: number
}

const TEMPLATES: TemplateSeed[] = [
  // --- Regulatory briefings ------------------------------------------------
  {
    title: 'Regulatory Client Alert',
    kind: 'briefing',
    category: 'regulatory_briefing',
    jurisdiction: 'General',
    description:
      'Plain-English alert that tells a client what changed, whether it affects them, and what to do next.',
    body: `SUBJECT: [Regulator] [instrument, e.g. "Circular No. X of 2026"] — what it means for [Client]

WHAT HAPPENED
On [date], the [regulator, e.g. Central Bank of Kenya] issued [instrument]. In short: [one-sentence summary of the change].

WHO THIS AFFECTS
This applies to [category of business, e.g. licensed payment service providers]. Based on your operations, this [does / does not / may] apply to you because [reason].

WHAT YOU NEED TO DO
1. [Concrete action, e.g. "Update your customer onboarding flow to capture …"]
2. [Action]
3. [Action]

DEADLINE
[Effective / compliance date]. [Note any transition period.]

OUR RECOMMENDATION
[MNL's practical view — priority, effort, and any decisions the client must make.]

SOURCES
- [Instrument title and reference number], [regulator], [date]
- [Link or gazette citation]

Prepared by [Lawyer], MNL Advocates LLP. This alert is a summary for guidance only and is not a substitute for formal legal advice.`,
    adaptation_notes:
      'Set the jurisdiction tag to CBK or ODPC before sending. Always cite the underlying Kenyan gazette notice or circular in Sources. Keep the tone advisory, not a court-filing register.',
    source: 'Law-firm client-alert practice (Reputation Ink; Herrick "Drafting Client Memos and Emails")',
    source_url: 'https://www.rep-ink.com/blog/tips-for-writing-law-firm-client-alerts/',
    sort_order: 1,
  },
  {
    title: 'CBK Circular Summary Briefing',
    kind: 'briefing',
    category: 'regulatory_briefing',
    jurisdiction: 'CBK',
    description:
      'Structured summary of a Central Bank of Kenya circular, mirroring the circular’s own fields and translating them into client action.',
    body: `CBK CIRCULAR SUMMARY

Reference: [Banking Circular No. X of YYYY]
Issued by: Central Bank of Kenya
Date issued: [date]
Applies to: [institutions named in the circular]
Effective date: [date]

WHAT THE CIRCULAR REQUIRES
[2–4 bullet points restating the requirements in plain English.]

CHANGE FROM CURRENT POSITION
[What was the rule before, and what is different now.]

IMPACT ON [CLIENT]
[How this changes the client's obligations, systems, reporting, or capital.]

ACTION CHECKLIST
- [ ] [Action] — owner: [name] — due: [date]
- [ ] [Action]
- [ ] [Action]

REFERENCES
- [Circular title and number], Central Bank of Kenya
- Related Prudential Guideline: [CBK/PG/XX]`,
    adaptation_notes:
      'CBK publishes circulars as source documents, not fill-in templates — this mirrors their header fields (reference, applicability, effective date, action required) so the briefing tracks the original. Link the source circular from the CBK circulars page.',
    source: 'CBK Circulars (Central Bank of Kenya)',
    source_url: 'https://www.centralbank.go.ke/policy-procedures/legislation-and-guidelines/circulars/',
    sort_order: 2,
  },
  {
    title: 'Internal Legal Memo (IRAC)',
    kind: 'briefing',
    category: 'regulatory_briefing',
    jurisdiction: 'General',
    description:
      'IRAC-structured internal memo for a lawyer to work through a regulatory question before drafting a client-facing briefing.',
    body: `INTERNAL LEGAL MEMORANDUM — PRIVILEGED & CONFIDENTIAL

To: [recipient]
From: [author]
Date: [date]
Re: [question, e.g. "Whether [Client]'s wallet product triggers CBK licensing"]

ISSUE
[The precise legal question, framed narrowly.]

RULE
[The governing law, regulation, circular, or guideline. Cite section numbers.]

APPLICATION
[Apply the rule to the client's facts. Address the strongest counter-argument.]

CONCLUSION
[Direct answer + confidence level + recommended next step.]

OPEN QUESTIONS
[Anything requiring more facts or a regulator confirmation.]`,
    adaptation_notes:
      'This is an internal drafting aid, not client-facing — it becomes the basis for a Regulatory Client Alert once approved. Keep it privileged. Cite Kenyan statute/regulation section numbers, not academic sources.',
    source: 'Legal memo format (Clio; Bloomberg Law "Master the Legal Memo Format")',
    source_url: 'https://www.clio.com/resources/legal-document-templates/legal-memo-template/',
    sort_order: 3,
  },

  // --- Data protection (ODPC) ---------------------------------------------
  {
    title: 'Data Protection Impact Assessment (DPIA)',
    kind: 'document',
    category: 'data_protection',
    jurisdiction: 'ODPC',
    description:
      'Structured DPIA for high-risk processing, mapped to the Kenya Data Protection Act obligation to assess before processing.',
    body: `DATA PROTECTION IMPACT ASSESSMENT

1. PROCESSING DESCRIPTION
Project / product: [name]
Nature of processing: [what data, collected how, used for what]
Data subjects: [customers / staff / minors …]
Categories of personal data: [list; flag any sensitive data]
Data controller: [Client]  |  Processors: [list]

2. NECESSITY & PROPORTIONALITY
Lawful basis (Kenya DPA 2019): [consent / contract / legal obligation / …]
Why this processing is necessary: [justification]
Data minimisation measures: [what is NOT collected, retention limits]

3. RISK ASSESSMENT
| Risk to data subjects | Likelihood | Severity | Overall |
|---|---|---|---|
| [e.g. unauthorised access] | [L/M/H] | [L/M/H] | [L/M/H] |
| [risk] | | | |

4. MITIGATIONS
[Controls that reduce each risk above — technical and organisational.]

5. OUTCOME
Residual risk: [Low / Medium / High]
ODPC prior consultation required? [Yes/No] — [rationale]
DPO / reviewer sign-off: [name, date]`,
    adaptation_notes:
      'Replace GDPR legal-basis language with Kenya Data Protection Act 2019 sections (DPIA duty under s.31). Add the ODPC prior-consultation trigger where residual risk stays high. Sensitive-data categories follow the Kenyan Act, not GDPR Article 9.',
    source: 'IAPP DPIA template; EDPB DPIA template',
    source_url: 'https://iapp.org/resources/article/template-for-data-protection-impact-assessment-dpia/',
    sort_order: 4,
  },
  {
    title: 'Privacy Notice',
    kind: 'document',
    category: 'data_protection',
    jurisdiction: 'ODPC',
    description:
      'Consumer-facing privacy notice covering what data is collected, why, and the rights available under the Kenya DPA.',
    body: `PRIVACY NOTICE — [Company]

Last updated: [date]

1. WHO WE ARE
[Company], ODPC registration no. [number], contact: [DPO email].

2. WHAT WE COLLECT
[Categories of personal data and how they are obtained.]

3. WHY WE COLLECT IT (PURPOSE & LAWFUL BASIS)
| Purpose | Data used | Lawful basis (Kenya DPA) |
|---|---|---|
| [e.g. account creation] | [data] | [contract] |

4. SHARING
We share personal data with [processors / partners] for [purpose]. [Cross-border transfers: destination + safeguard.]

5. RETENTION
We keep your data for [period / criteria].

6. YOUR RIGHTS
You may access, correct, delete, or object to processing of your data, and lodge a complaint with the ODPC. Contact [DPO email].

7. SECURITY
[Summary of safeguards.]`,
    adaptation_notes:
      'Swap GDPR/UK-GDPR references for Kenya DPA transparency requirements. Include the client’s ODPC data-controller registration number and DPO contact. Cross-border transfer wording must follow DPA s.48–50.',
    source: 'IAPP Consumer Privacy Notice template',
    source_url: 'https://iapp.org/resources/article/consumer-privacy-notice-template/',
    sort_order: 5,
  },
  {
    title: 'Personal Data Breach Notification Letter',
    kind: 'document',
    category: 'data_protection',
    jurisdiction: 'ODPC',
    description:
      'Notification letter to affected data subjects (and basis for the ODPC filing) after a personal-data breach.',
    body: `NOTICE OF A PERSONAL DATA BREACH

Date: [date]
To: [affected data subject / ODPC]

We are writing to inform you of a personal data breach affecting your information.

WHAT HAPPENED
On [date], [description of the incident and how it was discovered].

WHAT DATA WAS INVOLVED
[Categories of personal data affected.]

WHAT WE ARE DOING
[Containment, investigation, and remediation steps taken.]

WHAT YOU CAN DO
[Practical protective steps for the individual.]

CONTACT
For questions, contact our Data Protection Officer at [email / phone].

[Company], ODPC registration no. [number].`,
    adaptation_notes:
      'Align timelines to the Kenya DPA 72-hour ODPC notification requirement and the notification-form fields in the Data Protection (General) Regulations 2021. Keep a separate, fuller submission for the ODPC vs. the plain-language letter to individuals.',
    source: 'IAPP Data Security Breach Notice Letter template',
    source_url: 'https://iapp.org/resources/article/template-data-security-breach-notice-letter/',
    sort_order: 6,
  },
  {
    title: 'Data Processing Agreement (DPA)',
    kind: 'document',
    category: 'data_protection',
    jurisdiction: 'ODPC',
    description:
      'Controller–processor agreement setting out processing scope, security, sub-processing, and breach obligations.',
    body: `DATA PROCESSING AGREEMENT

Between: [Controller] ("Controller") and [Processor] ("Processor")
Effective date: [date]

1. SUBJECT MATTER & DURATION
The Processor processes personal data on behalf of the Controller for [purpose], for the term of [underlying agreement].

2. NATURE & PURPOSE OF PROCESSING
[Operations performed; categories of data subjects and personal data.]

3. PROCESSOR OBLIGATIONS
The Processor shall: (a) process only on documented instructions; (b) ensure confidentiality; (c) implement appropriate security measures; (d) assist the Controller with data-subject requests and breach notification; (e) not engage sub-processors without prior authorisation.

4. SUB-PROCESSING
[Approved sub-processors; flow-down obligations.]

5. INTERNATIONAL TRANSFERS
[Permitted destinations and safeguards.]

6. SECURITY MEASURES
[Technical and organisational measures — annex if long.]

7. BREACH NOTIFICATION
The Processor shall notify the Controller without undue delay and no later than [hours] after becoming aware of a personal data breach.

8. RETURN / DELETION
On termination, the Processor shall [return / delete] all personal data.`,
    adaptation_notes:
      'Replace EU/UK GDPR clauses with Kenya DPA processor obligations. Align the international-transfer clause to DPA s.48–50. Confirm the breach-notification window flows up in time for the Controller to meet the 72-hour ODPC deadline.',
    source: 'GDPR.eu Data Processing Agreement template',
    source_url: 'https://gdpr.eu/data-processing-agreement/',
    sort_order: 7,
  },
  {
    title: 'ODPC Registration Worksheet',
    kind: 'document',
    category: 'data_protection',
    jurisdiction: 'ODPC',
    description:
      'Worksheet to gather everything needed to register a client as a data controller or processor with the ODPC.',
    body: `ODPC REGISTRATION WORKSHEET

Entity name: [Client]
Registration sought: [Data Controller / Data Processor / Both]

1. ELIGIBILITY / THRESHOLD
Annual turnover: [amount]  |  Number of employees: [n]
Does the entity meet a mandatory-registration threshold? [Yes/No] — [basis]

2. ENTITY DETAILS
Registered address: [ ]  |  Contact person: [ ]  |  Data Protection Officer: [name, email]

3. PROCESSING OVERVIEW
Purposes of processing: [list]
Categories of data subjects: [list]
Categories of personal data (flag sensitive): [list]
Recipients / third parties: [list]
Cross-border transfers: [destinations + safeguard]

4. SECURITY & RETENTION
Summary of safeguards: [ ]
Retention schedule: [ ]

5. SUBMISSION CHECKLIST
- [ ] Certificate of incorporation
- [ ] Details of DPO
- [ ] Processing description
- [ ] Applicable fee`,
    adaptation_notes:
      'Anchor thresholds and required fields in the ODPC guidance and the Data Protection (General) Regulations 2021 rather than importing EU defaults. Verify the current registration fee and mandatory-registration thresholds on the ODPC portal before filing.',
    source: 'ODPC Guidelines; Data Protection (General) Regulations 2021',
    source_url: 'https://www.odpc.go.ke/guidelines-2/',
    sort_order: 8,
  },

  // --- Banking / fintech (CBK) --------------------------------------------
  {
    title: 'AML/CFT Policy',
    kind: 'document',
    category: 'banking_fintech',
    jurisdiction: 'CBK',
    description:
      'Anti-money-laundering / counter-terrorist-financing policy skeleton covering risk assessment, CDD, monitoring, and reporting.',
    body: `ANTI-MONEY LAUNDERING & COUNTER-FINANCING OF TERRORISM POLICY

1. PURPOSE & SCOPE
This policy sets out [Company]'s framework to prevent, detect, and report money laundering and terrorist financing, in line with POCAMLA and CBK requirements.

2. AML/CFT COMPLIANCE OFFICER
The [Money Laundering Reporting Officer] is [name/role], responsible for oversight, reporting, and training.

3. RISK ASSESSMENT
[Company] assesses ML/TF risk across customers, products, channels, and geographies. [Method + review frequency.]

4. CUSTOMER DUE DILIGENCE
- Standard CDD: [identity verification requirements]
- Enhanced CDD: [triggers — PEPs, high-risk jurisdictions, high-value]
- Simplified CDD: [low-risk conditions]

5. ONGOING MONITORING
[Transaction monitoring approach; thresholds; red flags.]

6. SUSPICIOUS TRANSACTION REPORTING
Staff report suspicions to the MLRO, who files a Suspicious Transaction Report with the Financial Reporting Centre (FRC). [No tipping-off.]

7. RECORD KEEPING
Records retained for [period] per POCAMLA.

8. TRAINING
[Frequency and coverage of AML/CFT training.]`,
    adaptation_notes:
      'Replace US BSA/FinCEN references with Kenya’s Proceeds of Crime and Anti-Money Laundering Act (POCAMLA) and CBK Prudential Guidelines. Suspicious Transaction Reports go to the Financial Reporting Centre (FRC), not FinCEN. Keep the FATF-aligned structure — it transfers well.',
    source: 'FINRA AML template for small firms; FATF-aligned AML/CFT policy structure',
    source_url: 'https://www.finra.org/compliance-tools/anti-money-laundering-template-small-firms',
    sort_order: 9,
  },
  {
    title: 'KYC / CDD Onboarding Checklist',
    kind: 'document',
    category: 'banking_fintech',
    jurisdiction: 'CBK',
    description:
      'Tiered know-your-customer checklist for onboarding individual and corporate customers.',
    body: `KYC / CDD ONBOARDING CHECKLIST

Customer type: [Individual / Corporate]  |  Risk rating: [Low / Medium / High]

TIER 1 — IDENTIFICATION
Individual:
- [ ] Full name & date of birth
- [ ] National ID / passport number
- [ ] KRA PIN
- [ ] Proof of address
Corporate:
- [ ] Certificate of incorporation
- [ ] CR12 / directors & shareholders
- [ ] KRA PIN (entity)
- [ ] Beneficial owners (>[X]%) identified

TIER 2 — DUE DILIGENCE
- [ ] Purpose & intended nature of relationship
- [ ] Source of funds / source of wealth
- [ ] PEP screening
- [ ] Sanctions / watchlist screening
- [ ] Enhanced due diligence applied where triggered

TIER 3 — ONGOING MONITORING
- [ ] Risk rating recorded
- [ ] Review date set: [date]
- [ ] Transaction monitoring enabled

Approved by: [name]  Date: [date]`,
    adaptation_notes:
      'Map identification requirements to Kenyan CBK KYC/CDD expectations — National ID and KRA PIN for individuals; certificate of incorporation, CR12, and beneficial ownership for corporates. Set EDD triggers to CBK/POCAMLA high-risk categories.',
    source: 'Industry KYC/CDD form structure (Clustdoc KYC templates)',
    source_url: 'https://clustdoc.com/blog/kyc-form-templates/',
    sort_order: 10,
  },
  {
    title: 'CBK Prudential Compliance Monitoring Checklist',
    kind: 'document',
    category: 'banking_fintech',
    jurisdiction: 'CBK',
    description:
      'Periodic self-assessment checklist mapping a client’s obligations to the relevant CBK prudential guidelines.',
    body: `CBK PRUDENTIAL COMPLIANCE MONITORING CHECKLIST

Institution: [Client]  |  Period: [quarter/year]  |  Prepared by: [name]

| Obligation area | Governing guideline (CBK/PG) | Status | Evidence | Gaps / actions |
|---|---|---|---|---|
| Corporate governance | [CBK/PG/XX] | [OK / Gap] | [ref] | [ ] |
| Capital adequacy | [CBK/PG/XX] | | | |
| Risk management | [CBK/PG/XX] | | | |
| AML/CFT | [CBK/PG/XX] | | | |
| Consumer protection | [CBK/PG/XX] | | | |
| Reporting / returns | [CBK/PG/XX] | | | |

SUMMARY
Open gaps: [n]  |  High-priority actions: [list]
Next review date: [date]`,
    adaptation_notes:
      'CBK does not publish a fill-in checklist — build the obligation rows from the actual CBK Prudential Guidelines and circulars that apply to the client’s licence category. Do not invent thresholds; cite the specific CBK/PG reference for each row.',
    source: 'CBK Prudential Guidelines (Central Bank of Kenya)',
    source_url: 'https://www.centralbank.go.ke/policy-procedures/legislation-and-guidelines/prudential-guidelines/',
    sort_order: 11,
  },

  // --- Board / management reporting ---------------------------------------
  {
    title: 'Compliance Risk Register',
    kind: 'document',
    category: 'board_reporting',
    jurisdiction: 'General',
    description:
      'Risk register tracking compliance risks, owners, likelihood/impact, and mitigation status.',
    body: `COMPLIANCE RISK REGISTER

Entity: [Client]  |  As at: [date]  |  Owner: [name]

| ID | Risk | Jurisdiction | Likelihood | Impact | Inherent rating | Mitigation / controls | Residual rating | Owner | Due |
|---|---|---|---|---|---|---|---|---|---|
| R1 | [e.g. late CBK returns] | CBK | [L/M/H] | [L/M/H] | [L/M/H] | [control] | [L/M/H] | [name] | [date] |
| R2 | [e.g. missed ODPC breach deadline] | ODPC | | | | | | | |
| R3 | [risk] | | | | | | | | |

RATING KEY
Likelihood / Impact: Low, Medium, High. Rating = Likelihood × Impact.

TOP RISKS THIS PERIOD
[Short narrative on the highest residual risks and what changed.]`,
    adaptation_notes:
      'Add the jurisdiction column (CBK / ODPC) and link each risk to the specific circular, guideline, or DPA section it derives from. Feed the top residual risks into the Board Compliance Status Report.',
    source: 'Smartsheet compliance risk register/matrix; SnapGRC risk register',
    source_url: 'https://www.smartsheet.com/content/compliance-risk-template-matrix',
    sort_order: 12,
  },
  {
    title: 'Board Compliance Status Report',
    kind: 'document',
    category: 'board_reporting',
    jurisdiction: 'General',
    description:
      'Concise board-level report on compliance posture, regulatory changes, incidents, and open actions.',
    body: `BOARD COMPLIANCE STATUS REPORT

Entity: [Client]  |  Period: [quarter]  |  Prepared by: [name]

1. EXECUTIVE SUMMARY
[3–4 sentences: overall compliance posture and any board decisions needed.]

2. REGULATORY DEVELOPMENTS
[New / pending CBK circulars and ODPC guidance affecting the entity, and the response.]

3. COMPLIANCE STATUS BY AREA
| Area | Status (RAG) | Commentary |
|---|---|---|
| Licensing / prudential | [R/A/G] | [ ] |
| AML/CFT | [R/A/G] | [ ] |
| Data protection | [R/A/G] | [ ] |
| Reporting / returns | [R/A/G] | [ ] |

4. INCIDENTS & BREACHES
[Any incidents this period, root cause, and remediation.]

5. TOP RISKS
[Pull from the Compliance Risk Register.]

6. OPEN ACTIONS
| Action | Owner | Due | Status |
|---|---|---|---|
| [ ] | [ ] | [ ] | [ ] |`,
    adaptation_notes:
      'Populate the regulatory-developments section from RegWatch briefings issued in the period. Keep it to what the board must decide or note — this is a summary layered on top of the Risk Register, not a re-listing of it.',
    source: 'GRC board-reporting practice (Smartsheet compliance reporting templates)',
    source_url: 'https://www.smartsheet.com/content/compliance-risk-template-matrix',
    sort_order: 13,
  },

  // --- Client onboarding / engagement -------------------------------------
  {
    title: 'Client Engagement Letter',
    kind: 'document',
    category: 'client_onboarding',
    jurisdiction: 'General',
    description:
      'Engagement letter setting scope, fees, communication, and the boundaries of the regulatory advisory relationship.',
    body: `ENGAGEMENT LETTER

[Date]
[Client name and address]

Dear [Client],

RE: ENGAGEMENT FOR REGULATORY ADVISORY SERVICES

Thank you for instructing MNL Advocates LLP. This letter sets out the terms of our engagement.

1. SCOPE OF SERVICES
We will advise on [regulatory intelligence, briefings, and compliance document support] in relation to [CBK and/or ODPC] matters. This engagement does not cover [out-of-scope matters, e.g. capital markets / CMA licensing, litigation].

2. FEES & BILLING
[Fee basis — retainer / hourly / fixed]. Invoices are issued [frequency] and payable within [days].

3. COMMUNICATION & PLATFORM ACCESS
Regulatory briefings and documents are delivered through the RegWatch platform. Access is limited to authorised users you nominate.

4. CONFIDENTIALITY
[Mutual confidentiality terms.]

5. TERM & TERMINATION
[How either party may end the engagement.]

Please sign and return a copy to confirm your agreement.

Yours faithfully,
[Lawyer], MNL Advocates LLP

Accepted: ______________________  Date: __________`,
    adaptation_notes:
      'Add an explicit jurisdiction-scope clause covering CBK and/or ODPC only, and expressly excluding CMA (out of scope for MVP). Reference RegWatch platform access terms and the client’s nominated authorised users.',
    source: 'Engagement-letter practice (Clio; ACTEC engagement-letter resources)',
    source_url: 'https://www.clio.com/blog/engagement-letter/',
    sort_order: 14,
  },
  {
    title: 'Client Onboarding Checklist',
    kind: 'document',
    category: 'client_onboarding',
    jurisdiction: 'General',
    description:
      'Step-by-step checklist to take a new client from conflict check to active RegWatch access.',
    body: `CLIENT ONBOARDING CHECKLIST

Client: [name]  |  Onboarding lawyer: [name]  |  Start date: [date]

INTAKE
- [ ] Conflict-of-interest check completed
- [ ] KYC / client identification collected
- [ ] Engagement letter signed and filed

SETUP
- [ ] Company profile created in RegWatch
- [ ] Sector recorded
- [ ] Jurisdiction(s) assigned (CBK / ODPC)
- [ ] Authorised users invited
- [ ] Gemini FileSearchStore provisioned (on first document publish)

KICKOFF
- [ ] Kickoff call held / scope confirmed
- [ ] Initial documents uploaded, assigned, and published
- [ ] First briefing scheduled

HANDOVER
- [ ] Client account status set to "active"
- [ ] Onboarding logged in audit trail`,
    adaptation_notes:
      'Insert the RegWatch-specific steps (company profile creation, jurisdiction assignment, authorised-user invites, Gemini FileSearchStore provisioning on first publish). Keep the conflict check and engagement letter as gating steps before any platform access is granted.',
    source: 'Law-firm client onboarding checklist (mylegalsoftware.com)',
    source_url: 'https://mylegalsoftware.com/law-firm-client-onboarding-checklist/',
    sort_order: 15,
  },
]

async function seed() {
  console.log('\n=== RegWatch Template Library Seed ===\n')

  for (const t of TEMPLATES) {
    const { data: existing } = await admin
      .from('templates')
      .select('id')
      .eq('title', t.title)
      .maybeSingle()

    if (existing) {
      const { error } = await admin
        .from('templates')
        .update({ ...t, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
      if (error) {
        console.error(`  [error] ${t.title}:`, error.message)
        process.exit(1)
      }
      console.log(`  [update] ${t.title}`)
    } else {
      const { error } = await admin.from('templates').insert(t)
      if (error) {
        console.error(`  [error] ${t.title}:`, error.message)
        process.exit(1)
      }
      console.log(`  [ok] ${t.title}`)
    }
  }

  console.log(`\nSeeded ${TEMPLATES.length} templates.\n`)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
