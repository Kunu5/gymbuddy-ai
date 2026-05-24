# Fit Betta

A cognitive performance app. Two-minute morning check-in → one number that explains your day → weekly patterns that tell you what to change.

## Stack

- Next.js 14 App Router + TypeScript
- Supabase (auth + Postgres + RLS)
- Groq SDK / Llama 3.3 (AI parsing + recommendations)
- Tailwind CSS + shadcn/ui
- Plus Jakarta Sans + JetBrains Mono

## Local setup

1. Copy `.env.local` and fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   GROQ_API_KEY=
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
2. Run `supabase/schema.sql` in your Supabase SQL editor.
3. `npm install && npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

## Screens

| Route | Screen |
|---|---|
| `/` | Landing |
| `/auth/login` | Sign up / Log in |
| `/home` | Morning Brief |
| `/check-in` | Daily Check-In |
| `/score` | Score Detail |
| `/log` | Log Hub |
| `/food` | Food Logger |
| `/workout` | Workout Log |
| `/move` | Move (AI recommendation) |
| `/insights` | Weekly Insights |
