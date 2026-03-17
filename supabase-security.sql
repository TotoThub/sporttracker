-- ============================================
-- SÉCURISATION RLS — À exécuter dans Supabase SQL Editor
-- ============================================
-- IMPORTANT: Sans RLS, n'importe qui ayant la clé anon
-- (visible dans le JS du site déployé) peut lire/modifier/supprimer
-- toutes tes données.
--
-- Cette config active le RLS et autorise toutes les opérations
-- pour la clé anon (rôle "anon"). C'est suffisant pour une app
-- mono-utilisateur. Si tu ajoutes l'auth plus tard, remplace
-- "anon" par "authenticated" et ajoute des filtres user_id.
-- ============================================

-- 1. Activer RLS sur toutes les tables
alter table exercises enable row level security;
alter table sessions enable row level security;
alter table session_exercises enable row level security;
alter table exercise_sets enable row level security;
alter table goals enable row level security;
alter table workout_templates enable row level security;
alter table workout_template_exercises enable row level security;
alter table body_measurements enable row level security;

-- 2. Policies pour "anon" — accès complet (mono-utilisateur)
-- exercises
create policy "anon_all_exercises" on exercises for all using (true) with check (true);

-- sessions
create policy "anon_all_sessions" on sessions for all using (true) with check (true);

-- session_exercises
create policy "anon_all_session_exercises" on session_exercises for all using (true) with check (true);

-- exercise_sets
create policy "anon_all_exercise_sets" on exercise_sets for all using (true) with check (true);

-- goals
create policy "anon_all_goals" on goals for all using (true) with check (true);

-- workout_templates
create policy "anon_all_workout_templates" on workout_templates for all using (true) with check (true);

-- workout_template_exercises
create policy "anon_all_workout_template_exercises" on workout_template_exercises for all using (true) with check (true);

-- body_measurements
create policy "anon_all_body_measurements" on body_measurements for all using (true) with check (true);
