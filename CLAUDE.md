# Fit Betta

A cognitive performance app. Users do a two-minute morning check-in (sleep, energy, focus, stress, caffeine) to get a daily Cognitive Score (1–100). The app detects weekly patterns and recommends workouts and habits based on their personal data.

## What it does

1. **Check-in** — Morning form: sleep hours, energy/focus/stress (1–10 scales), caffeine, exercised?
2. **Score** — Computed from the formula in `src/lib/score.ts` (sleep 30pts, stress 25pts, energy 25pts, lifestyle 20pts)
3. **Food log** — Natural language → AI tags each meal (boosts focus / brain fog / neutral)
4. **Move** — AI picks the right workout based on last 7 days of workout history
5. **Insights** — Weekly pattern detection (sleep vs focus, stress carry-over, caffeine timing)
6. **Workout log** — Natural language → parsed exercises/muscle groups (the original feature)

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Supabase Auth (email/password) |
| Database | Supabase Postgres with RLS |
| AI | Groq SDK — `llama-3.3-70b-versatile` |
| Fonts | Plus Jakarta Sans + JetBrains Mono (Google Fonts) |

## Project layout

```
src/
  app/
    page.tsx                           # Landing (redirects to /home if logged in)
    (app)/
      layout.tsx                       # Auth guard + TabBar
      home/page.tsx                    # Morning Brief
      check-in/page.tsx                # Daily Check-In form
      score/page.tsx                   # Score Detail
      log/page.tsx                     # Log Hub
      food/page.tsx                    # Food Logger
      workout/page.tsx                 # Workout Log
      move/page.tsx                    # Move (AI workout recommendation)
      insights/page.tsx                # Weekly Insights
    api/
      check-in/route.ts                # POST: save daily_logs, compute score
      meals/route.ts                   # GET/POST: fetch/log meals
      score/today/route.ts             # GET: today's score
      move/recommend/route.ts          # POST: AI workout recommendation
      insights/weekly/route.ts         # GET/POST: weekly report
      parse-workout/route.ts           # GET/POST: workout history / parse workout
    auth/login/page.tsx                # Auth page (sign up + login tabs)
  components/
    TabBar.tsx                         # Bottom tab bar (client, uses usePathname)
    ui/                                # shadcn/ui primitives
  lib/
    ai.ts                              # All Groq/Llama functions: parseWorkout, parseMeal, recommendWorkout, writeInsightCopy
    score.ts                           # computeScore() — pure function
    insights.ts                        # generateInsights() — weekly pattern detection
    supabase/
      client.ts                        # Browser Supabase client
      server.ts                        # Server Supabase client (cookies)
      middleware.ts                    # Session refresh + route guard
  middleware.ts                        # Next.js middleware (auth redirects)
  types/
    workout.ts                         # WorkoutSession, Exercise, ParsedWorkout
    daily-log.ts                       # DailyLog, CheckInInput, ScoreBreakdown
    meal.ts                            # Meal, MealItem, ParsedMeal
    insight.ts                         # WeeklyInsight, WeeklyReport
supabase/
  schema.sql                           # All table DDL + RLS policies
public/
  wordmark-amber.png etc.              # Fit Betta brand assets
  manifest.json                        # PWA manifest
```

## Key conventions

- **Server Components by default.** Only add `"use client"` for hooks/browser APIs.
- **Auth via (app)/layout.tsx.** All `/home`, `/check-in`, `/log`, `/score`, `/food`, `/workout`, `/move`, `/insights` routes are guarded there. The middleware also guards non-public routes.
- **Supabase clients.** Use `src/lib/supabase/server.ts` in Server Components and Route Handlers; `src/lib/supabase/client.ts` in Client Components.
- **All AI calls go through `src/lib/ai.ts`.** Model: `llama-3.3-70b-versatile` via Groq.
- **Types.** All shared types live in `src/types/`. Do not inline ad-hoc types.
- **Design tokens.** Dark amber theme — bg #111110, card #1A1916, amber #E8622A, text #FAFAF8. See `tailwind.config.ts` and `globals.css`.

## Local setup

1. Copy `.env.local` and fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   GROQ_API_KEY=
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
2. Run the SQL in `supabase/schema.sql` against your Supabase project.
3. `npm run dev` — app runs on http://localhost:3000.

## Database tables

| Table | Notes |
|---|---|
| `workout_sessions` | Original workout log (exercises, muscle_groups, etc.) |
| `daily_logs` | One per user per day — check-in data + computed score |
| `meals` | Meal logs with AI-generated tags |
| `weekly_reports` | Precomputed weekly insight reports |

RLS enabled on all tables — users can only read/write their own rows.

## Score formula

`computeScore()` in `src/lib/score.ts`:
- Sleep: `min(hours/8, 1) × 30` pts
- Stress: `(1 - (stress-1)/9) × 25` pts (inverted)
- Energy: `((energy-1)/9) × 25` pts
- Lifestyle: exercised(10) + caffeine<200mg(6 else 2) + focus(max 4) pts

## Adding features

- **New screen:** add under `src/app/(app)/` — auth is inherited from the layout
- **New API route:** add under `src/app/api/`; always verify auth via `supabase.auth.getUser()`
- **New AI function:** add to `src/lib/ai.ts`
- **Schema changes:** write migrations in `supabase/` and apply via Supabase CLI or SQL editor
