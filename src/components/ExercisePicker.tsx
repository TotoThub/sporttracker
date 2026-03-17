import { useState } from 'react'
import { Exercise, MuscleGroup, MUSCLE_GROUP_LABELS, MUSCLE_GROUP_COLORS, EQUIPMENT_LABELS } from '../types'
import { Search, Dumbbell } from 'lucide-react'

interface ExercisePickerProps {
  exercises: Exercise[]
  onSelect: (exerciseId: string) => void
  emptyMessage?: string
}

export default function ExercisePicker({ exercises, onSelect, emptyMessage }: ExercisePickerProps) {
  const [search, setSearch] = useState('')
  const [filterMuscle, setFilterMuscle] = useState<MuscleGroup | ''>('')

  const filtered = exercises.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase())
    const matchMuscle = !filterMuscle || e.muscle_group === filterMuscle
    return matchSearch && matchMuscle
  })

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="!pl-10 !py-3 text-sm"
          autoFocus
        />
      </div>

      {/* Muscle group filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setFilterMuscle('')}
          className={`badge whitespace-nowrap text-[10px] transition-all ${!filterMuscle ? 'bg-primary-500/20 text-primary-300' : 'bg-white/5 text-slate-600'}`}
        >
          Tous
        </button>
        {(Object.keys(MUSCLE_GROUP_LABELS) as MuscleGroup[]).map((mg) => (
          <button
            key={mg}
            onClick={() => setFilterMuscle(mg === filterMuscle ? '' : mg)}
            className={`badge whitespace-nowrap text-[10px] transition-all ${mg === filterMuscle ? 'bg-primary-500/20 text-primary-300' : 'bg-white/5 text-slate-600'}`}
          >
            {MUSCLE_GROUP_LABELS[mg]}
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <p className="text-slate-500 text-center py-8 text-sm">
          {emptyMessage ?? 'Aucun exercice trouvé'}
        </p>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => onSelect(exercise.id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all text-left active:scale-[0.98]"
            >
              <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                <Dumbbell size={15} className="text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">{exercise.name}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`badge text-[9px] py-0.5 ${MUSCLE_GROUP_COLORS[exercise.muscle_group]}`}>
                    {MUSCLE_GROUP_LABELS[exercise.muscle_group]}
                  </span>
                  {exercise.equipment.slice(0, 2).map((eq) => (
                    <span key={eq} className="badge text-[9px] py-0.5 bg-white/[0.05] text-slate-600">
                      {EQUIPMENT_LABELS[eq]}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
