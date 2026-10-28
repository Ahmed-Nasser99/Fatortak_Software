# Contributing to Fatortak

Thanks for helping build an open-source business platform for MENA. Every bug report, translation fix and pull request matters.

## Ways to contribute

- **Report bugs** using the [bug report template](.github/ISSUE_TEMPLATE/bug_report.yml).
- **Request features** using the [feature request template](.github/ISSUE_TEMPLATE/feature_request.yml).
- **Improve translations** in `fatortak_frontend/public/locale/ar` and `.../en`.
- **Write docs** — setup guides, module explanations, API examples.
- **Write tests** — invoice math, VAT, installments, accounting posting, permissions.
- **Fix issues** labeled [`good first issue`](https://github.com/Fatortak/Fatortak_Software/labels/good%20first%20issue).

## Development setup

### Backend (.NET 8 + SQL Server)

```bash
cd fatortak_backend/fatortak
cp appsettings.example.json appsettings.json   # then edit the connection string + JWT key
dotnet restore
dotnet run
```

- API: http://localhost:5002
- Swagger: http://localhost:5002/swagger
- Migrations run automatically at startup.

### Frontend (React + Vite)

```bash
cd fatortak_frontend
cp .env.example .env
npm install
npm run dev
```

- Web: http://localhost:8080

### Database changes

If you change an entity:

```bash
cd fatortak_backend/fatortak
dotnet ef migrations add YourMigrationName
dotnet ef database update
```

Commit both the migration and the model snapshot. Never edit an existing migration that has shipped.

## Branching and commits

- Branch from `main`: `feat/invoice-reminders`, `fix/vat-rounding`, `docs/self-hosting`.
- Use clear commit messages. [Conventional Commits](https://www.conventionalcommits.org/) are preferred:
  - `feat: add recurring invoices`
  - `fix: round VAT per line item`
  - `docs: explain Docker deployment`
- Keep pull requests focused. One feature or fix per PR.
- Rebase on `main` before opening a PR.

## Pull request checklist

- [ ] The change is described in the PR template.
- [ ] `npm run build` and `npx tsc -p tsconfig.app.json --noEmit` pass in `fatortak_frontend`.
- [ ] `dotnet build` and `dotnet test` pass in `fatortak_backend`.
- [ ] New behavior has tests where practical.
- [ ] No secrets, credentials or customer data are included.
- [ ] Database changes include a migration.
- [ ] UI changes work in both Arabic (RTL) and English (LTR).
- [ ] Screenshots are attached for UI changes.

A maintainer will review within a few business days. If a PR goes quiet, comment on it — do not open a duplicate.

## Code style

- **C#:** follow the existing service/controller/DTO structure. Async methods end in `Async`. Keep controllers thin and business logic in services.
- **TypeScript:** functional components and hooks, strict types, no `any` unless unavoidable. Use the existing shadcn/ui primitives.
- **Formatting:** match the surrounding file. Avoid drive-by reformatting.
- **Accessibility:** label form fields, keep keyboard navigation working, use semantic HTML.

## Translations

Arabic is a first-class language, not an afterthought. When adding UI text:

1. Add the key to `public/locale/en/translation.json`.
2. Add the Arabic translation to `public/locale/ar/translation.json`.
3. Test the screen in RTL mode.

If you are a native Arabic speaker, reviewing existing translations is one of the highest-impact contributions you can make.

## Contributor license grant

By submitting a contribution, you confirm that:

1. You wrote the contribution or have the right to submit it.
2. You grant Fatortak a perpetual, worldwide, non-exclusive, royalty-free, irrevocable license to use, reproduce, modify, distribute and sublicense your contribution, including the right to license it under different terms.
3. Your contribution is provided under the project's [AGPL-3.0 license](LICENSE) unless stated otherwise.

This grant lets the project sustain itself through commercial licensing while keeping the community edition free. If your employer owns your work, make sure you have permission before contributing.

## Code of conduct

All participants must follow the [Code of Conduct](CODE_OF_CONDUCT.md). Be kind, assume good intent and keep discussions technical.

## Security

Do not report security vulnerabilities in public issues. See [SECURITY.md](SECURITY.md).
