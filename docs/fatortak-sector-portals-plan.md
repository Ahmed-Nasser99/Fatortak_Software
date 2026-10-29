# Fatortak Sector Portals — Platform Plan

**Status:** Draft for approval  
**Date:** 2026-10-28  
**Scope:** Planning and architecture only. No product code is implemented by this document.

---

## 1. Executive summary

Fatortak should evolve from a single business application into a **platform of sector portals**:

- **Fatortak Main Portal** is the control plane: identity, tenants, users, subscriptions, entitlements, billing, shared customer/party data, notifications, files, audit and the accounting ledger.
- **Sector portals** are independent products for a specific industry: courses academy, gym/fitness, product commerce, and later clinics, real estate, restaurants, etc.
- Each sector portal lives in its **own repository**, has its **own release cycle**, and owns its operational data.
- Sector portals integrate with the main portal through **stable APIs and events**, never through a shared database.

The recommended first release is **Commerce**, because it reuses Fatortak’s existing invoicing, inventory and accounting strengths. **Academy** follows as the first experience-heavy portal. **Gym** follows after the platform patterns are proven.

The plan is deliberately staged. The first 6 weeks are a platform foundation, not a sector feature race. Building three portals before identity, tenancy, entitlements and contracts are stable would create three disconnected products and a very expensive integration problem later.

---

## 2. Goals and non-goals

### Goals

1. Let one organization use multiple Fatortak products with one login and one bill.
2. Give each sector a focused product experience instead of a generic ERP screen set.
3. Keep sector teams independent: separate repositories, deployments, databases and release cadence.
4. Make cross-portal data flow predictable, observable and recoverable.
5. Support SaaS and self-hosted deployments from the same contracts.
6. Be Arabic-first and RTL-first, with English as a first-class secondary language.
7. Make billing, entitlements and accounting correct by construction.
8. Allow a new sector portal to be created from a template in weeks, not months.

### Non-goals for the first phase

- A public marketplace of third-party apps.
- A full low-code/custom-object builder.
- One shared database across all sectors.
- A single monorepo for every product.
- Replacing the existing accounting/HR core.
- Building every sector at once.
- Mobile native apps before the web portals are stable.

---

## 3. Product model

### 3.1 The main portal is the control plane

The main portal owns:

| Capability | Responsibility |
|---|---|
| Identity | Users, sessions, MFA, SSO, password reset, invitations |
| Tenancy | Organizations, workspaces, sector entitlements, tenant lifecycle |
| Billing | Plans, add-ons, trials, coupons, invoices, dunning, payment provider webhooks |
| Entitlements | Which sectors/features/limits a tenant can use |
| Shared parties | Canonical person/organization records and contact preferences |
| Shared catalog | Optional cross-sector product/service definitions |
| Accounting core | Chart of accounts, journal, VAT, receivables/payables, financial reports |
| Notifications | Email/SMS/WhatsApp templates and delivery preferences |
| Files | Shared document storage and retention policy |
| Audit | Immutable activity and security events |
| App directory | App switcher metadata, deep links, launch URLs |

The main portal is **not** the place for sector-specific workflows such as course progress, gym check-ins or order fulfillment.

### 3.2 Sector portals are domain products

Each sector portal owns its operational domain and user experience:

| Portal | Core domain | Example capabilities |
|---|---|---|
| **Academy** | Learning | Courses, cohorts, lessons, instructors, enrollments, attendance, progress, assessments, certificates |
| **Commerce** | Selling physical/digital products | Catalog, price lists, orders, fulfillment, returns, stock, delivery, commissions |
| **Gym** | Membership and fitness | Plans, memberships, classes, trainers, bookings, check-ins, freezes, renewals |
| **Clinic** (later) | Appointments and care | Practitioners, services, appointments, treatment notes, recalls |
| **Real estate** (later) | Property | Listings, leads, viewings, contracts, installments |
| **Restaurant** (later) | Food service | Menu, tables, orders, kitchen flow, delivery |

A sector portal may be deployed:

- as a SaaS workspace linked to the main portal;
- as part of a self-hosted Fatortak installation;
- as a white-labelled portal for an enterprise tenant.

### 3.3 Shared kernel

These concepts are shared across sectors but **owned by one service**:

| Concept | Owner | Consumers |
|---|---|---|
| `Party` (person/organization) | Main portal | All portals |
| `Tenant` / `Workspace` | Main portal | All portals |
| `User` / `Role` | Main portal | All portals |
| `Subscription` / `Entitlement` | Main portal | All portals |
| `Invoice` / `Payment` | Main accounting core | Commerce, Academy, Gym |
| `Product` / `Service` | Commerce or main catalog | Commerce, Academy, Gym |
| `Booking` / `Enrollment` / `Order` | Sector portal | Sector portal, reporting |
| `Document` | Main file service | All portals |
| `AuditEvent` | Main audit service | All portals |

The shared kernel must be small. A large shared kernel is a distributed monolith with extra steps.

---

## 4. Recommended sector sequence

### Phase 1: Commerce

Why first:

- Fatortak already has invoicing, customers, items, inventory, payments and accounting.
- The integration path is the shortest and validates the ledger and billing model.
- It produces revenue fastest.
- It exposes the hardest cross-portal questions early: stock ownership, invoice ownership, payment reconciliation and fulfillment.

MVP:

- Product catalog and variants.
- Price lists and discounts.
- Orders and order lines.
- Fulfillment and delivery status.
- Returns and credit notes.
- Customer portal and order tracking.
- Invoice/payment handoff to the accounting core.

### Phase 2: Academy

Why second:

- It validates the experience-heavy portal shell, content delivery and learner identity.
- It does not need to duplicate the accounting core.
- It creates recurring subscription and cohort-based revenue.

MVP:

- Courses, modules and lessons.
- Cohorts and schedules.
- Instructor assignment.
- Enrollment and seat limits.
- Attendance and progress.
- Quizzes/assignments (basic).
- Certificates.
- Student and instructor portals.

### Phase 3: Gym

Why third:

- Membership billing, attendance and check-in patterns are now established.
- It needs a different operational model (recurring membership, freeze, access control).
- It can reuse the Academy scheduling and party patterns.

MVP:

- Membership plans and contracts.
- Member profiles and emergency contacts.
- Class schedules and trainer assignment.
- Bookings and waitlists.
- Check-in/check-out.
- Freeze, renewal and cancellation.
- Membership invoices and dunning.

Later sectors should be selected by customer demand, not by adding every vertical to the roadmap.

---

## 5. Repository strategy

### 5.1 Polyrepo by deployable product

Use separate repositories for products that deploy independently. Shared concerns are published as versioned packages, not copied.

| Repository | Purpose | Deployable | Owner |
|---|---|---|---|
| `fatortak-platform` | Main portal backend, accounting/HR core, control-plane APIs | Yes | Platform team |
| `fatortak-portal-web` | Main portal shell and shared authenticated UI | Yes | Platform + Design |
| `fatortak-contracts` | OpenAPI, AsyncAPI, JSON schemas, event catalog, generated clients | No | Platform |
| `fatortak-ui` | Design system, tokens, RTL primitives, shared components | Package | Design + Frontend |
| `fatortak-sdk-js` | Browser/Node SDK for portal APIs and events | Package | Platform |
| `fatortak-sdk-dotnet` | .NET SDK for service integrations | Package | Platform |
| `fatortak-sector-commerce` | Commerce portal backend + frontend | Yes | Commerce squad |
| `fatortak-sector-academy` | Academy portal backend + frontend | Yes | Academy squad |
| `fatortak-sector-gym` | Gym portal backend + frontend | Yes | Gym squad |
| `fatortak-infra` | Terraform/Bicep, environments, DNS, secrets wiring | No | SRE |
| `fatortak-analytics` | Event schemas, warehouse models, dashboards | No | Data |
| `fatortak-docs` | Architecture, ADRs, runbooks, API guides | No | Platform |

Each sector repository contains its own frontend and backend unless an ADR decides otherwise. A sector team can ship without waiting for the main portal team.

### 5.2 Repository template

Every deployable repository starts from a template containing:

- `README.md` with ownership and local setup.
- `CODEOWNERS`.
- `.editorconfig`, formatter and linter.
- CI: build, typecheck, tests, contract tests, container scan, SBOM.
- CD: dev → staging → production with manual approval for production.
- Dockerfile and health/readiness endpoints.
- OpenTelemetry wiring.
- Feature flag and config conventions.
- Security policy and dependency update automation.
- Migration policy and rollback runbook.
- Architecture decision records folder.

### 5.3 Versioning and compatibility

- Contracts use semantic versioning.
- Sector apps pin a contract version.
- Breaking contract changes require a new major version and a migration window.
- The platform supports at least the current and previous contract major versions.
- Releases are independent; no synchronized “big bang” release train for sector apps.

### 5.4 Branching

- Trunk-based development.
- Short-lived feature branches.
- Protected `main`.
- Preview environments per pull request where cost permits.
- Release tags for deployables and packages.

---

## 6. Target architecture

### 6.1 Context

```text
                         +-----------------------------+
                         |     Fatortak Main Portal    |
                         |  identity, tenants, billing |
                         |  entitlements, audit, files |
                         +--------------+--------------+
                                        |
                     OIDC / APIs / events / webhooks
                                        |
        +-------------------+-----------+-----------+-------------------+
        |                   |                       |                   |
+-------v-------+   +-------v-------+       +-------v-------+   +-------v-------+
|    Commerce   |   |    Academy    |       |      Gym      |   |  Future       |
|    portal     |   |    portal     |       |    portal     |   |  sectors      |
+-------+-------+   +-------+-------+       +-------+-------+   +-------+-------+
        |                   |                       |                   |
   own database        own database            own database        own database
```

### 6.2 Request path

1. User opens `academy.fatortak.com` or the app switcher.
2. The portal redirects to the main identity provider using OIDC Authorization Code + PKCE.
3. The main portal authenticates the user and returns an access token containing `sub`, `tenant_id`, `sector`, roles and entitlement claims.
4. The sector portal validates the token locally and resolves its local workspace from `tenant_id`.
5. Sector data is read/written only in the sector database.
6. When the sector needs shared data, it calls the platform API with a user token or a service token.
7. When the sector changes something the platform must know, it publishes an event through its outbox.

### 6.3 Integration rules

- No sector app connects directly to another app’s database.
- No cross-database foreign keys.
- All writes that cross a boundary are idempotent.
- Every event has a stable `event_id`, `tenant_id`, `occurred_at`, `schema_version` and correlation ID.
- Consumers are at-least-once and must de-duplicate.
- Outbox pattern is mandatory for domain events.
- Long-running cross-app workflows use a saga/process manager, not a distributed transaction.

### 6.4 Technology baseline

Preferred baseline unless an ADR says otherwise:

- Frontend: React + TypeScript + Vite.
- Backend: .NET 8/9 minimal APIs or controllers.
- Database: PostgreSQL for new sector services; existing accounting core remains SQL Server.
- Messaging: transactional outbox + RabbitMQ/NATS or a managed equivalent. Do not introduce Kafka until volume justifies it.
- Cache: Redis only where measured.
- Files: S3-compatible object storage, not local web roots.
- Search: PostgreSQL full-text initially; dedicated search later.
- Observability: OpenTelemetry, structured logs, metrics, traces, correlation IDs.

The technology choice is less important than the boundaries and contracts.

---

## 7. Identity, tenancy and authorization

### 7.1 Identity

- Main portal is the OpenID Provider.
- Authorization Code + PKCE for browser apps.
- Short-lived access tokens (10–15 minutes) with refresh-token rotation.
- HttpOnly, Secure, SameSite cookies for browser sessions.
- MFA for administrators; optional for other users.
- Session and device list with revoke.
- Service-to-service: OAuth2 client credentials or mTLS, never shared API keys.

### 7.2 Token claims

Minimum claims:

```json
{
  "sub": "user-id",
  "tenant_id": "tenant-id",
  "sector": "academy",
  "roles": ["admin"],
  "entitlements": ["academy.pro", "commerce.orders"],
  "limits": { "seats": 10, "invoices_per_month": 500 },
  "iss": "https://portal.fatortak.com",
  "aud": "fatortak-sector-academy"
}
```

Entitlements are a cache, not the source of truth. Sensitive actions call the entitlement API or re-check the subscription state.

### 7.3 Tenant lifecycle

```text
signup → tenant created → sector selected → workspace provisioned
      → owner invited → subscription/trial activated → active
      → past_due → grace → suspended → cancelled
```

Each transition emits an event. Sector portals must handle:

- `tenant.provisioned`
- `tenant.updated`
- `tenant.suspended`
- `tenant.reactivated`
- `tenant.deleted`
- `subscription.activated`
- `subscription.changed`
- `subscription.cancelled`
- `entitlement.changed`

Provisioning must be idempotent. A sector portal must be able to process the same event twice without creating duplicate workspaces.

### 7.4 Roles

Platform roles:

- `owner`
- `admin`
- `billing`
- `member`
- `support` (Fatortak staff, audited)

Sector roles extend the platform roles:

- Academy: `instructor`, `assistant`, `student`, `guardian`.
- Gym: `trainer`, `receptionist`, `member`.
- Commerce: `catalog_manager`, `fulfillment`, `sales_agent`.

Role definitions live with the sector app but are expressed through the shared role model.

---

## 8. Billing, plans and entitlements

### 8.1 Commercial model

- **Platform base fee** per tenant.
- **Sector add-on** per active portal.
- **Seat packs** where relevant.
- **Usage add-ons** (AI queries, SMS, storage, messages).
- **Enterprise** contracts with custom limits and white-label.

### 8.2 Plan catalog

The main portal owns the catalog:

- plan code, name, description;
- monthly/yearly price;
- included seats and usage;
- sector entitlements;
- feature flags;
- trial duration;
- grace period;
- tax treatment.

Prices must come from one source. Sector portals must never hardcode a price.

### 8.3 Metering

- Sector apps emit `usage.recorded` events with an idempotency key.
- The billing service aggregates usage per tenant, per meter, per period.
- Usage is visible to the tenant before invoicing.
- Corrections are adjustment events, not silent edits.
- Billing runs are replayable.

### 8.4 Payment provider

- Use a hosted payment page or hosted fields (Paymob, Stripe or local provider).
- Never store card data.
- Verify webhook signatures.
- Process webhooks idempotently.
- Handle disputes, refunds and failed payments explicitly.
- Provide a manual bank-transfer path for MENA customers.

### 8.5 Accounting link

- Billing invoices are posted to the accounting core with a dedicated revenue account per sector.
- Operational invoices (commerce orders, course fees, gym memberships) can be posted individually or summarized, depending on volume.
- Every posting includes `tenant_id`, `sector`, `source_id`, `idempotency_key` and `posting_date`.
- Reconciliation report: billing system ↔ ledger ↔ payment provider.

---

## 9. Data ownership and analytics

### 9.1 Ownership

- Main portal owns the canonical `Party` and `Tenant`.
- Sector apps own their operational records and store `party_id`/`tenant_id`.
- A sector app may cache shared data, but the cache must expire and be refreshable.
- Deletion requests are coordinated: the main portal initiates, each sector app confirms.

### 9.2 Analytics

- Operational databases are not used for cross-sector reporting.
- Events flow to a warehouse (BigQuery, Snowflake, ClickHouse or PostgreSQL-based warehouse).
- Minimum event set: signup, activation, portal launch, feature use, order/enrollment, payment, cancellation, support contact.
- PII is minimized and tokenized in analytics.
- Dashboards: activation, retention, sector mix, ARPU, churn, usage vs plan, support load.

### 9.3 Data residency

- Default region for MENA customers.
- Enterprise option for in-country hosting where required.
- Backups follow the same residency policy.
- Document subprocessors and cross-border transfers.

---

## 10. User experience and design system

### 10.1 Unified shell

- Global app switcher: “Accounting”, “Commerce”, “Academy”, “Gym”.
- Shared header: tenant, notifications, help, profile, billing.
- Deep links between apps: invoice → order, enrollment → student, membership → invoice.
- Silent SSO when switching apps.
- Each portal can run standalone or inside the shell.

### 10.2 Design system

`fatortak-ui` provides:

- design tokens (color, type, spacing, radius, elevation);
- layout primitives;
- tables, forms, filters, empty states, skeletons, error states;
- modal/drawer patterns with focus management;
- RTL primitives and Arabic typography;
- chart wrappers and accessible color palettes;
- date, currency and number formatting for MENA.

Rules:

- No sector-specific one-off design systems.
- A component enters the shared package only after it is used in at least two products or is a core pattern.
- Visual regression tests for shared components.

### 10.3 Accessibility

- WCAG 2.2 AA target.
- Keyboard navigation for all critical flows.
- Focus traps and labels in modals.
- Contrast checks in light/dark themes.
- Screen-reader checks for Arabic and English.

---

## 11. API and event contracts

### 11.1 API style

- REST/JSON for synchronous operations.
- OpenAPI 3.1 as the source of truth.
- Generated clients from contracts, not hand-written duplicates.
- Consistent error envelope:

```json
{
  "success": false,
  "errorMessage": "Human-readable message",
  "errorCode": "ACADEMY_SEAT_LIMIT_REACHED",
  "correlationId": "..."
}
```

- Pagination, filtering and sorting are standardized.
- Idempotency-Key header for create/payment operations.
- Rate-limit headers.
- API versioning in the path or media type; choose one and enforce it.

### 11.2 Events

- AsyncAPI or JSON Schema catalog in `fatortak-contracts`.
- Event envelope with `event_id`, `type`, `version`, `tenant_id`, `occurred_at`, `producer`, `correlation_id`, `payload`.
- Backward-compatible evolution: add fields, never repurpose them.
- Dead-letter queue with replay tooling.
- Consumer contract tests in CI.

### 11.3 Webhooks

- Signed with HMAC and timestamp.
- Retries with exponential backoff.
- Delivery log per tenant.
- Replay endpoint for support.

---

## 12. Security and compliance

### 12.1 Controls

- Tenant isolation tests for every service.
- Authorization at the service boundary, not only in the UI.
- Least-privilege database users.
- Secrets in a managed vault; no secrets in repos or images.
- SAST, dependency scanning, container scanning and SBOM in CI.
- Signed images and provenance.
- WAF, DDoS protection and rate limits at the edge.
- Audit log for authentication, role changes, billing changes, data export and deletion.
- Encryption in transit and at rest.
- Backup encryption and restore tests.

### 12.2 Privacy

- Data classification: public, internal, confidential, personal, sensitive.
- Data minimization per sector.
- Consent and marketing preferences owned by the main portal.
- DSAR workflow: export and delete across all sector apps.
- Retention policy per data type.
- Processor/subprocessor register.

### 12.3 Compliance path

- Egypt PDPL and Saudi PDPL readiness first.
- GDPR readiness for international customers.
- PCI DSS SAQ A via hosted payments.
- SOC 2 Type I after the platform is stable; Type II after 6–12 months of evidence.
- Security questionnaire pack and trust page.

---

## 13. Delivery and operations

### 13.1 Environments

- Local.
- Development.
- Staging with production-like data shapes.
- Production.
- Optional per-PR preview for frontend changes.

### 13.2 CI/CD gates

Every deployable:

1. Build.
2. Unit tests.
3. Integration tests.
4. Contract tests.
5. Typecheck and lint.
6. Security scan.
7. Container build and scan.
8. Migration check.
9. Staging deploy.
10. Smoke test.
11. Production approval.
12. Post-deploy verification.

### 13.3 Observability

- OpenTelemetry traces across portal → sector → platform.
- Structured logs with correlation ID and tenant ID (never tokens or passwords).
- Metrics: request rate, error rate, latency, queue depth, outbox lag, billing failures.
- SLOs per portal:
  - availability 99.9%;
  - p95 interactive latency < 400 ms;
  - SSO success > 99.5%;
  - provisioning < 2 minutes;
  - billing reconciliation difference < 0.1%.

### 13.4 Backup and disaster recovery

- RPO 15 minutes, RTO 4 hours for production.
- Daily full backup, point-in-time recovery.
- Quarterly restore drill.
- Runbooks for database loss, tenant corruption, payment outage, identity outage.

---

## 14. Roadmap

### Phase 0 — Platform foundation (weeks 1–6)

Deliverables:

- Architecture decisions and ADRs.
- Repository template and package publishing.
- Identity/OIDC, tenant model and entitlement claims.
- Tenant provisioning API and events.
- Shared design system foundation.
- Contract repository and generated clients.
- One sector skeleton deployed to staging.
- Security baseline and CI/CD gates.

Exit criteria:

- A test tenant can sign up, receive an entitlement and launch a sector skeleton.
- Tenant isolation test suite passes.
- A contract change can be published and consumed by the skeleton.

### Phase 1 — Commerce MVP (weeks 7–16)

Deliverables:

- Catalog, orders, fulfillment, returns.
- Invoice/payment handoff to accounting.
- Customer portal and order tracking.
- Billing add-on and usage metering.
- 5–10 design partners.

Exit criteria:

- End-to-end order → invoice → payment → ledger.
- Reconciliation report matches.
- Tenant can upgrade/downgrade the Commerce add-on.

### Phase 2 — Academy MVP (weeks 17–28)

Deliverables:

- Courses, cohorts, lessons, instructors.
- Enrollment, attendance, progress, certificates.
- Student/instructor portals.
- Seat limits and academy billing.

Exit criteria:

- A cohort can run end-to-end for 4 weeks.
- Certificate generation and RTL output verified.
- Cross-portal party and invoice links work.

### Phase 3 — Gym MVP and platform scale (weeks 29–40)

Deliverables:

- Memberships, classes, bookings, check-in, freeze/renew.
- Membership billing and dunning.
- Gym add-on.
- Mobile/PWA shell.
- Analytics dashboard and cross-sector reporting.

Exit criteria:

- 3 sectors live.
- Billing and ledger reconciled across sectors.
- Support runbooks and on-call rotation active.

### Phase 4 — Expansion (months 10–18)

- Clinic, real estate or restaurant based on demand.
- Partner API and marketplace.
- White-label and enterprise controls.
- Regional data residency.

---

## 15. Team and governance

### 15.1 Initial team

- 1 platform architect.
- 2 platform backend engineers.
- 1 platform frontend engineer.
- 1 SRE/DevOps.
- 1 security engineer (part-time or shared).
- 1 product designer.
- 1 product manager per active sector.
- 2 full-stack engineers per sector squad.
- 1 QA/automation engineer shared across squads.

Start with **Commerce** and the platform team. Add Academy and Gym squads only after the platform foundation is proven.

### 15.2 Governance

- **RFC** for cross-team proposals.
- **ADR** for irreversible technical decisions.
- **Architecture review** for new repos, contracts and data ownership.
- **Contract review** before a breaking change.
- **Release review** for production changes touching billing, identity or ledger.
- **Security review** for new integrations and PII flows.

### 15.3 Ownership rules

- Every repo has a named owner and backup.
- Every event has a producer owner and consumer list.
- Every database table has a domain owner.
- Every shared package has a versioning and deprecation policy.

---

## 16. KPIs

### Platform

- Tenant provisioning time.
- SSO success rate.
- Portal launch time.
- Cross-portal deep-link success rate.
- Entitlement cache correctness.
- Billing reconciliation variance.
- Outbox lag and dead-letter count.
- Tenant isolation incidents (target: zero critical).

### Product

- Activation rate per sector.
- Time to first value.
- Weekly active tenants.
- Feature adoption.
- Upgrade rate from trial.
- Gross retention and net revenue retention.
- Support tickets per 100 tenants.

### Engineering

- Deployment frequency per repo.
- Change failure rate.
- Mean time to recovery.
- Test coverage on critical paths.
- Contract-test pass rate.
- Security findings by severity and age.

---

## 17. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Building three portals before shared identity/tenancy is stable | High rework | Phase 0 gate; no sector features before provisioning and SSO pass |
| Polyrepo drift and duplicated code | Slow delivery | Shared packages, contract tests, repo template, architecture review |
| Shared database temptation | Coupling and data leaks | Hard rule: database per app; APIs/events only |
| Billing/ledger mismatch | Financial and trust damage | Idempotency, reconciliation reports, replayable billing runs |
| Sector scope explosion | Missed dates | Strict MVP, one pilot per sector, feature flags |
| Auth complexity across domains | Login failures | Central OIDC, silent SSO, shared SDK, E2E auth tests |
| PII spread across sectors | Compliance risk | Party ownership, data classification, DSAR workflow |
| Payment provider outage | Revenue loss | Hosted payments, retries, manual bank transfer fallback |
| Team cognitive overload | Quality drops | One platform team + one squad per active sector |
| Self-hosted divergence | Support burden | Same contracts, compose profile, compatibility matrix |

---

## 18. Decisions required before implementation

1. Which sector is the commercial pilot: Commerce (recommended) or Academy?
2. Build or buy for LMS, gym management and commerce capabilities?
3. Payment provider per region: Paymob, Stripe or both?
4. Primary cloud/region and data residency commitments.
5. PostgreSQL for new sector apps, or standardize on SQL Server?
6. Package registry: GitHub Packages or private npm/NuGet feeds?
7. Billing model: base + add-on, seats, usage, or a mix?
8. Who owns the canonical `Party` record and consent?
9. White-label requirements for enterprise tenants.
10. Mobile/PWA timing.
11. Support model and SLA per plan.
12. Whether sector portals can be sold standalone without the accounting core.

---

## 19. Definition of done for the platform foundation

- A new sector repository can be created from the template in under one day.
- A tenant can sign up, select a sector and launch the portal with SSO.
- The portal receives entitlements and enforces them server-side.
- The portal emits a usage event and the main portal meters it.
- The portal creates an invoice/payment and the ledger reconciles.
- Tenant isolation tests pass for every endpoint.
- A contract change is versioned, published and consumed without coordinated releases.
- A production-like staging environment is reproducible from infrastructure code.
- On-call, runbooks, backups and restore drills are in place.

---

## 20. Immediate next planning steps

1. Approve the product model and repository boundaries.
2. Choose the first sector and write its one-page MVP scope.
3. Write ADRs for identity, tenancy, data ownership, messaging and billing.
4. Create `fatortak-contracts` and the repo template.
5. Design the tenant provisioning and entitlement flows.
6. Define the first 10 cross-portal events.
7. Run a 2-week architecture spike with a sector skeleton, not a feature build.
8. Re-estimate the roadmap after the spike.

No implementation work should start until the Phase 0 decisions and contracts are approved.
