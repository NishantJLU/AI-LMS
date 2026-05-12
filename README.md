# NexaLearn — AI-native LMS

Production-style learning platform for higher education: role-based experiences for students, teachers, and admins; Prisma + PostgreSQL; Auth.js; embedded AI (summaries, quizzes, flashcards, assignment feedback, semantic search); Docker-friendly layout.

## Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion, React Hook Form, Zod
- **Backend:** Next.js Server Actions + Route Handlers
- **Data:** PostgreSQL, Prisma ORM 7 with the **official `pg` driver adapter** (`@prisma/adapter-pg`). Embeddings are stored as JSON arrays on `DocumentChunk` for portability; you can migrate to **pgvector** with a SQL migration when you scale.
- **Auth:** Auth.js (NextAuth v5) — credentials + optional Google/GitHub, JWT sessions, RBAC middleware
- **AI:** OpenAI SDK (OpenAI or Groq base URL), JSON-schema structured outputs, optional embeddings for hybrid search

## Quick start

1. **Copy environment**

   ```bash
   cp .env.example .env
   ```

   Generate `AUTH_SECRET` (e.g. `openssl rand -base64 32`).

2. **Start PostgreSQL**

   ```bash
   docker compose up -d
   ```

   Default URL:

   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nexalearn?schema=public
   ```

3. **Install & database**

   ```bash
   npm install
   npm run db:push
   npm run db:seed
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

### Demo accounts (after seed)

| Role    | Email                  | Password    |
| ------- | ---------------------- | ----------- |
| Admin   | `admin@nexalearn.edu`  | `Demo1234!` |
| Teacher | `teacher@nexalearn.edu`| `Demo1234!` |
| Student | `student@nexalearn.edu`| `Demo1234!` |

The seeded course slug is **`human-ai-interface-7xk2p9`** (student is enrolled).

## AI keys

- Set `OPENAI_API_KEY` for live models and embeddings (recommended).
- Or set `GROQ_API_KEY` and point `LLM_MODEL` at a Groq chat model; embeddings still prefer `OPENAI_API_KEY` for `text-embedding-3-small`.
- Without keys, AI routes return **demo** payloads so UI and flows stay testable.

## Scripts

| Script        | Purpose              |
| ------------- | -------------------- |
| `npm run dev` | Next.js dev (Turbopack) |
| `npm run build` | Production build   |
| `npm run db:push` | `prisma db push` |
| `npm run db:seed` | Seed demo data   |
| `npm run db:studio` | Prisma Studio  |

## Prisma 7 & database URL

The app expects `DATABASE_URL` and constructs a `pg` pool plus `PrismaPg` adapter in `src/lib/db.ts`. This matches Prisma 7’s required driver adapter pattern for PostgreSQL.

## Middleware & `AUTH_SECRET`

Route protection uses `getToken` from `next-auth/jwt` in **Edge middleware** (no Prisma import), so protected routes stay fast. You **must** set `AUTH_SECRET` for tokens to validate; without it, in development the middleware skips enforcement (see `src/middleware.ts`). Production builds should always include `AUTH_SECRET`.

## Deployment (Vercel)

1. Create a Vercel Postgres (or other) database and set `DATABASE_URL`.
2. Set `AUTH_SECRET`, `NEXTAUTH_URL` (production URL), and optional OAuth client IDs.
3. Run migrations in CI or locally against production: `prisma migrate deploy` (when you add migrations) or `db push` for prototypes.
4. Add AI and optional Pusher env vars.

`next.config.ts` enables **standalone** output for container or self-hosted Node deploys.

## Project layout (high level)

- `src/app` — routes (marketing, auth, student / teacher / admin dashboards, API routes under `/api`)
- `src/components` — UI shell, AI studio, marketing, auth forms
- `src/server/actions` — server actions (auth, courses)
- `src/lib` — Prisma singleton, AI client, vectors, rate limiting
- `prisma/schema.prisma` — domain + Auth.js models

## License

Private / portfolio use — adjust as needed.
