# GymBuddy AI

A workout logger where users describe training sessions in plain English and the AI structures them into searchable, trackable records.

## What it does

Users type a freeform workout description (e.g. "4 sets of bench at 80kg 8 reps, then 3x12 pull-ups, 20 min run"). The app sends that to Claude, which parses it into structured JSON (exercises, sets, reps, weights, muscle groups, duration). The result is persisted to Postgres and displayed in a clean session history.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Supabase Auth (email/password) |
| Database | Supabase Postgres with RLS |
| AI | Anthropic SDK — `claude-sonnet-4-6` |

## Project layout

```
src/
  app/
    api/parse-workout/route.ts   # POST — parse input, save session
    auth/login/page.tsx          # Email/password auth page
    dashboard/page.tsx           # Main app page (server component)
  components/
    WorkoutLogger.tsx            # Input form + session list (client)
    ui/                          # shadcn/ui components
  lib/
    anthropic.ts                 # parseWorkout() — calls Claude
    supabase/
      client.ts                  # Browser Supabase client
      server.ts                  # Server Supabase client (cookies)
      middleware.ts              # Session refresh + route guard
  middleware.ts                  # Next.js middleware (auth redirects)
  types/
    workout.ts                   # WorkoutSession, Exercise, ParsedWorkout
supabase/
  schema.sql                     # Table DDL + RLS policies
```

## Key conventions

- **Server Components by default.** Only add `"use client"` when you need hooks or browser APIs.
- **Auth via middleware.** All routes except `/` and `/auth/*` require a logged-in session. The middleware in `src/middleware.ts` handles redirects.
- **Supabase clients.** Use `src/lib/supabase/server.ts` in Server Components and Route Handlers; `src/lib/supabase/client.ts` in Client Components.
- **AI parsing.** `lib/anthropic.ts` owns the Claude call. The system prompt is co-located there. Model: `claude-sonnet-4-6`.
- **Types.** All shared types live in `src/types/workout.ts`. Do not inline ad-hoc types in components.

## Local setup

1. Copy `.env.local` and fill in the three keys:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   ANTHROPIC_API_KEY=
   ```
2. Run the SQL in `supabase/schema.sql` against your Supabase project (SQL editor or CLI).
3. `npm run dev` — app runs on http://localhost:3000.

## Database

Single table: `workout_sessions`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users, cascade delete |
| raw_input | text | Original user text |
| title | text | AI-generated short title |
| date | date | Workout date (from AI or today) |
| duration_minutes | integer | Optional |
| exercises | jsonb | Array of Exercise objects |
| muscle_groups | text[] | e.g. ["chest", "triceps"] |
| notes | text | Optional extra context |
| created_at | timestamptz | Auto |

RLS is enabled — users can only read/write their own rows.

## Adding features

- **New UI components:** `npx shadcn@latest add <component>`
- **New API routes:** add under `src/app/api/`; always verify auth via `supabase.auth.getUser()` at the top
- **Schema changes:** write migrations in `supabase/` and apply via Supabase CLI or SQL editor
