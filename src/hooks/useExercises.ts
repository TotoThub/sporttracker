import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Exercise, MuscleGroup, Equipment } from '../types'

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)

  const fetchExercises = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name')

    if (error) {
      console.error('Erreur chargement exercices:', error)
    } else {
      setExercises(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchExercises()
  }, [fetchExercises])

  const addExercise = async (exercise: {
    name: string
    muscle_group: MuscleGroup
    equipment: Equipment[]
    description?: string
  }) => {
    const { data, error } = await supabase
      .from('exercises')
      .insert(exercise)
      .select()
      .single()

    if (error) {
      console.error('Erreur ajout exercice:', error)
      return null
    }

    setExercises((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return data
  }

  const deleteExercise = async (id: string) => {
    const { error } = await supabase.from('exercises').delete().eq('id', id)
    if (error) {
      console.error('Erreur suppression exercice:', error)
      return false
    }
    setExercises((prev) => prev.filter((e) => e.id !== id))
    return true
  }

  return { exercises, loading, addExercise, deleteExercise, refetch: fetchExercises }
}
