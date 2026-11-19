-- Rollback exclusivo da nova funcionalidade. Nao executar em producao sem backup.
DROP VIEW IF EXISTS public.conquest_duel_leaderboard;
DROP TABLE IF EXISTS public.conquest_duels;
