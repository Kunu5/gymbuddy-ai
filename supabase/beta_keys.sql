-- Beta access keys table
-- Managed via Supabase dashboard; service role only via RLS
CREATE TABLE IF NOT EXISTS public.beta_keys (
  key         TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.beta_keys ENABLE ROW LEVEL SECURITY;

-- Block all client-side access; only service role key can read/write
CREATE POLICY "deny_all" ON public.beta_keys FOR ALL USING (false);
