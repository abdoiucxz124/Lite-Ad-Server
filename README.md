
# Lite Ad Server

Production‑ready, lightweight Ad Server connected to **Google Ad Manager**.

## Key features
* **Ad Delivery Service** – generates & serves GA Manager ad tags via `/api/ad?slot=...`.
* **Tracking Service** – logs `impression`/`click` events to SQLite.
* **Admin Dashboard** – simple UI at `/admin` with aggregated stats.

## Quick start

```bash
git clone https://example.com/lite-ad-server.git
cd lite-ad-server
cp .env.example .env        # adjust if needed
docker compose up -d        # or: npm install && npm start
```

### Embed on any site

```html
<script src="https://YOUR_AD_SERVER/ad-loader.js"></script>
<script>loadAd('22904833613/star-3');</script>
```

## Services & requirements

1. **Ad Delivery Service**
   - Needs Google Ad Manager *network/slot path* per placement.
2. **Tracking Service**
   - Needs write access to `DATABASE_PATH` from `.env`.
3. **Admin Dashboard**
   - OPTIONAL: protect with basic‑auth / reverse‑proxy in production.

Everything is self‑contained—no placeholders.
# Lite-Ad-Server
