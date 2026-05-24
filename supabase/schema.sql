-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Workout sessions table
create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  raw_input text not null,
  title text not null,
  date date not null,
  duration_minutes integer,
  exercises jsonb not null default '[]'::jsonb,
  muscle_groups text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now()
);

-- Index for fast per-user queries
create index if not exists workout_sessions_user_id_date_idx
  on public.workout_sessions(user_id, date desc);

-- Row-level security
alter table public.workout_sessions enable row level security;

create policy "Users can manage their own sessions"
  on public.workout_sessions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Coach analyses table (one row per user, upserted on each new workout)
create table if not exists public.coach_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  neglected_muscle_groups text[] not null default '{}',
  next_session jsonb not null default '{}'::jsonb,
  trend_observation text not null default '',
  generated_at timestamptz not null default now(),
  trigger_session_id uuid references public.workout_sessions(id),
  unique(user_id)
);

create index if not exists coach_analyses_user_id_idx
  on public.coach_analyses(user_id);

alter table public.coach_analyses enable row level security;

create policy "Users can manage their own coach analysis"
  on public.coach_analyses
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Fit Betta tables ──────────────────────────────────────────

-- Daily check-ins (one per user per day)
create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  sleep_hours numeric(3,1),
  energy smallint check (energy between 1 and 10),
  focus smallint check (focus between 1 and 10),
  stress smallint check (stress between 1 and 10),
  caffeine_mg integer,
  exercised boolean,
  score smallint,
  score_breakdown jsonb,
  created_at timestamptz not null default now(),
  unique(user_id, date)
);
create index if not exists daily_logs_user_date_idx on public.daily_logs(user_id, date desc);
alter table public.daily_logs enable row level security;
create policy "own daily_logs" on public.daily_logs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Meals
create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_at timestamptz not null default now(),
  raw_input text,
  photo_url text,
  items jsonb not null default '[]',
  ai_tag text,
  ai_tag_kind text check (ai_tag_kind in ('positive','warn','neutral'))
);
create index if not exists meals_user_logged_idx on public.meals(user_id, logged_at desc);
alter table public.meals enable row level security;
create policy "own meals" on public.meals for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Weekly insight reports
create table if not exists public.weekly_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  insights jsonb not null,
  generated_at timestamptz not null default now(),
  unique(user_id, week_start)
);
alter table public.weekly_reports enable row level security;
create policy "own weekly_reports" on public.weekly_reports for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- DROP the gym-only table
drop policy if exists "Users can manage their own coach analysis" on public.coach_analyses;
drop table if exists public.coach_analyses;
