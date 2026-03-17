import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Goal, GlobalGoalType } from '../types'

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  const fetchGoals = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('goals')
      .select('*, exercise:exercises(*)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur chargement objectifs:', error)
    } else {
      setGoals(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  const addExerciseGoal = async (goal: {
    exercise_id: string
    target_type: 'weight' | 'reps' | 'sets'
    target_value: number
    current_value?: number
    target_date?: string
  }) => {
    const { data, error } = await supabase
      .from('goals')
      .insert({
        ...goal,
        goal_scope: 'exercise',
        current_value: goal.current_value ?? 0,
        achieved: false,
      })
      .select('*, exercise:exercises(*)')
      .single()

    if (error) {
      console.error('Erreur ajout objectif exercice:', error)
      return null
    }
    setGoals((prev) => [data, ...prev])
    return data
  }

  const addGlobalGoal = async (goal: {
    global_type: GlobalGoalType
    global_label?: string
    target_type: 'weight' | 'reps' | 'sets'
    target_value: number
    current_value?: number
    target_date?: string
  }) => {
    const { data, error } = await supabase
      .from('goals')
      .insert({
        goal_scope: 'global',
        global_type: goal.global_type,
        global_label: goal.global_label ?? null,
        target_type: goal.target_type,
        target_value: goal.target_value,
        current_value: goal.current_value ?? 0,
        target_date: goal.target_date ?? null,
        achieved: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Erreur ajout objectif global:', error)
      return null
    }
    setGoals((prev) => [data, ...prev])
    return data
  }

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const goal = goals.find((g) => g.id === id)
    const achieved = updates.current_value !== undefined && goal
      ? (updates.current_value ?? 0) >= goal.target_value
      : undefined

    const updatePayload: Record<string, unknown> = { ...updates }
    if (achieved) {
      updatePayload.achieved = true
      updatePayload.achieved_at = new Date().toISOString()
    }

    const { error } = await supabase.from('goals').update(updatePayload).eq('id', id)
    if (error) {
      console.error('Erreur mise à jour objectif:', error)
      return false
    }

    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updatePayload } as Goal : g))
    )
    return true
  }

  const deleteGoal = async (id: string) => {
    const { error } = await supabase.from('goals').delete().eq('id', id)
    if (error) {
      console.error('Erreur suppression objectif:', error)
      return false
    }
    setGoals((prev) => prev.filter((g) => g.id !== id))
    return true
  }

  return { goals, loading, addExerciseGoal, addGlobalGoal, updateGoal, deleteGoal, refetch: fetchGoals }
}
