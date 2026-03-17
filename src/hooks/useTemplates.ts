import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { WorkoutTemplate, WorkoutTemplateExercise } from '../types'
import { useAuth } from './useAuth'

export function useTemplates() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('workout_templates')
      .select('*, exercises:workout_template_exercises(*, exercise:exercises(*))')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Erreur chargement programmes:', error)
    } else {
      setTemplates(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const createTemplate = async (template: { name: string; description?: string; color?: string }) => {
    const { data, error } = await supabase
      .from('workout_templates')
      .insert({ ...template, color: template.color ?? 'blue', user_id: user?.id })
      .select()
      .single()

    if (error) {
      console.error('Erreur création programme:', error)
      return null
    }
    await fetchTemplates()
    return data as WorkoutTemplate
  }

  const updateTemplate = async (id: string, updates: Partial<WorkoutTemplate>) => {
    const { error } = await supabase
      .from('workout_templates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Erreur mise à jour programme:', error)
      return false
    }
    await fetchTemplates()
    return true
  }

  const deleteTemplate = async (id: string) => {
    const { error } = await supabase.from('workout_templates').delete().eq('id', id)
    if (error) {
      console.error('Erreur suppression programme:', error)
      return false
    }
    setTemplates((prev) => prev.filter((t) => t.id !== id))
    return true
  }

  const addExerciseToTemplate = async (
    templateId: string,
    exerciseId: string,
    config?: Partial<WorkoutTemplateExercise>
  ) => {
    const currentTemplate = templates.find((t) => t.id === templateId)
    const orderIndex = currentTemplate?.exercises?.length ?? 0

    const { data, error } = await supabase
      .from('workout_template_exercises')
      .insert({
        template_id: templateId,
        exercise_id: exerciseId,
        order_index: orderIndex,
        default_sets: config?.default_sets ?? 3,
        default_reps: config?.default_reps ?? null,
        default_weight_kg: config?.default_weight_kg ?? null,
        default_resistance_level: config?.default_resistance_level ?? null,
        default_rest_seconds: config?.default_rest_seconds ?? 90,
        notes: config?.notes ?? null,
      })
      .select('*, exercise:exercises(*)')
      .single()

    if (error) {
      console.error('Erreur ajout exercice au programme:', error)
      return null
    }

    await supabase
      .from('workout_templates')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', templateId)

    await fetchTemplates()
    return data
  }

  const updateTemplateExercise = async (id: string, updates: Partial<WorkoutTemplateExercise>) => {
    const { error } = await supabase
      .from('workout_template_exercises')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Erreur mise à jour exercice programme:', error)
      return false
    }
    await fetchTemplates()
    return true
  }

  const removeExerciseFromTemplate = async (id: string) => {
    const { error } = await supabase
      .from('workout_template_exercises')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erreur suppression exercice programme:', error)
      return false
    }
    await fetchTemplates()
    return true
  }

  const startSessionFromTemplate = async (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (!template) return null

    // Créer la session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        date: new Date().toISOString().split('T')[0],
        template_id: templateId,
        notes: `Programme : ${template.name}`,
        completed: false,
        user_id: user?.id,
      })
      .select()
      .single()

    if (sessionError || !session) {
      console.error('Erreur création séance depuis programme:', sessionError)
      return null
    }

    // Ajouter les exercices du template à la session
    if (template.exercises && template.exercises.length > 0) {
      const sessionExercises = template.exercises.map((te) => ({
        session_id: session.id,
        exercise_id: te.exercise_id,
        order_index: te.order_index,
      }))

      const { data: insertedExercises, error: exError } = await supabase
        .from('session_exercises')
        .insert(sessionExercises)
        .select()

      if (exError) {
        console.error('Erreur ajout exercices à la séance:', exError)
      }

      // Pré-remplir les séries avec les valeurs par défaut du template
      if (insertedExercises) {
        const setsToInsert: Array<{
          session_exercise_id: string
          set_number: number
          reps: number | null
          weight_kg: number | null
          resistance_level: string | null
          rest_seconds: number | null
          completed: boolean
        }> = []

        for (const se of insertedExercises) {
          const templateEx = template.exercises.find((te) => te.exercise_id === se.exercise_id)
          if (!templateEx) continue

          for (let i = 1; i <= templateEx.default_sets; i++) {
            setsToInsert.push({
              session_exercise_id: se.id,
              set_number: i,
              reps: templateEx.default_reps,
              weight_kg: templateEx.default_weight_kg,
              resistance_level: templateEx.default_resistance_level,
              rest_seconds: templateEx.default_rest_seconds,
              completed: false,
            })
          }
        }

        if (setsToInsert.length > 0) {
          const { error: setsError } = await supabase
            .from('exercise_sets')
            .insert(setsToInsert)

          if (setsError) {
            console.error('Erreur pré-remplissage séries:', setsError)
          }
        }
      }
    }

    return session
  }

  return {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    addExerciseToTemplate,
    updateTemplateExercise,
    removeExerciseFromTemplate,
    startSessionFromTemplate,
    refetch: fetchTemplates,
  }
}
