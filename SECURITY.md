# Security Guidelines

This project includes several mechanisms to protect data and restrict access.

## Authentication
- Admin routes use session-based authentication backed by SQLite.
- Configure `ADMIN_PASSWORD_HASH` with a bcrypt hash of your admin password.
- Optionally set `ADMIN_TOTP_SECRET` for multi-factor authentication using a TOTP app.
- Set `SESSION_SECRET` to a strong random value.

## Best Practices
- Serve the app behind HTTPS.
- Rotate admin credentials regularly.
- Review analytics data retention policies and purge old records with `/admin/data`.
- Keep dependencies up to date using `npm audit`.

