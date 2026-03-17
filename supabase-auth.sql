-- ============================================
-- AUTH + RLS — Sécurisation complète par utilisateur
-- À exécuter dans l'éditeur SQL de Supabase
-- ============================================
-- IMPORTANT: Avant d'exécuter ce script, active l'auth email
-- dans Supabase > Authentication > Providers > Email (actif par défaut)
-- ============================================

-- 1. Ajouter user_id à toutes les tables
alter table exercises add column user_id uuid references auth.users(id) on delete cascade;
alter table sessions add column user_id uuid references auth.users(id) on delete cascade;
alter table goals add column user_id uuid references auth.users(id) on delete cascade;
alter table workout_templates add column user_id uuid references auth.users(id) on delete cascade;
alter table body_measurements add column user_id uuid references auth.users(id) on delete cascade;

-- 2. Activer RLS sur toutes les tables
alter table exercises enable row level security;
alter table sessions enable row level security;
alter table session_exercises enable row level security;
alter table exercise_sets enable row level security;
alter table goals enable row level security;
alter table workout_templates enable row level security;
alter table workout_template_exercises enable row level security;
alter table body_measurements enable row level security;

-- 3. Policies — chaque utilisateur ne voit que SES données

-- exercises
create policy "users_own_exercises" on exercises
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- sessions
create policy "users_own_sessions" on sessions
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- session_exercises (via session.user_id)
create policy "users_own_session_exercises" on session_exercises
  for all using (
    exists (select 1 from sessions where sessions.id = session_exercises.session_id and sessions.user_id = auth.uid())
  )
  with check (
    exists (select 1 from sessions where sessions.id = session_exercises.session_id and sessions.user_id = auth.uid())
  );

-- exercise_sets (via session_exercises -> sessions.user_id)
create policy "users_own_exercise_sets" on exercise_sets
  for all using (
    exists (
      select 1 from session_exercises
      join sessions on sessions.id = session_exercises.session_id
      where session_exercises.id = exercise_sets.session_exercise_id
      and sessions.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from session_exercises
      join sessions on sessions.id = session_exercises.session_id
      where session_exercises.id = exercise_sets.session_exercise_id
      and sessions.user_id = auth.uid()
    )
  );

-- goals
create policy "users_own_goals" on goals
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- workout_templates
create policy "users_own_templates" on workout_templates
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- workout_template_exercises (via template.user_id)
create policy "users_own_template_exercises" on workout_template_exercises
  for all using (
    exists (select 1 from workout_templates where workout_templates.id = workout_template_exercises.template_id and workout_templates.user_id = auth.uid())
  )
  with check (
    exists (select 1 from workout_templates where workout_templates.id = workout_template_exercises.template_id and workout_templates.user_id = auth.uid())
  );

-- body_measurements
create policy "users_own_measurements" on body_measurements
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. Mettre à jour les exercices pré-remplis :
-- Ils n'ont pas de user_id, donc ils seront invisibles après le RLS.
-- On les ré-assignera au premier utilisateur qui se connecte via l'app.
-- L'app gère ça automatiquement (voir code).
