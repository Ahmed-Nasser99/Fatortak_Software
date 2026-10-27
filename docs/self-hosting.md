# Self-hosting Fatortak

This guide runs Fatortak with Docker Compose: SQL Server, the ASP.NET Core API and the React frontend behind Nginx.

## Requirements

- Docker Engine 24+ with Compose v2
- 4 GB RAM minimum (SQL Server alone needs ~2 GB)
- a domain name and TLS certificate for production
- ports 3000 (web) and 5000 (API) free, or a reverse proxy in front

## Quick start

```bash
git clone https://github.com/Ahmed-Nasser99/Fatortak_Software.git
cd Fatortak_Software
cp .env.docker.example .env
```

Edit `.env` and set **every** value:

```dotenv
MSSQL_SA_PASSWORD=            # 12+ chars, upper, lower, number, symbol
JWT_KEY=                      # 64 random characters
SEED_ADMIN_EMAIL=             # your login
SEED_ADMIN_USERNAME=
SEED_ADMIN_PASSWORD=          # strong password
PUBLIC_API_URL=http://localhost:5000
GEMINI_API_KEY=
SMTP_HOST=
SMTP_PORT=587
SMTP_EMAIL=
SMTP_PASSWORD=
```

Generate a JWT key:

```bash
openssl rand -base64 48
```

Start:

```bash
docker compose up --build -d
docker compose logs -f api
```

Open:

- Web: http://localhost:3000
- API: http://localhost:5000
- Swagger: http://localhost:5000/swagger (only in Development)

The API applies EF Core migrations on startup, seeds the system administrator and creates the default chart of accounts.

## Production with a domain

Put a reverse proxy in front. Example `Caddyfile`:

```caddyfile
app.example.com {
    reverse_proxy localhost:3000
}

api.example.com {
    reverse_proxy localhost:5000
}
```

Set `PUBLIC_API_URL=https://api.example.com` in `.env` and rebuild the web image:

```bash
docker compose build web
docker compose up -d
```

Caddy obtains and renews TLS certificates automatically.

### Restrict CORS

The API ships with a development-friendly `AllowAll` CORS policy. Before going live, change it in `Program.cs` to your web origin:

```csharp
policy.WithOrigins("https://app.example.com")
      .AllowAnyHeader()
      .AllowAnyMethod();
```

### Do not expose SQL Server

The compose file publishes port `1433` for convenience. Remove that mapping in production and let only the API container reach the database over the internal network.

## Backups

Back up both the database and uploaded files.

Database (inside the SQL Server container):

```bash
docker compose exec db /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C \
  -Q "BACKUP DATABASE Fatortak TO DISK='/var/opt/mssql/backup/fatortak.bak' WITH INIT"
```

Copy the backup out:

```bash
docker compose cp db:/var/opt/mssql/backup/fatortak.bak ./backups/
```

Uploads:

```bash
docker run --rm -v fatortak_uploads:/data -v "$PWD/backups:/backup" alpine \
  tar czf /backup/uploads.tgz -C /data .
```

Test a restore at least once before you need it.

## Upgrades

```bash
git pull
docker compose build
docker compose up -d
```

Migrations run automatically. Take a backup first — migrations are not always reversible.

Pin a release tag instead of tracking `main` for production.

## Email

Invoices, password resets and reminders use SMTP. For Microsoft 365, use an app password or a dedicated relay; regular account passwords often fail with modern authentication.

Test after configuration:

1. Create a test invoice.
2. Send it by email.
3. Check the API logs for SMTP errors.

## AI features

Set `GeminiApiKey` (and optionally `OpenRouterApiKey`). Without a key, invoicing and accounting still work; the assistant and OCR are disabled.

AI calls leave your server and are subject to the provider's terms. Do not send customer data to a provider you have not approved.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| API exits at startup | Check the SQL Server password complexity and the connection string. |
| `Login failed for user 'sa'` | The database volume was initialized with a different password. Remove the volume or restore the correct password. |
| Web shows network errors | `PUBLIC_API_URL` was wrong at build time. Rebuild the web image. |
| Arabic PDF text is broken | Ensure `wwwroot/fonts` is present in the published image. |
| 401 after restart | The JWT key changed, or Data Protection keys were not persisted. |
| Emails not delivered | Check SMTP host/port, app password, and spam filtering. |

## Health checks

- API: `GET /swagger` (Development) or any authenticated endpoint
- Web: `GET /`
- Database: `SELECT 1` via sqlcmd

Add your own `/health` endpoint before running behind a load balancer.
