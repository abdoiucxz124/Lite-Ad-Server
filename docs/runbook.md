# Operations Runbook

This runbook covers routine tasks for maintaining **Lite Ad Server** in production.

## Health Checks
- Verify the `/health` endpoint returns status `ok`.
- In Kubernetes, ensure pods are `Ready`.

## Scaling
- Increase replica count in `deploy/kubernetes/deployment.yaml`.
- For Fly.io, run `fly scale count <n>`.

## Backups
- Backup the SQLite database periodically:
  ```bash
  cp data/ads.db data/ads.db.$(date +%F)
  ```
- Store backups securely off‑site.

## Restores
1. Stop the running application.
2. Replace `data/ads.db` with the desired backup.
3. Start the application and verify.

## Logs
- Use `docker compose logs -f` for local deployments.
- For cloud targets, integrate with their logging solutions (Render events, Fly logs, CloudWatch, etc.).

## Disaster Recovery
- Maintain regular off-site backups.
- Store Terraform state remotely (e.g., S3 with DynamoDB locking).
- Document redeployment steps using `docs/deployment.md`.

