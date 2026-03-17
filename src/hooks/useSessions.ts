import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Session, SessionExercise, ExerciseSet } from '../types'
import { useAuth } from './useAuth'

export function useSessions() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      console.error('Erreur chargement séances:', error)
    } else {
      setSessions(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const createSession = async (session: { date: string; notes?: string }) => {
    const { data, error } = await supabase
      .from('sessions')
      .insert({ ...session, completed: false, user_id: user?.id })
      .select()
      .single()

    if (error) {
      console.error('Erreur création séance:', error)
      return null
    }
    return data as Session
  }

  const completeSession = async (id: string, durationMinutes: number) => {
    const { error } = await supabase
      .from('sessions')
      .update({ completed: true, duration_minutes: durationMinutes })
      .eq('id', id)

    if (error) {
      console.error('Erreur complétion séance:', error)
      return false
    }
    await fetchSessions()
    return true
  }

  const deleteSession = async (id: string) => {
    const { error } = await supabase.from('sessions').delete().eq('id', id)
    if (error) {
      console.error('Erreur suppression séance:', error)
      return false
    }
    setSessions((prev) => prev.filter((s) => s.id !== id))
    return true
  }

  return { sessions, loading, createSession, completeSession, deleteSession, refetch: fetchSessions }
}

export function useSessionDetail(sessionId: string | undefined) {
  const [session, setSession] = useState<Session | null>(null)
  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDetail = useCallback(async () => {
    if (!sessionId) return
    setLoading(true)

    const [sessionRes, exercisesRes] = await Promise.all([
      supabase.from('sessions').select('*').eq('id', sessionId).single(),
      supabase
        .from('session_exercises')
        .select('*, exercise:exercises(*), sets:exercise_sets(*)')
        .eq('session_id', sessionId)
        .order('order_index'),
    ])

    if (sessionRes.error) {
      console.error('Erreur chargement séance:', sessionRes.error)
    } else {
      setSession(sessionRes.data)
    }

    if (exercisesRes.error) {
      console.error('Erreur chargement exercices séance:', exercisesRes.error)
    } else {
      setSessionExercises(exercisesRes.data ?? [])
    }
    setLoading(false)
  }, [sessionId])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  const addExerciseToSession = async (exerciseId: string) => {
    const orderIndex = sessionExercises.length
    const { data, error } = await supabase
      .from('session_exercises')
      .insert({ session_id: sessionId, exercise_id: exerciseId, order_index: orderIndex })
      .select('*, exercise:exercises(*)')
      .single()

    if (error) {
      console.error('Erreur ajout exercice à séance:', error)
      return null
    }

    const newEntry = { ...data, sets: [] }
    setSessionExercises((prev) => [...prev, newEntry])
    return newEntry
  }

  const addSet = async (sessionExerciseId: string) => {
    const currentExercise = sessionExercises.find((se) => se.id === sessionExerciseId)
    const setNumber = (currentExercise?.sets?.length ?? 0) + 1

    const { data, error } = await supabase
      .from('exercise_sets')
      .insert({
        session_exercise_id: sessionExerciseId,
        set_number: setNumber,
        completed: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Erreur ajout série:', error)
      return null
    }

    setSessionExercises((prev) =>
      prev.map((se) =>
        se.id === sessionExerciseId
          ? { ...se, sets: [...(se.sets ?? []), data] }
          : se
      )
    )
    return data as ExerciseSet
  }

  const updateSet = async (setId: string, updates: Partial<ExerciseSet>) => {
    const { error } = await supabase
      .from('exercise_sets')
      .update(updates)
      .eq('id', setId)

    if (error) {
      console.error('Erreur mise à jour série:', error)
      return false
    }

    setSessionExercises((prev) =>
      prev.map((se) => ({
        ...se,
        sets: se.sets?.map((s) => (s.id === setId ? { ...s, ...updates } : s)),
      }))
    )
    return true
  }

  const removeExerciseFromSession = async (sessionExerciseId: string) => {
    const { error } = await supabase
      .from('session_exercises')
      .delete()
      .eq('id', sessionExerciseId)

    if (error) {
      console.error('Erreur suppression exercice de séance:', error)
      return false
    }

    setSessionExercises((prev) => prev.filter((se) => se.id !== sessionExerciseId))
    return true
  }

  return {
    session,
    sessionExercises,
    loading,
    addExerciseToSession,
    addSet,
    updateSet,
    removeExerciseFromSession,
    refetch: fetchDetail,
  }
}
