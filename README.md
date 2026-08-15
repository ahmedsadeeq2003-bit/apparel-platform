# Apparel Platform

Custom apparel design & printing platform. Customers design a T-shirt in-browser, order it, and pay via Paystack; businesses request uniform quotes; admin drives orders through a manual print-supplier workflow.

Stack: Next.js (App Router) + TypeScript + React + Tailwind CSS + Supabase (Postgres/Auth/Storage) + Fabric.js (design editor) + Paystack (payments, Nigeria).

## Getting started

```bash
pnpm install
cp .env.local.example .env.local   # fill in Supabase keys, see below
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Where to find it | Exposure |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API | Browser-exposed |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API | Browser-exposed |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Project Settings → API | **Server-only** — never expose to the client |
| `NEXT_PUBLIC_SITE_URL` | The app's own URL (`http://localhost:3000` locally, the production domain when deployed) | Browser-exposed |

`NEXT_PUBLIC_*` variables are bundled into client JS. Everything else stays server-only, enforced via the `server-only` package for the handful of paths that touch the service-role key.

## Database

Schema and seed data live in `supabase/migrations/` and `supabase/seed.sql`. Apply migrations with the Supabase CLI (`supabase db push`) or via the Supabase dashboard's SQL editor for a hosted project.

## Testing

```bash
pnpm test    # Vitest — business logic in src/lib/
pnpm lint    # ESLint
pnpm build   # production build / type-check
```

## Deployment (Vercel)

This is a standard Next.js App Router project — Vercel auto-detects the build (`pnpm build`) and output. Steps:

1. Import the GitHub repo into a new Vercel project.
2. Add the four environment variables above in the Vercel project's **Settings → Environment Variables** (set `NEXT_PUBLIC_SITE_URL` to the assigned `*.vercel.app` domain, or a custom domain once attached).
3. In the Supabase dashboard, add the deployed URL to **Authentication → URL Configuration** (Site URL and Redirect URLs) so auth callbacks (`/auth/callback`) resolve correctly in production.
4. Deploy. Paystack keys aren't required yet — payments aren't wired up until a later milestone.
