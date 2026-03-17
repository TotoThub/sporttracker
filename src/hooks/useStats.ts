import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { BodyMeasurement } from '../types'
import { useAuth } from './useAuth'

export interface ExerciseProgress {
  exercise_id: string
  exercise_name: string
  muscle_group: string
  history: Array<{
    date: string
    max_weight: number | null
    max_reps: number | null
    total_volume: number
    total_sets: number
    resistance_level: string | null
  }>
}

export interface MuscleGroupStats {
  muscle_group: string
  total_sets: number
  total_sessions: number
}

export interface WeeklyVolume {
  week: string
  total_sets: number
  total_reps: number
  total_volume: number
  session_count: number
}

export function useStats() {
  const { user } = useAuth()
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([])
  const [muscleGroupStats, setMuscleGroupStats] = useState<MuscleGroupStats[]>([])
  const [weeklyVolume, setWeeklyVolume] = useState<WeeklyVolume[]>([])
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>([])
  const [personalRecords, setPersonalRecords] = useState<Array<{
    exercise_name: string
    muscle_group: string
    max_weight: number
    max_reps: number
    date: string
  }>>([])
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    setLoading(true)

    // Fetch all completed sessions with exercises and sets
    const { data: sessions } = await supabase
      .from('sessions')
      .select(`
        id, date, duration_minutes,
        session_exercises(
          exercise_id,
          exercise:exercises(id, name, muscle_group),
          sets:exercise_sets(set_number, reps, weight_kg, resistance_level, completed)
        )
      `)
      .eq('completed', true)
      .order('date', { ascending: true })

    // Fetch body measurements
    const { data: measurements } = await supabase
      .from('body_measurements')
      .select('*')
      .order('date', { ascending: true })

    setBodyMeasurements(measurements ?? [])

    if (!sessions || sessions.length === 0) {
      setLoading(false)
      return
    }

    // Build exercise progress
    const progressMap = new Map<string, ExerciseProgress>()
    const muscleMap = new Map<string, MuscleGroupStats>()
    const weekMap = new Map<string, WeeklyVolume>()
    const prMap = new Map<string, { exercise_name: string; muscle_group: string; max_weight: number; max_reps: number; date: string }>()

    for (const session of sessions) {
      const sessionDate = session.date
      // Week key (ISO week)
      const d = new Date(sessionDate)
      const weekStart = new Date(d)
      weekStart.setDate(d.getDate() - d.getDay() + 1)
      const weekKey = weekStart.toISOString().split('T')[0]

      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, { week: weekKey, total_sets: 0, total_reps: 0, total_volume: 0, session_count: 0 })
      }
      const weekData = weekMap.get(weekKey)!
      weekData.session_count++

      const sessionExercises = (session as Record<string, unknown>).session_exercises as Array<{
        exercise_id: string
        exercise: { id: string; name: string; muscle_group: string } | null
        sets: Array<{ set_number: number; reps: number | null; weight_kg: number | null; resistance_level: string | null; completed: boolean }> | null
      }>

      for (const se of (sessionExercises ?? [])) {
        const exercise = se.exercise
        if (!exercise) continue

        const completedSets = (se.sets ?? []).filter((s) => s.completed)
        if (completedSets.length === 0) continue

        // Exercise progress
        if (!progressMap.has(exercise.id)) {
          progressMap.set(exercise.id, {
            exercise_id: exercise.id,
            exercise_name: exercise.name,
            muscle_group: exercise.muscle_group,
            history: [],
          })
        }

        const maxWeight = Math.max(0, ...completedSets.map((s) => s.weight_kg ?? 0))
        const maxReps = Math.max(0, ...completedSets.map((s) => s.reps ?? 0))
        const totalVolume = completedSets.reduce((sum, s) => sum + (s.weight_kg ?? 0) * (s.reps ?? 0), 0)
        const lastResistance = completedSets.find((s) => s.resistance_level)?.resistance_level ?? null

        progressMap.get(exercise.id)!.history.push({
          date: sessionDate,
          max_weight: maxWeight || null,
          max_reps: maxReps || null,
          total_volume: totalVolume,
          total_sets: completedSets.length,
          resistance_level: lastResistance,
        })

        // Personal records
        const currentPR = prMap.get(exercise.id)
        if (!currentPR || maxWeight > currentPR.max_weight) {
          prMap.set(exercise.id, {
            exercise_name: exercise.name,
            muscle_group: exercise.muscle_group,
            max_weight: maxWeight,
            max_reps: maxReps,
            date: sessionDate,
          })
        }

        // Muscle group stats
        const mg = exercise.muscle_group
        if (!muscleMap.has(mg)) {
          muscleMap.set(mg, { muscle_group: mg, total_sets: 0, total_sessions: 0 })
        }
        const muscleData = muscleMap.get(mg)!
        muscleData.total_sets += completedSets.length

        // Weekly volume
        weekData.total_sets += completedSets.length
        weekData.total_reps += completedSets.reduce((sum, s) => sum + (s.reps ?? 0), 0)
        weekData.total_volume += totalVolume
      }
    }

    // Count unique sessions per muscle group
    for (const session of sessions) {
      const seenMuscles = new Set<string>()
      const sessionExercises = (session as Record<string, unknown>).session_exercises as Array<{
        exercise: { muscle_group: string } | null
      }>
      for (const se of (sessionExercises ?? [])) {
        if (se.exercise) seenMuscles.add(se.exercise.muscle_group)
      }
      for (const mg of seenMuscles) {
        const stat = muscleMap.get(mg)
        if (stat) stat.total_sessions++
      }
    }

    setExerciseProgress(Array.from(progressMap.values()))
    setMuscleGroupStats(Array.from(muscleMap.values()).sort((a, b) => b.total_sets - a.total_sets))
    setWeeklyVolume(Array.from(weekMap.values()).sort((a, b) => a.week.localeCompare(b.week)))
    setPersonalRecords(
      Array.from(prMap.values())
        .filter((pr) => pr.max_weight > 0)
        .sort((a, b) => b.max_weight - a.max_weight)
    )
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const addBodyMeasurement = async (measurement: { date: string; weight_kg?: number; body_fat_percent?: number; notes?: string }) => {
    const { data, error } = await supabase
      .from('body_measurements')
      .insert({ ...measurement, user_id: user?.id })
      .select()
      .single()

    if (error) {
      console.error('Erreur ajout mesure:', error)
      return null
    }
    setBodyMeasurements((prev) => [...prev, data].sort((a, b) => a.date.localeCompare(b.date)))
    return data
  }

  return {
    exerciseProgress,
    muscleGroupStats,
    weeklyVolume,
    bodyMeasurements,
    personalRecords,
    loading,
    addBodyMeasurement,
    refetch: fetchStats,
  }
}
