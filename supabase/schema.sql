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
