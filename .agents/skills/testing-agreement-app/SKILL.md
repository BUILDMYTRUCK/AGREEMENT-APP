# Testing the AGREEMENT-APP signing flow

This skill captures how to test the Kwest Transport service-agreement signing
app end-to-end on a dev machine. Prefer this over re-deriving the stack from
scratch.

## Stack in one line

Next.js 16 (Turbopack) + React 19 + Prisma 7 with the
`@prisma/adapter-better-sqlite3` adapter. SQLite file at `./dev.db` for dev,
Postgres for prod (swap the adapter). Auth is one shared HMAC-signed cookie
set by `/api/login`.

## One-command local start

```bash
npm install
npx prisma generate
npx prisma db push          # creates dev.db
npm run dev                 # http://localhost:3000
```

The dev server logs `Ready in …` within ~1s on Turbopack. If a page 500s on
first compile, reload once — Turbopack compiles on demand.

## Default credentials (dev only)

- Staff password: `changeme` (from `STAFF_PASSWORD` in `.env`, fallback
  hard-coded in `src/lib/session.ts`).
- No per-user accounts — everyone in the shop shares this.

For non-local environments, override via `.env`:
```
STAFF_PASSWORD=<a-real-password>
SESSION_SECRET=<32+-random-bytes>
DATABASE_URL=file:./dev.db     # or postgres://... for prod
```

## Critical file locations

- `src/proxy.ts` — **Next 16 auth gate**. Replaces `middleware.ts`. If tests
  show auth is bypassed, check this file still exists and is named `proxy.ts`.
- `src/lib/agreement.ts` — all 6 legal clauses. Changes here must be reflected
  in both `src/app/contracts/new/NewContractForm.tsx` (rendered to staff) and
  `src/lib/pdf.ts` (rendered into the saved PDF).
- `src/lib/pdf.ts` — PDF generation with pdf-lib. Signature image lands on
  page 2 under `CUSTOMER SIGNATURE` with audit block below.

## Minimum viable test (takes ~2 minutes)

1. **Auth gate:** open `/` unauthenticated → must redirect to `/login`.
2. **Reject bad password:** submit `wrongpassword` → `Incorrect password.`
   error, stays on `/login`.
3. **Save-guard:** after login, fill customer name + vehicle but leave the
   signature pad empty. Confirm `Agree & save` is `disabled` and the click
   is a no-op.
4. **Happy path:** draw a signature, submit, verify the `/contracts/<id>`
   redirect shows every field + signature image + IP/UA.
5. **PDF content:** fetch `/api/contracts/<id>/pdf` with the session cookie,
   confirm it starts with `%PDF-1.7`, then run `pdftotext` and grep for the
   customer name, `Storage Fees`, and `Signed by:`.
6. **DB persistence:** reload `/?q=<company>` (full browser reload) — the
   dashboard is `force-dynamic` and reads from Prisma, so seeing the row here
   proves the DB write landed.

## Verifying PDF content from the shell

```bash
# log in once, persist the cookie
curl -s -c /tmp/cookies.txt -X POST http://localhost:3000/api/login \
  -H 'Content-Type: application/json' -d '{"password":"changeme"}' > /dev/null

curl -s -b /tmp/cookies.txt -o /tmp/agreement.pdf \
  http://localhost:3000/api/contracts/<id>/pdf

head -c 8 /tmp/agreement.pdf         # must print %PDF-1.7
pdftotext /tmp/agreement.pdf -       # must include customer name + clauses
```

On this VM `pdftotext` is in the `poppler-utils` apt package. If `apt-get`
404s, run `sudo apt-get update -qq` first.

## Drawing a signature via the computer tool

`react-signature-canvas` listens to normal mouse events, so a sequence of
`left_click_drag` actions on the canvas works:

```json
[
  {"action": "left_click_drag", "start_coordinate": [320, 620], "coordinate": [420, 570]},
  {"action": "left_click_drag", "start_coordinate": [420, 570], "coordinate": [500, 640]},
  {"action": "left_click_drag", "start_coordinate": [500, 640], "coordinate": [600, 570]},
  {"action": "left_click_drag", "start_coordinate": [600, 570], "coordinate": [680, 630]}
]
```

Adjust coordinates to your current scroll position — scroll the page so the
signature pad is fully visible first.

## Known quirks / might-be-broken-later

- Dates in the PDF and detail page use server locale (`toLocaleString()`).
  If the shop ever deploys outside a US server, the `Date:` line may look
  weird — consider pinning `America/Edmonton` in `src/lib/pdf.ts` and
  `src/app/contracts/[id]/page.tsx`.
- `IP address` is taken from `x-forwarded-for` or `x-real-ip`, falling back
  to the direct socket. On `localhost` you'll see `::1` — that is expected.
- If Prisma complains `@prisma/client did not initialize yet`, rerun
  `npx prisma generate`. The client lands in `src/generated/prisma/` per
  `schema.prisma`.
- Creating a PR on a fresh BUILDMYTRUCK repo via `git_pr` may fail until the
  Devin GitHub App is installed on the repo. Remediation: link user to
  https://github.com/apps/devin-ai-integration/installations/new or ask them
  to open the PR manually from the branch compare URL.

## Devin Secrets Needed

- None for local testing. The default `changeme` password and local SQLite
  file are sufficient.
- For production-like testing you'd want `STAFF_PASSWORD`, `SESSION_SECRET`,
  and `DATABASE_URL` as org-scoped secrets, but that is not currently set up.
