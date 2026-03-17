-- ============================================
-- Sport Tracker — Supabase Schema
-- À exécuter dans l'éditeur SQL de Supabase
-- ============================================

-- Extension UUID
create extension if not exists "uuid-ossp";

-- ============================================
-- EXERCISES
-- ============================================
create table exercises (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  muscle_group text not null check (muscle_group in (
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
    'abs', 'quads', 'hamstrings', 'glutes', 'calves', 'full_body'
  )),
  equipment text[] not null default '{}',
  description text,
  created_at timestamptz not null default now()
);

-- ============================================
-- SESSIONS
-- ============================================
create table sessions (
  id uuid primary key default uuid_generate_v4(),
  date date not null default current_date,
  duration_minutes integer,
  notes text,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================
-- SESSION_EXERCISES (pivot)
-- ============================================
create table session_exercises (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references sessions(id) on delete cascade,
  exercise_id uuid not null references exercises(id) on delete cascade,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================
-- EXERCISE_SETS (séries)
-- ============================================
create table exercise_sets (
  id uuid primary key default uuid_generate_v4(),
  session_exercise_id uuid not null references session_exercises(id) on delete cascade,
  set_number integer not null default 1,
  reps integer,
  weight_kg numeric(6,2),
  resistance_level text,
  rest_seconds integer,
  completed boolean not null default false
);

-- ============================================
-- GOALS (objectifs)
-- ============================================
create table goals (
  id uuid primary key default uuid_generate_v4(),
  exercise_id uuid not null references exercises(id) on delete cascade,
  target_type text not null check (target_type in ('weight', 'reps', 'sets')),
  target_value numeric(8,2) not null,
  current_value numeric(8,2) not null default 0,
  target_date date,
  achieved boolean not null default false,
  achieved_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================
-- INDEX pour performance
-- ============================================
create index idx_sessions_date on sessions(date desc);
create index idx_session_exercises_session on session_exercises(session_id);
create index idx_exercise_sets_session_exercise on exercise_sets(session_exercise_id);
create index idx_goals_exercise on goals(exercise_id);
create index idx_goals_achieved on goals(achieved);

-- ============================================
-- RLS (Row Level Security) — désactivé par défaut
-- Active-le si tu ajoutes l'auth Supabase plus tard
-- ============================================
-- alter table exercises enable row level security;
-- alter table sessions enable row level security;
-- alter table session_exercises enable row level security;
-- alter table exercise_sets enable row level security;
-- alter table goals enable row level security;

-- ============================================
-- EXERCICES PRÉ-REMPLIS
-- Adaptés à ton équipement : banc, haltères, SmartWorkout
-- ============================================
insert into exercises (name, muscle_group, equipment) values
  -- Pectoraux
  ('Développé couché haltères', 'chest', '{"dumbbells","bench"}'),
  ('Développé incliné haltères', 'chest', '{"dumbbells","bench"}'),
  ('Écarté couché haltères', 'chest', '{"dumbbells","bench"}'),
  ('Pompes classiques', 'chest', '{"bodyweight"}'),
  ('Chest press élastiques', 'chest', '{"elastic_bands","smartworkout"}'),
  ('Écarté élastiques', 'chest', '{"elastic_bands","smartworkout"}'),

  -- Dos
  ('Rowing haltère unilatéral', 'back', '{"dumbbells","bench"}'),
  ('Rowing élastiques', 'back', '{"elastic_bands","smartworkout"}'),
  ('Tirage vertical élastiques', 'back', '{"elastic_bands","smartworkout"}'),
  ('Pull-over haltère', 'back', '{"dumbbells","bench"}'),
  ('Face pull élastiques', 'back', '{"elastic_bands","smartworkout"}'),

  -- Épaules
  ('Développé militaire haltères', 'shoulders', '{"dumbbells"}'),
  ('Élévations latérales haltères', 'shoulders', '{"dumbbells"}'),
  ('Élévations frontales haltères', 'shoulders', '{"dumbbells"}'),
  ('Oiseau haltères', 'shoulders', '{"dumbbells","bench"}'),
  ('Développé épaules élastiques', 'shoulders', '{"elastic_bands","smartworkout"}'),
  ('Élévations latérales élastiques', 'shoulders', '{"elastic_bands","smartworkout"}'),

  -- Biceps
  ('Curl haltères', 'biceps', '{"dumbbells"}'),
  ('Curl marteau', 'biceps', '{"dumbbells"}'),
  ('Curl concentré', 'biceps', '{"dumbbells","bench"}'),
  ('Curl élastiques', 'biceps', '{"elastic_bands","smartworkout"}'),

  -- Triceps
  ('Extension haltère au-dessus de la tête', 'triceps', '{"dumbbells"}'),
  ('Kickback haltère', 'triceps', '{"dumbbells","bench"}'),
  ('Dips sur banc', 'triceps', '{"bench","bodyweight"}'),
  ('Extension triceps élastiques', 'triceps', '{"elastic_bands","smartworkout"}'),
  ('Pushdown élastiques', 'triceps', '{"elastic_bands","smartworkout"}'),

  -- Abdominaux
  ('Crunch classique', 'abs', '{"bodyweight"}'),
  ('Planche', 'abs', '{"bodyweight"}'),
  ('Mountain climbers', 'abs', '{"bodyweight"}'),
  ('Crunch élastiques', 'abs', '{"elastic_bands","smartworkout"}'),
  ('Russian twist haltère', 'abs', '{"dumbbells"}'),

  -- Quadriceps
  ('Squat goblet haltère', 'quads', '{"dumbbells"}'),
  ('Fentes haltères', 'quads', '{"dumbbells"}'),
  ('Squat élastiques', 'quads', '{"elastic_bands","smartworkout"}'),
  ('Fentes élastiques', 'quads', '{"elastic_bands","smartworkout"}'),
  ('Step-up sur banc', 'quads', '{"bench","dumbbells"}'),

  -- Ischio-jambiers
  ('Soulevé de terre roumain haltères', 'hamstrings', '{"dumbbells"}'),
  ('Leg curl élastiques', 'hamstrings', '{"elastic_bands","smartworkout"}'),
  ('Good morning élastiques', 'hamstrings', '{"elastic_bands","smartworkout"}'),
  ('Hip thrust sur banc', 'hamstrings', '{"bench","bodyweight"}'),

  -- Fessiers
  ('Hip thrust haltère sur banc', 'glutes', '{"dumbbells","bench"}'),
  ('Pont fessier', 'glutes', '{"bodyweight"}'),
  ('Squat sumo haltère', 'glutes', '{"dumbbells"}'),
  ('Abduction élastiques', 'glutes', '{"elastic_bands","smartworkout"}'),
  ('Donkey kicks élastiques', 'glutes', '{"elastic_bands","smartworkout"}'),

  -- Mollets
  ('Mollets debout haltères', 'calves', '{"dumbbells"}'),
  ('Mollets assis sur banc', 'calves', '{"bench","dumbbells"}'),
  ('Mollets élastiques', 'calves', '{"elastic_bands","smartworkout"}');
