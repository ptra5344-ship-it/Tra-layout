# Tra Layout

Next.js 15 + TypeScript + Tailwind + Prisma/PostgreSQL. Stores **admin-supplied official** Clash of Clans layout deep links
(`https://link.clashofclans.com/en?action=OpenLayout&id=...`) — it never generates or modifies IDs. The official CoC API has no layout endpoint.

## Setup
```bash
npm install
cp .env.example .env        # fill DATABASE_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npx prisma generate
npx prisma migrate dev --name init
npm run seed                # creates admin + 5 TH7 placeholder bases
npm run dev                 # http://localhost:3000  ·  admin at /admin
```
Seed links contain `PLACEHOLDER` — replace them in the admin panel with real copied layout links.

## API
`GET /api/bases?townHall=7&type=war&q=&sort=latest|popular|likes&page=&limit=` · `GET /api/bases/:id` · `GET /api/search?q=dragon`
`POST /api/bases/:id/view` · `POST /api/bases/:id/like` (toggle) — public, rate-limited.
`POST /api/bases` · `PUT /api/bases/:id` · `DELETE /api/bases/:id` · `POST /api/upload` · `GET /api/stats` — admin cookie required.

## Deploy to Vercel
1. Push to GitHub, import in Vercel. 2. Create a Postgres DB (Neon/Supabase/Vercel Postgres) and set env vars:
`DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `BLOB_READ_WRITE_TOKEN` (Vercel Blob store → uploads).
3. Run once against the production DB: `npx prisma migrate deploy && npm run seed`. 4. Deploy (build runs `prisma generate`).

## Notes
- Rate limiting is in-memory (per instance). On Vercel use Upstash Ratelimit in `lib/rate-limit.ts` for strict limits.
- Cloudinary: add an upload branch in `app/api/upload/route.ts` and list `res.cloudinary.com` in `IMAGE_HOSTS`.
- Prisma engines don't run natively on Termux/Android; develop on a PC/Codespaces or use a hosted dev environment.
