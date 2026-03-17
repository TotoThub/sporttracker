-- Fonction pour assigner les exercices orphelins à un utilisateur
-- SECURITY DEFINER = s'exécute avec les droits du propriétaire (bypass RLS)
-- Utile pour les futurs utilisateurs qui s'inscrivent

create or replace function claim_orphan_exercises(target_user_id uuid)
returns void
language sql
security definer
as $$
  -- Dupliquer les exercices de base pour le nouvel utilisateur
  -- (au lieu de les voler au premier utilisateur)
  insert into exercises (name, muscle_group, equipment, description, user_id)
  select name, muscle_group, equipment, description, target_user_id
  from exercises
  where user_id is null
  on conflict do nothing;
$$;

-- Donner le droit d'appeler cette fonction au rôle anon et authenticated
grant execute on function claim_orphan_exercises(uuid) to anon, authenticated;
