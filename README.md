# ShopBridge (Invoicer)

A modern invoice management app for freelancers and agencies.  
Create invoices, share public invoice links, and let clients accept invoices online.

## Features

- Email/password and Google sign-in with Supabase Auth
- Protected dashboard for managing invoices
- Invoice statuses: `DRAFT`, `SENT`, `ACCEPTED`
- Public invoice page at `/invoice/[token]` for client viewing
- Client acceptance flow from public link
- User settings for agency name and default currency
- PostgreSQL + Prisma schema for users, invoices, and line items

## Tech Stack

- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Prisma ORM
- Supabase Auth (`@supabase/ssr`, `@supabase/supabase-js`)
- PostgreSQL (Supabase recommended)

## Prerequisites

- Node.js 20+
- pnpm 10+
- A Supabase project
- A PostgreSQL database URL (Supabase Postgres works out of the box)

## Environment Variables

Copy `.env.example` to `.env` and fill values:

```bash
cp .env.example .env
```

PowerShell alternative:

```powershell
Copy-Item .env.example .env
```

Required variables:

- `DATABASE_URL` - pooled/transaction DB connection for Prisma
- `DIRECT_URL` - direct/session DB connection for Prisma migrations
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

## Local Development

1) Install dependencies

```bash
pnpm install
```

2) Set up environment

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

3) Sync Prisma schema to your database

```bash
pnpm db:push
```

4) Start development server

```bash
pnpm dev
```

App runs at `http://localhost:3000`.

## Available Scripts

- `pnpm dev` - start local dev server
- `pnpm build` - production build
- `pnpm start` - run built app
- `pnpm preview` - build then start
- `pnpm lint` - run ESLint
- `pnpm typecheck` - run TypeScript checks
- `pnpm check` - lint + typecheck
- `pnpm db:push` - push schema to database
- `pnpm db:generate` - run `prisma migrate dev`
- `pnpm db:migrate` - run `prisma migrate deploy`
- `pnpm db:studio` - open Prisma Studio

## Authentication Notes

- Middleware protects dashboard routes (`/invoices`, `/settings`, `/`)
- Public invoice routes (`/invoice/[token]`) remain accessible without auth
- OAuth callback route upserts user records into the app database

## Deploy to Vercel

1) Push code to GitHub/GitLab/Bitbucket
2) Import the repository into Vercel
3) Add all environment variables from `.env.example` in Vercel project settings
4) Ensure your database is hosted and reachable from Vercel
5) Deploy

For production database migrations, run:

```bash
pnpm db:migrate
```

`prisma generate` runs automatically on install via `postinstall`.