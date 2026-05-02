# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Package manager:** pnpm

```bash
pnpm dev          # Start dev server (Turbo mode)
pnpm build        # Production build
pnpm typecheck    # TypeScript type checking
pnpm lint         # ESLint check
pnpm lint:fix     # ESLint with auto-fix
pnpm format:write # Prettier auto-format

# Database
pnpm db:push      # Push schema changes (no migration file)
pnpm db:generate  # Run prisma migrate dev
pnpm db:migrate   # Run prisma migrate deploy (production)
pnpm db:studio    # Open Prisma Studio
```

## Architecture Overview

**ShopBridge** is a Next.js 15 App Router invoice management app for freelancers/agencies, using Supabase Auth + Prisma ORM on PostgreSQL.

### Auth Flow

Two-layer auth system:
1. **Supabase Auth** — handles sessions, OAuth, JWTs (via cookies)
2. **Prisma User table** — mirrors Supabase auth users for relational data

`getCurrentUser()` in [src/lib/auth.ts](src/lib/auth.ts) does a lightweight JWT check via Supabase. `ensureDbUser()` upserts the Supabase auth user into the Prisma `User` table — call this in routes that need the DB user record. The OAuth callback at `src/app/api/auth/callback/route.ts` runs `ensureDbUser()` after login.

Middleware ([src/middleware.ts](src/middleware.ts)) protects `/invoices`, `/settings`, and `/` (redirects to login), and redirects authenticated users away from `/login`/`/register`. The `/invoice/[token]` route and `/api/` are public.

### Route Structure

```
src/app/
├── (auth)/          # Login, register pages
├── (dashboard)/     # Protected: invoices list, settings
│   └── layout.tsx   # Checks auth, calls ensureDbUser
├── invoice/[token]/ # Public client-facing invoice view
└── api/
    ├── auth/callback/
    ├── invoice/[token]/        # Public invoice fetch + accept
    ├── invoices/               # CRUD (list, create)
    ├── invoices/[id]/          # CRUD (get, update, delete)
    ├── invoices/[id]/send/     # Mark invoice as SENT
    └── user/                   # Profile get/update
```

All API routes: authenticate with Supabase → validate with Zod → query Prisma → return `NextResponse.json()`.

### Database Models

Defined in [prisma/schema.prisma](prisma/schema.prisma). Prisma client outputs to `generated/prisma/`.

- **User** — linked to Supabase auth user by ID; stores `agencyName`, `currency` preference
- **Invoice** — has `status` (DRAFT → SENT → ACCEPTED), a unique `token` for public sharing, `taxPercent`, and `dueDate`
- **LineItem** — belongs to Invoice; `quantity` and `unitPrice` are `Decimal`

Cascading deletes: User → Invoice → LineItem.

Import the Prisma client from [src/server/db.ts](src/server/db.ts) (singleton with global instance).

### Key Conventions

- **Path alias:** `~/` maps to `src/` (e.g., `import { db } from "~/server/db"`)
- **Tailwind CSS v4** — no `tailwind.config.js`; configured via CSS and `@tailwindcss/postcss`
- **Environment validation** at startup via `@t3-oss/env-nextjs` in [src/env.js](src/env.js) — add new env vars here before using them
- **Supabase clients:** use `src/lib/supabase/server.ts` in Server Components/API routes, `src/lib/supabase/client.ts` in Client Components
- **Currency/formatting utils** in [src/lib/utils.ts](src/lib/utils.ts): `formatCurrency()`, `calculateTotal()`, `generateInvoiceNumber()`

### Environment Variables

See [.env.example](.env.example). Required:
- `DATABASE_URL` — pooled connection (Supabase Transaction pooler)
- `DIRECT_URL` — direct connection (for migrations only)
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
