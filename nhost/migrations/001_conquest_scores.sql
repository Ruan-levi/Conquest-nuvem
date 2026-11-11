-- Execute no SQL Editor Nhost com acesso administrativo. Permissoes Hasura sao configuradas separadamente.
CREATE TABLE IF NOT EXISTS public.conquest_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score BETWEEN 0 AND 100000),
  correct_answers integer NOT NULL CHECK (correct_answers BETWEEN 0 AND 100),
  total_answers integer NOT NULL CHECK (total_answers BETWEEN correct_answers AND 300),
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS conquest_scores_owner_created
  ON public.conquest_scores (user_id, created_at DESC);
-- Hasura: role user pode inserir score, correct_answers, total_answers, completed,
-- com preset user_id = X-Hasura-User-Id. Nao pode fornecer user_id diretamente.
-- SELECT somente where user_id = X-Hasura-User-Id; sem UPDATE/DELETE.
-- Role public/anonymous: sem acesso. Confira docs/NHOST.md.
