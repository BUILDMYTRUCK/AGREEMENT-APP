# AGREEMENT-APP

Custom document signing app for Kwest Transport automotive service agreements.
Fill in customer info, have them sign on-screen, and store a signed PDF in the
database for legal retrieval.

## Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript + Tailwind CSS v4
- **Prisma 7** with `better-sqlite3` adapter (SQLite for local dev)
- **pdf-lib** to generate a tamper-visible PDF of every signed agreement
- **react-signature-canvas** for the on-screen signature pad
- Simple shared-password staff auth via HMAC-signed session cookies
  (enforced by `src/proxy.ts` — Next.js 16's replacement for `middleware.ts`)

## Features

- Staff login (shared password, configurable via `STAFF_PASSWORD`)
- Dashboard listing every signed agreement with search by customer, company,
  or vehicle
- One-page contract flow: customer info + terms + signature + save
- Auto-captured audit trail: signed timestamp, IP address, user agent
- Generated PDF stored as bytes in the DB and served inline at
  `/api/contracts/[id]/pdf`
- Editable agreement template in `src/lib/agreement.ts`

## Getting started

```bash
npm install
cp .env.example .env     # then edit STAFF_PASSWORD + SESSION_SECRET
npx prisma migrate dev   # creates prisma/dev.db
npm run dev              # http://localhost:3000
```

Default staff password during local dev is `changeme` — change it before using
in production.

## Environment variables

| Name             | Purpose                                                  |
| ---------------- | -------------------------------------------------------- |
| `DATABASE_URL`   | Prisma datasource URL. Default: `file:./dev.db` (SQLite) |
| `STAFF_PASSWORD` | Shared password staff enter on the login page           |
| `SESSION_SECRET` | HMAC secret for session cookies. 16+ random characters  |

## Production notes

- **Database**: SQLite works for a single-server deployment. For a hosted
  setup (e.g. Vercel), swap the Prisma adapter to Postgres (Neon / Vercel
  Postgres) by changing the datasource provider in `prisma/schema.prisma` and
  the adapter import in `src/lib/prisma.ts`.
- **Backups**: signed agreements are legal documents — back up the SQLite
  file (or DB) regularly. PDFs are regenerated from the stored signature if
  the cached copy is ever missing.
- **Updating the agreement**: edit `src/lib/agreement.ts`. New contracts use
  the new text; previously signed contracts retain a frozen copy of the text
  they were signed against in the `agreementText` column.
