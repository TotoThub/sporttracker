-- Assigner tous les exercices orphelins (user_id = null) à ton compte
-- Remplace l'UUID ci-dessous par ton user ID (visible dans Supabase > Authentication > Users)
-- Ton user ID est : d712e376-cce2-47d1-a700-e2e4f7117eaa (extrait du token JWT)

update exercises set user_id = 'd712e376-cce2-47d1-a700-e2e4f7117eaa' where user_id is null;
