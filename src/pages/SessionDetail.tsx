import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSessionDetail, useSessions } from '../hooks/useSessions'
import { useExercises } from '../hooks/useExercises'
import SetRow from '../components/SetRow'
import Modal from '../components/Modal'
import ExercisePicker from '../components/ExercisePicker'
import { MUSCLE_GROUP_LABELS, MUSCLE_GROUP_COLORS } from '../types'
import { Plus, Check, Trash2, ChevronDown, ChevronUp, Timer } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    session, sessionExercises, loading,
    addExerciseToSession, addSet, updateSet, removeExerciseFromSession,
  } = useSessionDetail(id)
  const { completeSession } = useSessions()
  const { exercises } = useExercises()

  const [showAddExercise, setShowAddExercise] = useState(false)
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null)
  const [elapsedMinutes, setElapsedMinutes] = useState(0)

  useEffect(() => {
    if (!session || session.completed) return
    const start = new Date(session.created_at).getTime()
    const interval = setInterval(() => {
      setElapsedMinutes(Math.floor((Date.now() - start) / 60000))
    }, 10000)
    setElapsedMinutes(Math.floor((Date.now() - start) / 60000))
    return () => clearInterval(interval)
  }, [session])

  const handleComplete = async () => {
    if (!id) return
    if (confirm('Terminer cette séance ?')) {
      await completeSession(id, elapsedMinutes)
      navigate('/')
    }
  }

  const handleAddExercise = async (exerciseId: string) => {
    const result = await addExerciseToSession(exerciseId)
    if (result) {
      setShowAddExercise(false)
      setExpandedExercise(result.id)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return <p className="text-slate-500 text-center py-20">Séance introuvable</p>
  }

  const availableExercises = exercises.filter(
    (e) => !sessionExercises.some((se) => se.exercise_id === e.id)
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {format(parseISO(session.date), "EEEE d MMMM", { locale: fr })}
          </h1>
          {session.notes && <p className="text-sm text-slate-500 mt-1">{session.notes}</p>}
        </div>
        {!session.completed ? (
          <div className="flex items-center gap-2">
            <div className="badge bg-white/5 text-slate-400">
              <Timer size={14} className="mr-1.5" />
              {elapsedMinutes} min
            </div>
            <button onClick={handleComplete} className="btn-primary !py-2.5 !px-4">
              <Check size={18} />
            </button>
          </div>
        ) : (
          <span className="badge bg-green-500/15 text-green-400">
            Terminée — {session.duration_minutes} min
          </span>
        )}
      </div>

      {/* Exercices */}
      <div className="space-y-3">
        {sessionExercises.map((se) => {
          const isExpanded = expandedExercise === se.id
          const exercise = se.exercise
          if (!exercise) return null

          return (
            <div key={se.id} className="card">
              <button
                onClick={() => setExpandedExercise(isExpanded ? null : se.id)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className={`badge ${MUSCLE_GROUP_COLORS[exercise.muscle_group]}`}>
                    {MUSCLE_GROUP_LABELS[exercise.muscle_group]}
                  </span>
                  <span className="font-semibold text-white">{exercise.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">{se.sets?.length ?? 0} séries</span>
                  {isExpanded
                    ? <ChevronUp size={18} className="text-slate-500" />
                    : <ChevronDown size={18} className="text-slate-500" />
                  }
                </div>
              </button>

              {isExpanded && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-3 px-3 text-[10px] text-slate-600 uppercase tracking-wider">
                    <span className="w-8 text-center">#</span>
                    <span className="w-20 text-center">Poids</span>
                    <span className="w-4" />
                    <span className="w-20 text-center">Reps</span>
                    <span className="w-20 text-center">Résist.</span>
                    <span className="w-10" />
                  </div>

                  {se.sets?.map((set) => (
                    <SetRow
                      key={set.id}
                      set={set}
                      onUpdate={(updates) => updateSet(set.id, updates)}
                      onToggleComplete={() => updateSet(set.id, { completed: !set.completed })}
                    />
                  ))}

                  {!session.completed && (
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => addSet(se.id)} className="btn-secondary flex-1 !py-2.5 text-sm">
                        <Plus size={16} />
                        Ajouter une série
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Retirer cet exercice ?')) await removeExerciseFromSession(se.id)
                        }}
                        className="btn-danger !py-2.5 !px-3"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {!session.completed && (
        <button onClick={() => setShowAddExercise(true)} className="btn-secondary w-full mt-4">
          <Plus size={18} />
          Ajouter un exercice
        </button>
      )}

      <Modal open={showAddExercise} onClose={() => setShowAddExercise(false)} title="Ajouter un exercice">
        <ExercisePicker
          exercises={availableExercises}
          onSelect={handleAddExercise}
          emptyMessage="Aucun exercice disponible. Crée-en depuis l'onglet Exercices."
        />
      </Modal>
    </div>
  )
}
