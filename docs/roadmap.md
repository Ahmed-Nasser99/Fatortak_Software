# Roadmap

This roadmap is a direction, not a contract. Dates are deliberately omitted; priorities are driven by users and contributors. Vote on an item by opening a discussion or adding a 👍 to the linked issue.

## v0.1 — Public alpha (current)

- [x] Public repository, AGPL-3.0 license, README and docs
- [x] Docker Compose for self-hosting
- [x] Issue/PR templates, code of conduct, security policy
- [x] CI for backend and frontend builds
- [ ] Real product screenshots and a 2-minute demo video
- [ ] One-command demo dataset
- [ ] First 10 `good first issue` tasks

## v0.2 — Trust and testability

- [ ] Integration tests for invoice totals, VAT, discounts and installments
- [ ] Tests for accounting posting (AR, revenue, VAT, payments)
- [ ] Tenant isolation test suite
- [ ] Seed a demo company with realistic MENA data
- [ ] Health checks and structured logging
- [ ] Restrict CORS by configuration
- [ ] API rate limiting
- [ ] Database backup/restore scripts

## v0.3 — Integrations

- [ ] Payment gateway for subscriptions (Paymob for Egypt, Stripe internationally)
- [ ] WhatsApp Business API adapter (template messages, delivery status)
- [ ] E-invoicing research: Egypt ETA and Saudi ZATCA
- [ ] Bank feed / statement import (CSV first)
- [ ] Webhooks and a public API key system
- [ ] Zapier/Make connector

## v0.4 — Accounting depth

- [ ] Recurring invoices
- [ ] Credit notes and returns
- [ ] Multi-currency with exchange rates
- [ ] Fixed assets and depreciation
- [ ] Budgets vs actuals
- [ ] Bank reconciliation workflow
- [ ] Period closing and locked periods

## v0.5 — Team and scale

- [ ] Granular permissions (per module, per branch)
- [ ] Audit log for sensitive actions
- [ ] Approval workflows for expenses and invoices
- [ ] Background job queue for reminders and exports
- [ ] Horizontal scaling guide
- [ ] S3-compatible file storage

## v1.0 — Production-ready

- [ ] Independent security audit
- [ ] Stable public API with versioning
- [ ] Migration tool from QuickBooks/Odoo/Excel
- [ ] 80%+ test coverage on financial calculations
- [ ] Documented upgrade and rollback path
- [ ] Commercial support SLAs

## Explicitly out of scope (for now)

- Native mobile apps (the web app is responsive)
- A full CRM with pipelines
- Manufacturing/MRP
- Payroll tax filing for every country — local providers should integrate

## How to influence the roadmap

1. Open a [feature request](.github/ISSUE_TEMPLATE/feature_request.yml) describing the business problem, not just the feature.
2. Tell us which country and business size you are targeting.
3. If you can implement or fund it, say so. Sponsored features move faster.
