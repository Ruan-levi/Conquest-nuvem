-- Aplicar no SQL Editor do Nhost, apos 001_conquest_scores.sql.
-- Somente a Function, com NHOST_ADMIN_SECRET no servidor, pode escrever nesta tabela.
CREATE TABLE IF NOT EXISTS public.conquest_duels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(8) NOT NULL UNIQUE,
  host_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  host_nickname varchar(24) NOT NULL,
  guest_nickname varchar(24),
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'finished', 'cancelled')),
  host_round integer NOT NULL DEFAULT 0 CHECK (host_round BETWEEN 0 AND 6),
  guest_round integer NOT NULL DEFAULT 0 CHECK (guest_round BETWEEN 0 AND 6),
  host_score integer NOT NULL DEFAULT 0 CHECK (host_score BETWEEN 0 AND 600),
  guest_score integer NOT NULL DEFAULT 0 CHECK (guest_score BETWEEN 0 AND 600),
  host_correct integer NOT NULL DEFAULT 0 CHECK (host_correct BETWEEN 0 AND 6),
  guest_correct integer NOT NULL DEFAULT 0 CHECK (guest_correct BETWEEN 0 AND 6),
  created_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  CONSTRAINT conquest_duels_distinct_users CHECK (guest_id IS NULL OR guest_id <> host_id),
  CONSTRAINT conquest_duels_finished_consistent CHECK (
    status <> 'finished' OR (host_round = 6 AND guest_round = 6 AND finished_at IS NOT NULL)
  )
);
CREATE INDEX IF NOT EXISTS conquest_duels_host_recent ON public.conquest_duels (host_id, created_at DESC);
CREATE INDEX IF NOT EXISTS conquest_duels_guest_recent ON public.conquest_duels (guest_id, created_at DESC);

-- Classificacao calculada EXCLUSIVAMENTE a partir de duelos concluidos pelos dois usuarios.
-- Nao inclui email, ID de usuario, respostas ou pontuacoes enviadas pelo navegador.
CREATE OR REPLACE VIEW public.conquest_duel_leaderboard AS
WITH results AS (
  SELECT host_id AS user_id, host_nickname AS nickname, host_score AS points,
         CASE WHEN host_score > guest_score THEN 1 ELSE 0 END AS win
    FROM public.conquest_duels
   WHERE status = 'finished' AND host_round = 6 AND guest_round = 6
  UNION ALL
  SELECT guest_id AS user_id, guest_nickname AS nickname, guest_score AS points,
         CASE WHEN guest_score > host_score THEN 1 ELSE 0 END AS win
    FROM public.conquest_duels
   WHERE status = 'finished' AND host_round = 6 AND guest_round = 6
)
SELECT user_id, max(nickname) AS nickname, max(points)::integer AS best_score,
       count(*)::integer AS played, sum(win)::integer AS wins
  FROM results GROUP BY user_id;

-- Hasura: Track public.conquest_duels e public.conquest_duel_leaderboard.
-- Para role user, SELECT na tabela somente com filtro
-- {_or: [{host_id: {_eq: X-Hasura-User-Id}}, {guest_id: {_eq: X-Hasura-User-Id}}]}
-- Permitir SOMENTE status, host_nickname, guest_nickname, host_round,
-- guest_round, host_score, guest_score, id (e code se desejado).
-- Negar INSERT/UPDATE/DELETE para roles user e public.
-- Na view, SELECT publico apenas nickname, best_score, played, wins; nunca user_id.
-- A Function faz consultas e mutacoes com segredo exclusivamente no backend.
