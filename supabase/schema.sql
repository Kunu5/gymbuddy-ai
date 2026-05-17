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
