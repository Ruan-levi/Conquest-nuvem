-- Migracao idempotente do historico demonstrativo ja presente no repositorio.
-- NAO e a fonte da classificacao competitiva; os pontos sao calculados no cliente.
CREATE TABLE IF NOT EXISTS public.conquest_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score BETWEEN 0 AND 100000),
  correct_answers integer NOT NULL CHECK (correct_answers BETWEEN 0 AND 100),
  total_answers integer NOT NULL CHECK (total_answers BETWEEN correct_answers AND 300),
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS conquest_scores_owner_created ON public.conquest_scores (user_id, created_at DESC);