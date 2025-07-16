# Production Deployment Guide

This document explains how to deploy **Lite Ad Server** across multiple targets.

## Render.com
1. Create a new Web Service using `deploy/render.yaml`.
2. Enable automatic deploys from the `main` branch.
3. Persist database by attaching a disk at `/app/data`.

## Fly.io
1. Install the [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/).
2. Run `fly launch` or use the provided `deploy/fly.toml`.
3. Deploy with `fly deploy` and monitor using `fly status`.

## Kubernetes
1. Apply the manifests in `deploy/kubernetes/`:
   ```bash
   kubectl apply -f deploy/kubernetes/pvc.yaml
   kubectl apply -f deploy/kubernetes/deployment.yaml
   kubectl apply -f deploy/kubernetes/service.yaml
   kubectl apply -f deploy/kubernetes/ingress.yaml
   ```
2. Ensure a persistent volume is provisioned for the database.

## AWS ECS (via Terraform)
1. Customize variables in `deploy/terraform/variables.tf`.
2. Initialize and apply the configuration:
   ```bash
   cd deploy/terraform
   terraform init
   terraform apply
   ```

## Self-hosted VPS
1. Use `docker-compose.prod.yml` for an easy deployment:
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```
2. Set up a reverse proxy (Nginx/Caddy) for TLS termination.

