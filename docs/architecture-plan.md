# Custom Apparel Design & Printing Platform — MVP Architecture & Roadmap

## Context

The goal is a lean, real-revenue MVP: customers design a T-shirt in-browser, order it, and pay via Paystack; businesses request uniform quotes; a lightweight admin dashboard drives the order through a manual print-supplier workflow. This is a **planning document only** — no application code is written yet. It captures environment findings, the confirmed product decisions, the full architecture, and a staged build order. Nothing below gets built until you approve and tell me which milestone to start.

Confirmed decisions from this session:
- **Pricing tier** at checkout is customer-selected (standard / front+back / premium graphic), with admin able to correct the tier/price during design review before sending to print.
- **Accounts are required before using the editor** (no guest/anonymous design) — simplifies ownership, ties every design to a user from creation.
- **Delivery fee** is a single flat, admin-configurable amount for V1 (no zones/distance calc).
- **No transactional email in V1** — admin works from the dashboard, customers check the order-tracking page. Email is a Should-Have-Later item.

---

## 1. Environment Findings

| Tool | Version | Notes |
|---|---|---|
| Node.js | v22.23.1 | Current LTS-adjacent, fine for Next.js 15 |
| npm | 11.7.0 | present |
| pnpm | 11.17.0 | present — **recommended package manager** (faster installs, disk-efficient, good Next.js support) |
| yarn | not actually installed | invoking it triggers a Corepack download; skip it, use pnpm |
| Git | 2.49.0 | present |
| GitHub CLI (`gh`) | not found | not required unless you want PR workflows from the terminal |

Current working directory (`C:\Users\USER`) is your Windows home folder, **not a git repo**, and holds several sibling project folders (`marketplace-frontend`, `school-management-prototype`, `dispatch_rider_new`, `novascale`, `scf`, `FindIt`). This new project should live in its **own new sibling folder** (proposed: `C:\Users\USER\apparel-platform`), initialized as its own git repo — not inside the home directory root itself.

## 2. Claude Code Skills — Where They Live & How to Reuse Them

Findings:
- There is **no project-level `.claude/skills` folder** (none needed here yet) and **no global `~/.claude/skills` folder** either.
- Your skill set (`frontend-design`, `code-review`, `code-simplifier`, `security-guidance`, `commit-commands`, `feature-dev`, etc.) comes from **plugins registered globally in `~/.claude.json`** under the `claude-plugins-official` marketplace, plus a set of built-in bundled skills (`dataviz`, `artifact-design`, etc.) that ship with Claude Code itself and are available in every project automatically.
- **This means your plugin/skill setup is already global** — it applies to every project on this machine, including a new `apparel-platform` folder, with zero extra setup. You do not need to reinstall anything per-project.

Recommendation for organizing reusable skills going forward:
1. Keep general-purpose skills (frontend-design, code-review, commit-commands, etc.) registered globally as they are now — that's the correct place for anything you want in *every* project.
2. If/when this project needs a **project-specific** skill (e.g., a custom "apparel-pricing-rules" or "editor-conventions" skill capturing this codebase's own patterns), create it under `apparel-platform/.claude/skills/<name>/` so it travels with the repo and is shared with anyone who clones it — don't put project-specific skills in the global folder, or every unrelated project will pick them up.
3. A `CLAUDE.md` at the root of the new project (created during Milestone 0) should capture project-specific conventions (business logic location, pricing-config rules, RLS patterns) so future sessions don't need to be re-briefed — this is separate from skills but serves the same "don't repeat myself" goal.

## 3. Tech Stack & Dependency Justification

Base stack (as you specified): Next.js (App Router) + TypeScript + React + Tailwind CSS + Supabase + Paystack.

| Dependency | Why it's needed |
|---|---|
| **Fabric.js** (v6) | Canvas/editor engine. Gives object model (text/image/shape), built-in resize/rotate/move handles, and JSON serialization out of the box — this is what lets us save/reload a design and export high-res PNGs without hand-building transform-handle UI. Chosen over Konva (lower-level, more UI to build ourselves) and over paid engines like Polotno (licensing cost not justified for MVP). |
| **zustand** | Editor UI state (selected object, active side, undo/redo stack, dirty flag). Chosen over Redux (too much boilerplate for this scope) and over plain React context (would cause re-render/perf issues with a canvas-heavy tree). |
| **@supabase/ssr** + **@supabase/supabase-js** | Official client libraries for Supabase auth/session handling in Next.js App Router (server + browser clients) and DB/storage access. |
| **zod** | Runtime validation for forms and server actions (checkout, quote requests), with types inferred once and reused client + server side — avoids duplicating validation logic and catches bad input before it reaches Postgres. |
| **react-hook-form** | Form state for multi-field forms (checkout, quote requests, custom-design requests) with less re-render overhead and boilerplate than hand-rolled state, integrates directly with zod. |
| **SWR** | Light client-side data revalidation for the handful of places that need it: order-tracking page (poll status), admin tables. Chosen over @tanstack/react-query for a smaller footprint — we don't need query's full mutation/cache machinery for this scope. |
| Paystack integration | Use Paystack's REST API directly via `fetch` (initialize/verify transaction) plus their **Inline JS** loaded via a `<script>` tag for the payment popup — no extra npm dependency required for this; a dedicated SDK isn't needed for the ~2 endpoints we call. |
| **Radix UI primitives** (selectively: Dialog, Dropdown, Toast, Tabs) | Accessible, unstyled behavior (focus trap, keyboard nav, portal handling) for modals/menus/toasts — we still fully own the visual design in Tailwind, so this does **not** produce a generic "shadcn look"; it just saves us from re-implementing a11y-correct dialog/dropdown logic by hand. |
| **next/font** | Self-hosted custom typography, no extra dependency, avoids layout shift/FOUT from a generic system font. |
| **Vitest** | Unit tests for pure business logic (pricing calculator, order state machine, print-safe-area/resolution checks) — fast, zero-config with TS. |

Explicitly **not** adding yet (and why): Redux/React Query (zustand/SWR cover this scope), Framer Motion (nice-to-have for landing-page polish, defer to a later milestone rather than adding upfront), Resend/email SDK (no email in V1 per your decision), pdf-lib/vector export tooling (MVP export is high-res PNG only), any AI/generation SDK (custom design requests are a manual form, not AI-generated).

---

## 4. Scope Tiers

### MUST HAVE — V1
- Landing page (conversion-focused, apparel-brand visual identity)
- Auth: Supabase email/password signup+login (required before editor use)
- Product browsing: T-shirt product with a small set of colors
- Design editor: blank start or template start, add/edit text, upload image, move/resize/rotate, shape primitives, front/back toggle, shirt color select, print-safe-area guide, low-resolution upload warning
- Save design (tied to account, autosave)
- Flat mockup preview (front/back, color-accurate)
- Export/download design (PNG, high-res) — free in V1
- Checkout: tier self-selection (standard / front+back / premium), delivery details, flat delivery fee
- Payment: Paystack (initialize server-side, webhook-verified)
- Order confirmation + customer-facing order status/tracking page
- Admin: view orders, view/download design (incl. print-ready PNG), change order status (validated transitions), minimal pricing-config table, minimal delivery-fee config
- "Request a custom design" — simple form → admin queue
- "Request a business quote" — simple form → admin queue
- Template gallery seeded with a first batch of templates (inserted directly via admin table or a seed script — a full template-management *UI* is not required to launch, just the schema + a way to add rows)

### SHOULD HAVE — Later
- Full admin UI for template/product/color management (beyond direct table edits)
- Reordering a previous design as a new order
- Multiple product types (polo, hoodie) and multi-item cart
- Transactional email (order confirmation, status changes, new-lead alerts)
- Order status history timeline UI
- Automated bulk/tiered pricing for business quotes
- Zone/distance-based delivery pricing
- Design duplication/versioning
- Staff sub-roles beyond a single admin role
- Framer Motion micro-interactions on marketing pages

### DO NOT BUILD YET
- AI design generation
- 3D/WebGL realistic garment rendering
- Native mobile app
- Multi-currency/international checkout
- Automated supplier API integration (auto-send to printer)
- True vector/CMYK print-file pipeline (V1 export is high-res PNG)
- Inventory/warehouse management
- Loyalty/referral programs
- Multi-tenant/white-label

---

## 5. Database Schema (Supabase / Postgres)

All tables get RLS enabled; customers can only read/write their own rows, admin (via `profiles.role = 'admin'`) has broader access through explicit policies — never through the service-role key in client code.

- **profiles** — `id` (FK auth.users), `full_name`, `phone`, `role` enum(`customer`,`admin`), `created_at`
- **products** — `id`, `slug`, `name`, `description`, `is_active`, `created_at`
- **product_colors** — `id`, `product_id` FK, `name`, `hex`, `front_mockup_url`, `back_mockup_url`, `is_active`
- **template_categories** — `id`, `slug`, `name`, `sort_order`
- **design_templates** — `id`, `category_id` FK, `title`, `thumbnail_url`, `canvas_json` (seed Fabric JSON), `is_active`
- **designs** — `id`, `user_id` FK, `product_id` FK, `color_id` FK, `front_canvas_json`, `back_canvas_json`, `front_thumbnail_url`, `back_thumbnail_url`, `source_template_id` nullable, `created_at`, `updated_at`
- **design_assets** — `id`, `design_id` FK, `user_id` FK, `storage_path`, `original_filename`, `width_px`, `height_px`, `low_res_warning` bool, `created_at`
- **pricing_rules** — `id`, `key` (`standard`/`front_back`/`premium_graphic`), `label`, `customer_price`, `supplier_cost`, `currency` default `NGN`, `is_active`, `updated_at` — admin-editable, no hardcoded prices in app code
- **delivery_config** — `id`, `label`, `fee`, `is_active` (flat fee, admin-editable)
- **orders** — `id`, `user_id` FK, `design_id` FK, `pricing_rule_id` FK, `status` enum (the pipeline below), `unit_price`, `quantity`, `subtotal`, `delivery_fee`, `total`, `currency`, `delivery_address` jsonb, `admin_notes`, `created_at`, `updated_at`
- **order_status_history** — `id`, `order_id` FK, `status`, `note`, `changed_by` FK profiles nullable, `created_at`
- **payments** — `id`, `order_id` FK, `provider` default `paystack`, `reference`, `status`, `amount`, `raw_payload` jsonb, `verified_at`
- **business_quote_requests** — `id`, `user_id` FK nullable, `company_name`, `contact_name`, `email`, `phone`, `organization_type`, `garment_types` text[], `estimated_quantity`, `notes`, `status` enum(`new`,`contacted`,`quoted`,`won`,`lost`), `created_at`
- **custom_design_requests** — `id`, `user_id` FK nullable, `description`, `reference_image_urls` text[], `budget_hint`, `status` enum(`new`,`in_progress`,`delivered`,`cancelled`), `created_at`
- **suppliers** — `id`, `name`, `contact_info` jsonb, `is_active` (kept configurable, not hardcoded, even with a single row in V1)

Storage buckets: `mockups` (public), `thumbnails` (public), `uploads` (private, user-scoped path), `print-ready` (private, admin/service access only).

Order status pipeline (enum, single source of truth mirrored in `lib/orders/status.ts`):
`pending_payment → paid → design_review → approved → sent_to_printer → printing → quality_check → ready → out_for_delivery → delivered`, plus `cancelled` and `problem` as side-states reachable from most steps.

## 6. Page/Route Structure (Next.js App Router)

**Customer**
- `/` — landing
- `/products`, `/products/[slug]` — browse → "Start designing"
- `/inspiration`, `/inspiration/[category]` — template gallery
- `/editor/new`, `/editor/[designId]` — the design tool (auth-gated)
- `/custom-design` — "design it for me" request form
- `/business`, `/business/quote` — uniforms/organizations landing + quote form
- `/checkout` — tier confirmation, delivery details, pay
- `/orders`, `/orders/[id]` — customer order list + tracking (auth-gated)
- `/account` — profile, saved designs
- `/login`, `/signup`, `/auth/callback`

**Admin** (`/admin/*`, middleware + RLS-enforced role gate)
- `/admin` — overview
- `/admin/orders`, `/admin/orders/[id]`
- `/admin/templates`
- `/admin/products`
- `/admin/pricing`
- `/admin/quotes`
- `/admin/custom-requests`

**Server-only route handlers**
- `/api/payments/paystack/webhook` (must be a raw route handler for signature verification; everything else uses Server Actions)

## 7. Design Editor Architecture

- A single Fabric.js canvas wrapped in `<DesignCanvas />`, driven by a `useDesignEditor` hook exposing imperative actions (`addText`, `addImage`, `addShape`, `updateProps`, `deleteSelected`, `reorderLayer`, `toggleSide`).
- `useEditorStore` (zustand) owns UI state: active side (`front`/`back`), selection, undo/redo snapshot stack (debounced), dirty flag.
- One canvas instance; toggling front/back loads the other side's serialized JSON in and swaps the current side's JSON out — both sides persisted on `designs.front_canvas_json` / `back_canvas_json`.
- Print-safe area rendered as a non-exporting guide rectangle per product; objects crossing it trigger an inline warning (not a hard block, for MVP).
- Image upload: client checks `naturalWidth`/`naturalHeight` against the object's on-canvas print size and a DPI threshold immediately on add → inline warning if too low → user may proceed or replace → file uploaded to the private `uploads` bucket.
- Autosave: debounced write of canvas JSON (both sides) + a low-res thumbnail (`canvas.toDataURL`) to `designs`/`thumbnails`.
- Export: `toDataURL({ multiplier })` per side at high resolution for the customer's PNG download; the *same* high-res PNG is what admin pulls as the "print-ready" file for V1 — no separate vector/CMYK pipeline yet.
- Pure logic (pricing calc, resolution-warning threshold, print-safe-area check, status-transition validation) lives in framework-agnostic `lib/` modules with Vitest coverage, imported by both the editor UI and server actions — keeps business logic out of components per your rule.

## 8. Order/Payment Architecture

- Checkout: customer selects pricing tier (standard/front+back/premium) and delivery option → price is **always recomputed server-side** from `pricing_rules`/`delivery_config` (never trusted from the client) → an `orders` row is created with `status = pending_payment` before Paystack is invoked.
- Paystack transaction is initialized **server-side** (secret key stays server-only) with the order's server-computed amount and a reference tied to the order id; the browser only ever sees the public key + Inline JS popup.
- **Webhook is the source of truth**: `/api/payments/paystack/webhook` verifies the signature, verifies the amount matches the order, upserts `payments`, and — only from there — flips `orders.status` to `paid` and inserts an `order_status_history` row. Client-side "success" callback is UX-only, never trusted to mark payment complete.
- All further status transitions (`design_review` → … → `delivered`) are admin-driven from `/admin/orders/[id]`, validated against the allowed-transitions map in `lib/orders/status.ts`. If admin corrects the pricing tier during review (per your confirmed flow), that's a logged edit on the order with the price delta handled manually for V1 (no auto refund/charge integration yet).
- Reorder (Should-Have-Later) is architecturally free: `orders.design_id` points at a persisted, never-hard-deleted `designs` row, so "reorder" is just "create a new order referencing the same design_id, price it fresh."

## 9. Admin Architecture

- `/admin/*` protected by Next middleware checking session + `profiles.role === 'admin'`, **mirrored by Postgres RLS policies** so DB access is enforced even if a route-level check were ever bypassed (defense in depth).
- Admin mutations run through the authenticated admin's own Supabase session (RLS-scoped), not the service-role key. The service-role key is reserved for narrow server-only paths (e.g., the payment webhook) and is never imported into any client-bundled file — enforced via the `server-only` package import guard.
- Admin order detail view: design preview (front/back), signed-URL download of the print-ready PNG (private bucket), customer + delivery info, status dropdown restricted to valid next-states, notes field.

## 10. Key Risks

**Technical**
- Fabric.js performance on low/mid-range Android devices with several layers — mitigate by capping layer count in V1 and testing on real mid-range hardware, not just desktop.
- "Realistic mockup" is flat-image compositing, not 3D drape — worth aligning expectations now so it isn't read as a scope miss later.
- Resolution/print-safe-area math touches every object transform — needs solid unit-test coverage (Vitest) rather than manual QA alone.
- Paystack webhook must be idempotent (retries happen) and must independently verify amount — a naive implementation is a real revenue-integrity risk.

**Business**
- At ₦8k/9k/11k customer pricing against ₦5–7k supplier cost, Paystack fees (~1.5%) and the flat delivery fee eat into margin fast — worth modeling real per-order margin before committing to these numbers publicly.
- Manual admin correction of the pricing tier (your confirmed flow) means a customer can pay the wrong amount at checkout and the difference is handled manually — fine at low volume, but a support burden if order volume grows before this is automated.
- No email notifications in V1 means customers must actively return to `/orders/[id]` to learn their status — acceptable for a lean MVP, but likely the first thing to add once there's order volume.

## 11. Open Assumptions To Confirm Before Coding

1. **Project location/name**: new sibling folder `C:\Users\USER\apparel-platform`, its own git repo — confirm name/location. **Confirmed: `apparel-platform`.**
2. **Package manager**: pnpm (already installed) — confirm, or you'd prefer npm. **Confirmed: pnpm.**
3. **Auth methods**: email/password (+ Supabase magic link) only for V1, no social login — confirm.
4. **Product catalog scope**: T-shirts only at launch, schema supports more products later — confirm.
5. **Hosting target**: assuming Vercel for the Next.js app + Supabase cloud project — confirm.
6. **Paystack account**: do you already have a Paystack merchant account (test + live keys), or does that need to be set up before we reach the payment milestone? **Confirmed: already have an account.**

---

## 12. Staged Build Order

Each milestone ends in something runnable/demoable before moving on.

- **M0 — Project setup**: repo init, Next.js + TS + Tailwind scaffold, Supabase project + local env wiring, base folder structure (`app/`, `lib/`, `components/`), CLAUDE.md, lint/format, Vitest configured.
- **M1 — Visual foundation**: design tokens (color/type/spacing), base component system, landing page shell — establishes the brand look before any functional UI is built on top of it.
- **M2 — Auth + product browsing**: Supabase auth (signup/login), `products`/`product_colors` schema + seed, `/products` browsing pages.
- **M3 — Design editor core**: Fabric canvas, text/image/shape tools, move/resize/rotate, front/back toggle, color select, save/autosave, print-safe-area + resolution warning.
- **M4 — Mockup preview + export**: composited flat mockup preview, high-res PNG export/download.
- **M5 — Checkout + Paystack**: `pricing_rules`/`delivery_config` schema, checkout flow, server-side price computation, Paystack initialize + webhook, order confirmation.
- **M6 — Order tracking + admin core**: `/orders/[id]` tracking page, `/admin/orders` list/detail, status transitions, print-ready download.
- **M7 — Templates, custom-design & business-quote requests**: template schema + gallery, `/custom-design` and `/business/quote` forms + admin queues.
- **M8 — Hardening pass**: RLS audit, error states, mobile QA pass on the editor, Vitest coverage on pricing/status logic.

Each milestone will get its own short plan/approval before implementation starts, per your "small, verifiable milestones" rule.
