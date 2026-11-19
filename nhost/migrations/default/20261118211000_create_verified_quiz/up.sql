-- Partidas verificadas pela Nhost Function /challenge.
-- Somente a funcao serverless (admin secret no backend) pode escrever nesta tabela.
CREATE TABLE IF NOT EXISTS public.conquest_verified_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_round integer NOT NULL DEFAULT 0 CHECK (current_round BETWEEN 0 AND 6),
  current_question integer NOT NULL CHECK (current_question BETWEEN 0 AND 14),
  score integer NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 600),
  correct_answers integer NOT NULL DEFAULT 0 CHECK (correct_answers BETWEEN 0 AND 6),
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  CONSTRAINT conquest_completed_consistent CHECK (NOT completed OR (current_round = 6 AND finished_at IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS conquest_verified_runs_user_created
  ON public.conquest_verified_runs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS conquest_verified_runs_ranking
  ON public.conquest_verified_runs (score DESC) WHERE completed = true;

-- Publica somente apelido pseudonimo, melhor resultado e numero de partidas.
-- NUNCA inclui email, dados de sessao, resposta correta ou identificador completo.
CREATE OR REPLACE VIEW public.conquest_leaderboard AS
SELECT ('Aventureiro-' || upper(substr(replace(user_id::text, '-', ''), 1, 6)))::text AS nickname,
       max(score)::integer AS best_score,
       count(*)::integer AS completed_runs
FROM public.conquest_verified_runs
WHERE completed = true
GROUP BY user_id;