# Apparel Platform

Custom apparel design & printing platform. Customers design a T-shirt in-browser, order it, and pay via Paystack; businesses request uniform quotes; admin drives orders through a manual print-supplier workflow.

Full architecture/roadmap: see the plan this project was scaffolded from (pricing model, DB schema, route structure, milestone order). Ask before assuming scope beyond the current milestone.

## Stack

Next.js (App Router) + TypeScript + React + Tailwind CSS + Supabase (Postgres/Auth/Storage) + Fabric.js (design editor) + Paystack (payments, Nigeria).

## Conventions

- **Business logic lives in `src/lib/`, not in components.** Pricing calculation, order status transitions, print-safe-area/resolution checks are framework-agnostic TS functions with Vitest coverage, imported by both UI and server actions.
- **No hardcoded prices or supplier info.** Pricing (`pricing_rules`, `delivery_config`) and supplier details (`suppliers`) are DB-driven and admin-editable, never literals in code.
- **Supabase clients**: `src/lib/supabase/client.ts` (browser), `src/lib/supabase/server.ts` (Server Components/Actions, uses `server-only`), `src/lib/supabase/middleware.ts` (session refresh, wired in `src/proxy.ts` — Next.js 16's `proxy` file convention, formerly `middleware.ts`). Never import the service-role key into anything client-reachable — it's reserved for narrow server-only paths (e.g. the Paystack webhook) and enforced via the `server-only` package.
- **RLS is the real security boundary.** Route/middleware role checks (e.g. `/admin/*`) are a UX convenience; Postgres RLS policies must independently enforce the same rules.
- **Payment amounts are always server-computed** from `pricing_rules`/`delivery_config` — never trust a client-submitted price. The Paystack webhook (not the client success callback) is the source of truth for marking an order paid.
- **Env vars**: copy `.env.local.example` to `.env.local` and fill in Supabase/Paystack keys. `NEXT_PUBLIC_*` vars are browser-exposed; anything else must stay server-only.
- **Small, verifiable milestones.** Each build stage gets its own check-in before moving to the next — don't build ahead of the current milestone.

## Testing

`pnpm test` runs Vitest. Business logic in `src/lib/` (pricing, order state machine, resolution/print-safe checks) should have unit test coverage as it's written, not retrofitted later.
