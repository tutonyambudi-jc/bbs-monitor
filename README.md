# BBS Monitor

Application **indépendante** de surveillance de l'écosystème BBS :

- ERP BBS (Bill)
- Travelia ERP
- Travelia API
- Travelia Web
- Echo Challenge
- Futurs services

## Stack

- Next.js 16 · TypeScript · Tailwind · Shadcn UI
- Prisma · PostgreSQL
- Port **3003**

## Démarrage local

```bash
cp .env.example .env
docker compose up -d
npm install
npm run db:setup
npm run dev
```

→ http://localhost:3003  
Login : `admin@bbs-monitor.com` / `Admin@BBSMonitor2026`

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL |
| `AUTH_SECRET` | JWT session (32+ chars) |
| `CRON_SECRET` | Auth endpoint cron checks |
| `PORT` | 3003 |

## Cron health checks (Dokploy)

Planifier toutes les 1–5 min :

```bash
curl -X POST https://monitor.votredomaine.com/api/cron/check \
  -H "Authorization: Bearer $CRON_SECRET"
```

## Déploiement Dokploy

- Repo Git → Build Nixpacks (`nixpacks.toml` inclus, Node 22)
- `prestart` exécute `prisma db push`
- Après 1er deploy : `npx prisma db seed` dans le terminal conteneur

## Modules V1

- Login admin
- Dashboard global (statuts, métriques, historique)
- CRUD services surveillés
- Health check ONLINE / OFFLINE / DEGRADED
- Temps de réponse & dernière vérification
- Historique des checks
- Métriques serveur CPU / RAM
- Page alertes
