# RegWatch

RegWatch is an AI-powered regulatory intelligence platform built by **MNL Advocates LLP (MN Legal)**, a Nairobi-based legal tech law firm. It delivers regulatory briefings, secure document management, and compliance chat to fintech and crypto startups, SMEs, and international organisations operating in Kenya.

This is a specialized, human-in-the-loop platform where every piece of content reaching a client must be reviewed and approved by an MNL lawyer. It acts as an extension of MNL's legal practice.

## Core Features

- **Document Management**: Securely upload and assign regulatory documents directly to clients, with strict jurisdiction gating enforced at the database level.
- **Regulatory Briefings**: Lawyers draft and approve briefings regarding changes in CBK or ODPC regulations, automatically sending notifications via email.
- **AI Compliance Chat**: Clients can ask questions about regulations, with AI strictly grounded in the client's published documents using RAG (Retrieval-Augmented Generation).
- **Role-Based Access**: Specialized portals for Admins, Lawyers, and Clients ensuring total separation of concerns and data privacy.

## Tech Stack

- **Frontend:** [Next.js 14](https://nextjs.org/) (App Router), TypeScript, Tailwind CSS
- **Backend:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, pgvector, Edge Functions)
- **AI / Compute:** Anthropic Claude API (Claude 3.5 Sonnet) via RAG pipeline
- **Email:** Resend + React Email
- **Deployment:** Vercel

## Getting Started

### Prerequisites

You need Node.js installed along with a package manager (`npm`, `yarn`, `pnpm`, or `bun`).

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables by copying `.env.local.example` or creating a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ANTHROPIC_API_KEY=your_anthropic_key
   RESEND_API_KEY=your_resend_key
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development Constraints

- **Human approval is mandatory**: No content gets to clients without a lawyer's approval.
- **No self-signup**: All onboarding is handled strictly by the lawyers.
- **Data Privacy**: RLS (Row Level Security) strictly isolates client data. AI cannot retrieve context from documents outside a client's specific jurisdiction and approved file list.

## Architecture & Roadmap

Please refer to `architecture.md` and `ROADMAP.md` for in-depth system architecture and the current build phase targets leading up to the scheduled June 2026 Summit demo.
