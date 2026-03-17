-- ============================================
-- WORKOUT TEMPLATES (Programmes / Séries d'exercices)
-- À exécuter dans l'éditeur SQL de Supabase
-- ============================================

-- Table des programmes
create table workout_templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  color text not null default 'blue',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Exercices dans un programme (avec ordre + config par défaut)
create table workout_template_exercises (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid not null references workout_templates(id) on delete cascade,
  exercise_id uuid not null references exercises(id) on delete cascade,
  order_index integer not null default 0,
  default_sets integer not null default 3,
  default_reps integer,
  default_weight_kg numeric(6,2),
  default_resistance_level text,
  default_rest_seconds integer not null default 90,
  notes text
);

-- Index
create index idx_template_exercises_template on workout_template_exercises(template_id);
create index idx_template_exercises_order on workout_template_exercises(template_id, order_index);

-- Ajouter une colonne template_id aux sessions pour savoir d'où elles viennent
alter table sessions add column template_id uuid references workout_templates(id) on delete set null;
