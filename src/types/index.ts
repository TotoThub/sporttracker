export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'full_body'

export type Equipment = 'bench' | 'dumbbells' | 'elastic_bands' | 'bodyweight' | 'smartworkout'

export interface Exercise {
  id: string
  name: string
  muscle_group: MuscleGroup
  equipment: Equipment[]
  description?: string
  created_at: string
}

export interface Session {
  id: string
  date: string
  duration_minutes: number | null
  notes: string | null
  completed: boolean
  template_id: string | null
  created_at: string
  template?: WorkoutTemplate
}

export interface WorkoutTemplate {
  id: string
  name: string
  description: string | null
  color: string
  created_at: string
  updated_at: string
  exercises?: WorkoutTemplateExercise[]
}

export interface WorkoutTemplateExercise {
  id: string
  template_id: string
  exercise_id: string
  order_index: number
  default_sets: number
  default_reps: number | null
  default_weight_kg: number | null
  default_resistance_level: string | null
  default_rest_seconds: number
  notes: string | null
  exercise?: Exercise
}

export interface SessionExercise {
  id: string
  session_id: string
  exercise_id: string
  order_index: number
  created_at: string
  exercise?: Exercise
  sets?: ExerciseSet[]
}

export interface ExerciseSet {
  id: string
  session_exercise_id: string
  set_number: number
  reps: number | null
  weight_kg: number | null
  resistance_level: string | null
  rest_seconds: number | null
  completed: boolean
}

export type GoalScope = 'exercise' | 'global'
export type GlobalGoalType = 'body_weight' | 'body_fat' | 'sessions_per_week' | 'sessions_per_month' | 'custom'

export interface Goal {
  id: string
  exercise_id: string | null
  goal_scope: GoalScope
  global_type: GlobalGoalType | null
  global_label: string | null
  target_type: 'weight' | 'reps' | 'sets'
  target_value: number
  current_value: number
  target_date: string | null
  achieved: boolean
  achieved_at: string | null
  created_at: string
  exercise?: Exercise
}

export interface BodyMeasurement {
  id: string
  date: string
  weight_kg: number | null
  body_fat_percent: number | null
  notes: string | null
  created_at: string
}

export const GLOBAL_GOAL_LABELS: Record<GlobalGoalType, string> = {
  body_weight: 'Poids corporel',
  body_fat: 'Masse grasse',
  sessions_per_week: 'Séances / semaine',
  sessions_per_month: 'Séances / mois',
  custom: 'Objectif personnalisé',
}

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: 'Pectoraux',
  back: 'Dos',
  shoulders: 'Épaules',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Avant-bras',
  abs: 'Abdominaux',
  quads: 'Quadriceps',
  hamstrings: 'Ischio-jambiers',
  glutes: 'Fessiers',
  calves: 'Mollets',
  full_body: 'Full Body',
}

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  bench: 'Banc',
  dumbbells: 'Haltères',
  elastic_bands: 'Élastiques',
  bodyweight: 'Poids du corps',
  smartworkout: 'SmartWorkout',
}

export const MUSCLE_GROUP_COLORS: Record<MuscleGroup, string> = {
  chest: 'bg-red-500/20 text-red-400',
  back: 'bg-blue-500/20 text-blue-400',
  shoulders: 'bg-orange-500/20 text-orange-400',
  biceps: 'bg-purple-500/20 text-purple-400',
  triceps: 'bg-pink-500/20 text-pink-400',
  forearms: 'bg-amber-500/20 text-amber-400',
  abs: 'bg-yellow-500/20 text-yellow-400',
  quads: 'bg-green-500/20 text-green-400',
  hamstrings: 'bg-teal-500/20 text-teal-400',
  glutes: 'bg-indigo-500/20 text-indigo-400',
  calves: 'bg-cyan-500/20 text-cyan-400',
  full_body: 'bg-slate-500/20 text-slate-400',
}

export const TEMPLATE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  blue:   { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  red:    { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
  green:  { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30' },
  purple: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
  orange: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' },
  pink:   { bg: 'bg-pink-500/15', text: 'text-pink-400', border: 'border-pink-500/30' },
  cyan:   { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  yellow: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30' },
}
