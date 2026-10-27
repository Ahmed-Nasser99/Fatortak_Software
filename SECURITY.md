# Security policy

Fatortak handles invoices, payroll, customer data and financial records. We take security seriously, and we are honest about the current maturity of the project.

## Project status

The open-source edition is **alpha**. It has not yet undergone an independent security audit. Do not expose a fresh instance directly to the public internet without:

- HTTPS via a reverse proxy
- a strong, unique `Jwt:Key`
- a dedicated database user with a strong password
- rotated AI and SMTP credentials
- regular backups
- network restrictions on the database port

## Supported versions

| Version | Supported |
| --- | --- |
| `main` (pre-1.0) | Security fixes only |
| Releases before 1.0 | Best effort |

## Reporting a vulnerability

**Do not open a public GitHub issue.**

Email **security@fatortak.net** (or **info@fatortak.net** if that bounces) with:

- a description of the issue and its impact
- steps to reproduce, including request/response examples
- the affected version or commit
- any suggested fix

You will receive an acknowledgement within **72 hours**. We aim to provide a remediation timeline within **7 days** for confirmed issues.

Please give us reasonable time to fix the issue before public disclosure. We will credit you in the release notes unless you prefer to stay anonymous.

## Scope

In scope:

- authentication and authorization bypasses
- tenant isolation failures (one company reading another company's data)
- SQL injection, XSS, CSRF, SSRF
- insecure direct object references
- exposure of secrets or uploaded files
- privilege escalation between roles
- invoice, payroll or accounting data corruption caused by malicious input

Out of scope:

- denial of service against your own instance
- missing security headers with no demonstrated impact
- spam reports about the hosted demo
- social engineering of maintainers
- vulnerabilities in third-party dependencies without a demonstrated exploit path (report those upstream)

## Secrets in the repository

If you find a credential committed to this repository, email us immediately and do not use it. We rotate exposed secrets and remove them from history.

## Hardening checklist for self-hosters

- [ ] Replace every placeholder secret in `appsettings.json`.
- [ ] Use a managed secret store or environment variables, not files.
- [ ] Put the API behind HTTPS (Caddy, Nginx, Traefik or a cloud load balancer).
- [ ] Restrict CORS to your own domain. The default `AllowAll` policy is for development.
- [ ] Keep SQL Server off the public internet.
- [ ] Enable database backups and test restores.
- [ ] Review the `SysAdmin` and company-admin roles before inviting users.
- [ ] Keep dependencies updated (Dependabot is enabled).
