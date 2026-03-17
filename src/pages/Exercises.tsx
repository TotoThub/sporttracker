import { useState } from 'react'
import { useExercises } from '../hooks/useExercises'
import PageHeader from '../components/PageHeader'
import ExerciseCard from '../components/ExerciseCard'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import {
  MuscleGroup,
  Equipment,
  MUSCLE_GROUP_LABELS,
  EQUIPMENT_LABELS,
} from '../types'
import { Plus, Dumbbell, Search, Trash2 } from 'lucide-react'

export default function Exercises() {
  const { exercises, loading, addExercise, deleteExercise } = useExercises()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filterMuscle, setFilterMuscle] = useState<MuscleGroup | ''>('')

  const [name, setName] = useState('')
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>('chest')
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [description, setDescription] = useState('')

  const filteredExercises = exercises.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase())
    const matchesMuscle = !filterMuscle || e.muscle_group === filterMuscle
    return matchesSearch && matchesMuscle
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    await addExercise({
      name: name.trim(),
      muscle_group: muscleGroup,
      equipment,
      description: description.trim() || undefined,
    })
    setName('')
    setEquipment([])
    setDescription('')
    setShowForm(false)
  }

  const toggleEquipment = (eq: Equipment) => {
    setEquipment((prev) => prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq])
  }

  const handleDelete = async (id: string, exerciseName: string) => {
    if (confirm(`Supprimer "${exerciseName}" ?`)) {
      await deleteExercise(id)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Exercices"
        subtitle={`${exercises.length} exercice${exercises.length > 1 ? 's' : ''}`}
        action={
          <button onClick={() => setShowForm(true)} className="btn-primary !py-2.5 !px-4">
            <Plus size={18} />
          </button>
        }
      />

      <div className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Rechercher un exercice..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="!pl-11"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        <button
          onClick={() => setFilterMuscle('')}
          className={`badge whitespace-nowrap transition-all ${!filterMuscle ? 'bg-primary-500/20 text-primary-300' : 'bg-white/5 text-slate-500'}`}
        >
          Tous
        </button>
        {(Object.keys(MUSCLE_GROUP_LABELS) as MuscleGroup[]).map((mg) => (
          <button
            key={mg}
            onClick={() => setFilterMuscle(mg === filterMuscle ? '' : mg)}
            className={`badge whitespace-nowrap transition-all ${mg === filterMuscle ? 'bg-primary-500/20 text-primary-300' : 'bg-white/5 text-slate-500'}`}
          >
            {MUSCLE_GROUP_LABELS[mg]}
          </button>
        ))}
      </div>

      {filteredExercises.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="Aucun exercice"
          description={search ? 'Aucun résultat pour cette recherche' : 'Ajoute ton premier exercice pour commencer'}
          action={!search ? { label: 'Ajouter un exercice', onClick: () => setShowForm(true) } : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {filteredExercises.map((exercise) => (
            <div key={exercise.id} className="relative group">
              <ExerciseCard exercise={exercise} />
              <button
                onClick={() => handleDelete(exercise.id, exercise.name)}
                className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center
                           opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} className="text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nouvel exercice">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">Nom</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Développé couché"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">Groupe musculaire</label>
            <select value={muscleGroup} onChange={(e) => setMuscleGroup(e.target.value as MuscleGroup)}>
              {(Object.keys(MUSCLE_GROUP_LABELS) as MuscleGroup[]).map((mg) => (
                <option key={mg} value={mg}>{MUSCLE_GROUP_LABELS[mg]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">Équipement</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(EQUIPMENT_LABELS) as Equipment[]).map((eq) => (
                <button
                  key={eq}
                  type="button"
                  onClick={() => toggleEquipment(eq)}
                  className={`badge text-sm py-2 px-3.5 transition-all ${
                    equipment.includes(eq)
                      ? 'bg-primary-500/20 text-primary-300 ring-1 ring-primary-500/30'
                      : 'bg-white/5 text-slate-500'
                  }`}
                >
                  {EQUIPMENT_LABELS[eq]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">Description (optionnel)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes, conseils d'exécution..."
              rows={3}
              className="resize-none"
            />
          </div>

          <button type="submit" className="btn-primary w-full mt-2">
            Ajouter l'exercice
          </button>
        </form>
      </Modal>
    </div>
  )
}
