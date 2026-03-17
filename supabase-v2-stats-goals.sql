-- ============================================
-- V2: Objectifs globaux + support stats
-- À exécuter dans l'éditeur SQL de Supabase
-- ============================================

-- Mesures corporelles (poids, tour de bras, etc.)
create table body_measurements (
  id uuid primary key default uuid_generate_v4(),
  date date not null default current_date,
  weight_kg numeric(5,1),
  body_fat_percent numeric(4,1),
  notes text,
  created_at timestamptz not null default now()
);

create index idx_body_measurements_date on body_measurements(date desc);

-- Étendre la table goals pour supporter les objectifs globaux
alter table goals add column goal_scope text not null default 'exercise'
  check (goal_scope in ('exercise', 'global'));
alter table goals add column global_type text
  check (global_type in ('body_weight', 'body_fat', 'sessions_per_week', 'sessions_per_month', 'custom'));
alter table goals add column global_label text;
-- Rendre exercise_id nullable pour les objectifs globaux
alter table goals alter column exercise_id drop not null;
