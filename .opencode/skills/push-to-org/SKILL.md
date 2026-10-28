---
name: push-to-org
description: Transfer or mirror the Fatortak repository, including all branches, tags and history, to the Fatortak GitHub organization with secret-safety, visibility and verification checks.
license: AGPL-3.0
compatibility: opencode
metadata:
  audience: maintainers
  workflow: github
---

# Push Fatortak to the GitHub organization

- Proposed target: `https://github.com/fatortak/Fatortak_Software`
- Current upstream: `https://github.com/Ahmed-Nasser99/Fatortak_Software`
- Visibility policy: **public** (see [Visibility](#visibility)). Do not change it without an explicit owner decision.

> The organization does not exist yet. GitHub.com does not expose organization
> creation through its REST API, so an owner must create it in the web UI first:
> **Settings → Organizations → New organization**.

## Before you start

1. Confirm the organization name, repository name and visibility with the owner.
2. Confirm whether the goal is a **transfer** (recommended, preserves issues,
   pull requests, stars and redirects) or a **mirror** (keeps the old repository).
3. Never migrate a dirty working tree blindly. Check what is uncommitted:

   ```bash
   git status --short
   ```

4. Scan for secrets before any push:

   ```bash
   git ls-files | rg -i '(^|/)(\.env|appsettings\.json|.*\.(pem|pfx|p12|key)|id_rsa|secret|credential)'
   git grep -n -I -E 'BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|ghp_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,}|AIza[0-9A-Za-z_-]{20,}|AccountKey=|SharedAccessKey='
   gitleaks detect --no-git -v   # if installed
   ```

   `fatortak_backend/fatortak/appsettings.json`, `.env`, `*.pfx`, `*.pem`,
   `*.key` and local deploy files are ignored and must stay ignored. Never use
   `git add -A` or `git add .` on a dirty tree; add reviewed paths explicitly.

5. Back up every ref before changing remotes:

   ```bash
   git bundle create ../fatortak-backup.bundle --all
   ```

## Option A — transfer the existing repository (recommended)

A transfer preserves issues, pull requests, stars, watchers and redirects the
old URL to the new one.

1. Owner creates the organization in the GitHub web UI and accepts the plan.
2. Owner confirms you are an organization owner.
3. Transfer with the UI (**Settings → General → Danger Zone → Transfer**) or
   the REST API:

   ```bash
   curl -X POST \
     -H "Authorization: Bearer $GITHUB_TOKEN" \
     -H "Accept: application/vnd.github+json" \
     https://api.github.com/repos/Ahmed-Nasser99/Fatortak_Software/transfer \
     -d '{"new_owner":"fatortak"}'
   ```

   The token needs `repo` scope and admin rights on the repository, and the
   caller must be a member of the target organization. A classic token also
   needs `admin:org` for organization-level follow-up work.

4. Update the local remote:

   ```bash
   git remote set-url origin https://github.com/fatortak/Fatortak_Software.git
   git remote -v
   ```

5. Verify: `git ls-remote --heads --tags origin`, open a test issue, confirm
   Actions runs, and check that the old URL redirects.

## Option B — mirror to a new repository

Use this when the original repository must stay in place.

```bash
git clone --mirror https://github.com/Ahmed-Nasser99/Fatortak_Software.git fatortak-mirror.git
cd fatortak-mirror.git
git push --mirror https://github.com/fatortak/Fatortak_Software.git
```

Compare refs before declaring success:

```bash
git ls-remote --heads --tags https://github.com/Ahmed-Nasser99/Fatortak_Software.git | sort > old-refs.txt
git ls-remote --heads --tags https://github.com/fatortak/Fatortak_Software.git | sort > new-refs.txt
diff old-refs.txt new-refs.txt
```

## Dirty working tree

Do **not** include uncommitted work in a migration by default. If the owner
explicitly asks for it:

1. Review `git status` and `git diff` path by path.
2. Add only intended files by path, never `git add -A`.
3. Run the secret scan again.
4. Commit and push to a feature branch and open a pull request. Never commit
   `appsettings.json`, `.env` files, keys, certificates, database dumps or
   deploy credentials.

## Post-migration cleanup

- Update references from `Ahmed-Nasser99` to `fatortak` in `README.md`,
  `CONTRIBUTING.md`, `docs/`, `package.json`, badges and workflow files.
- Re-create repository secrets, branch protection, Actions permissions,
  Discussions and Pages settings in the new location.
- Keep a read-only copy of the old remote until verification is complete.
- Do not force-push `main` or delete branches without owner approval.

## Visibility

Recommended: **public**.

- `LICENSE` is AGPL-3.0 and the README describes Fatortak as an
  "open-source business OS for MENA" with PRs and Discussions welcome.
- The code is already public; making the repository private does not withdraw
  AGPL rights for versions that have already been published.
- Public repositories keep free branch protection, Pages and community
  contribution workflows.

Choose **private** only if the goal is proprietary distribution, paid-only
access or protection of customer data. In that case, change the license
deliberately and rotate any credential that may ever have been exposed.
