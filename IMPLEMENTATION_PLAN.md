# Fatortak remediation plan

Status legend: `DONE` implemented and verified; `IN PROGRESS` being changed; `TODO` planned; `DEFERRED` requires product decision or external service.

Last updated: 2026-10-27

## P0 — release blockers

| # | Work item | Status | Verification |
|---|---|---|---|
| P0-1 | Fix tenant resolution: authenticated principal required, membership checked on every request, no Host-only tenancy | DONE | Build + auth matrix tests |
| P0-2 | Require authorization by default; explicit allow-list for login/register/reset/public invoice | DONE | Controller audit |
| P0-3 | Add `[Authorize]`/role restrictions to Dashboard, Companies, WorkSetting, Subscriptions, Backfill | DONE | Controller audit |
| P0-4 | Fix sales and purchase journal entries; unify VAT calculation; assert debit = credit | DONE | Build + accounting tests |
| P0-5 | Replace public invoice GUID access with signed, expiring tokens | DONE | Manual link test |
| P0-6 | Remove committed Supabase client and OpenReplay key from source; make analytics opt-in via env | DONE | `git grep` |
| P0-7 | Remove password-reset Gmail CC; configurable reset URL; token no longer in query string | DONE | Code review |
| P0-8 | Enforce role allow-list; tenant Admin cannot create/promote SysAdmin | DONE | Service review |
| P0-9 | Harden AI SQL execution: single SELECT only, block dangerous constructs, tenant predicate required, timeout + row cap | DONE | Unit-style checks |
| P0-10 | Fix cross-tenant IDORs in installments, chat, profiles, items, customers | DONE | Service review |
| P0-11 | Make invoice/payment transitions atomic; reject payments on cancelled/paid invoices; unique invoice number | DONE | Build + code review |
| P0-12 | Harden uploads: extension/MIME allow-list, safe download headers, no active content | DONE | Code review |
| P0-13 | Password policy and JWT key validation | DONE | Startup check |
| P0-14 | CORS allow-list, Swagger only in Development, rate limiting, security headers | DONE | Build + config review |

## P1 — high-impact

| # | Work item | Status | Verification |
|---|---|---|---|
| P1-1 | Implement missing backend endpoints: mark-paid, duplicate, switch-tenant | DONE | Route audit |
| P1-2 | Resolve PDF endpoint gap: remove broken UI action and expose a clear unsupported response | PARTIAL | The broken helper is unused; backend PDF remains deferred |
| P1-3 | Add `/reports`, `/reports-group`, `/invoice-templates` routes/redirects | DONE | `tsc` + route review |
| P1-4 | Fix `InvoiceDetailsModal` and `ModernHeader` runtime errors | DONE | `tsc` |
| P1-5 | Make API client fail loudly; no `onSuccess` on failed mutations; preserve return path on 401 | DONE | Invoice mutations now reject on failure |
| P1-6 | Sanitize Markdown and print output; remove `rehypeRaw` risk | DONE | Dependency + code review |
| P1-7 | Prevent CSV formula injection | DONE | Code review |
| P1-8 | Enforce quotas/subscriptions or remove advertised limits | DONE | QuotaService + UI limits |
| P1-9 | Single source of truth for plan prices | DONE | `config/plans.ts` |
| P1-10 | Fix expense lookup by exact reference; validate non-negative amounts | DONE | Service review |
| P1-11 | Exclude cancelled/draft invoices from sales reports | DONE | Service review |
| P1-12 | Payroll uniqueness/transaction guard | TODO | Service review |
| P1-13 | Frontend typecheck clean and CI gate | DONE | `tsc -p tsconfig.app.json` exits 0 |
| P1-14 | Add backend test project for auth, accounting, invoice/payment invariants | TODO | `dotnet test` |
| P1-15 | Add frontend tests for routing, API error handling, money formatting | TODO | `npm test` |
| P1-16 | Add CI secret scan, dependency audit, typecheck, tests | TODO | CI run |
| P1-17 | Remove/move stray root `package.json`; align env examples | PARTIAL | Env examples aligned; root file still untracked |
| P1-18 | Stakeholder module: CRUD for stakeholders, linked chart-of-accounts account, ownership/type metadata | DONE | API + UI + migration |
| P1-19 | Stakeholder transactions: capital contribution, dividend, loan, repayment, withdrawal; accounting postings | DONE | API + ledger postings |
| P1-20 | Stakeholders page with list, create/edit modal, transaction history, balances | DONE | `tsc` + build |
| P1-21 | Competitor parity gap analysis and missing pages (credit notes, recurring invoices, bank reconciliation, audit trail, approval queue) | TODO | Gap matrix |
| P1-22 | Add the highest-value missing pages: credit/debit notes, recurring invoices, reconciliation workspace | TODO | Routes + APIs |
| P1-23 | Consistent design system: typography, spacing, colors, empty/loading/error states, table patterns, modals, RTL | PARTIAL | `.input`, stakeholder page, insights page |
| P1-24 | Professional UI pass on dashboard, invoices, accounting, reports, settings, stakeholder pages | PARTIAL | New pages follow the new pattern |
| P1-25 | Self-hosted deployment mode: no tenant/subscription limits, single installation tenant | DONE | `DeploymentMode`, middleware, quota bypass |
| P1-26 | Self-hosted insights: registered users, online sessions, data counts | DONE | `/api/self-hosted/stats` + UI page |

## P2 — hardening, product, operations

| # | Work item | Status | Verification |
|---|---|---|---|
| P2-1 | CSP/HSTS/cookie hardening and secure token storage | IN PROGRESS | Header review |
| P2-2 | Health/readiness endpoints | TODO | Docker check |
| P2-3 | Structured logging, correlation IDs, no PII/token logging | TODO | Code review |
| P2-4 | Audit log for financial/role/invoice changes | TODO | Schema + tests |
| P2-5 | Backup/restore runbook and test | TODO | Ops drill |
| P2-6 | Real subscription billing; payment provider integration | DEFERRED | Product decision |
| P2-7 | E-invoicing (Egypt ETA / Saudi ZATCA), credit/debit notes, recurring invoices | DEFERRED | Product decision |
| P2-8 | Multi-currency, inventory valuation, bank reconciliation, VAT filing | DEFERRED | Product decision |
| P2-9 | 2FA/SSO/session management | TODO | Auth tests |
| P2-10 | Frontend code splitting, React Query cache tuning, accessibility/i18n pass | TODO | Build + manual |
| P2-11 | Marketing copy: remove security claims until code matches; rotate demo password | TODO | Content review |

## Product expansion

### Stakeholders

- [x] `Stakeholder` entity: tenant, name, type (shareholder/partner/investor), email, phone, ownership %, equity account, active flag, notes.
- [x] `StakeholderTransaction` entity: tenant, stakeholder, type, amount, date, cash/bank account, reference, description.
- [x] CRUD API with tenant isolation and role checks.
- [x] Transaction types: capital contribution, dividend/distribution, loan received, loan repayment, withdrawal.
- [x] Double-entry posting per transaction type; reversal on delete.
- [x] Stakeholder list + detail page, account balance, transaction history, create/edit modal.
- [x] Validation: ownership 0–100, positive amounts, no over-repayment, no negative balance.
- [ ] Export statement to PDF/Excel/CSV.

### Competitor parity backlog

- [ ] Credit notes and debit notes with original-invoice linkage.
- [ ] Recurring invoices and scheduled sending.
- [ ] Bank reconciliation workspace (import statement, match, adjust).
- [ ] Approval workflows for invoices, expenses, payments.
- [ ] Audit trail and activity feed.
- [ ] Customer/supplier portal and payment links.
- [ ] Inventory valuation and stock adjustments.
- [ ] VAT return pack and e-invoicing export.
- [ ] Multi-currency and exchange-rate revaluation.
- [ ] Saved views, bulk actions, and CSV import.
- [ ] Global search and command palette.
- [ ] Role/permission matrix editor.
- [ ] Onboarding checklist and demo dataset.

### Self-hosted mode

- [x] `Deployment:Mode=SelfHosted` configuration.
- [x] Single installation tenant; no host/subdomain tenant resolution.
- [x] Unlimited quotas and no subscription requirement.
- [x] Registration joins the installation tenant; optional registration lock.
- [x] Registered user count, online-in-last-5-minutes count, data counts.
- [x] Installation insights page for administrators.
- [ ] Session table with device/IP history (currently uses `LastSeenAt`).
- [ ] Upgrade/backup status on the insights page.

## UI professionalization

- [x] Shared `.input` control style.
- [x] New stakeholder and installation pages use consistent cards, tables, modals, empty states and RTL.
- [ ] Single design-token layer: color, radius, spacing, elevation, typography.
- [ ] Consistent page header: title, breadcrumb, primary/secondary actions.
- [ ] Consistent data table: search, filters, sort, pagination, column visibility, empty state.
- [ ] Consistent form controls and validation messages.
- [ ] Skeleton loading, inline errors, retry states.
- [ ] Modal/drawer patterns with focus trap and keyboard close.
- [ ] RTL-first verification for every new page.
- [ ] Responsive layouts for tablet/mobile.
- [ ] Accessibility: labels, focus rings, contrast, ARIA.
- [ ] Remove one-off gradients/shadows; use a restrained professional palette.

## Guardrails

- No production secrets in git; use env vars/user secrets.
- Every cross-tenant read/write must include a tenant predicate or be SysAdmin-only.
- Every financial posting must be balanced and transactional.
- CI must fail on compiler errors, type errors, failed tests, and detected secrets.
