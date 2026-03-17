import { Exercise, MUSCLE_GROUP_LABELS, EQUIPMENT_LABELS, MUSCLE_GROUP_COLORS } from '../types'
import { Dumbbell } from 'lucide-react'

interface ExerciseCardProps {
  exercise: Exercise
  onClick?: () => void
  selected?: boolean
}

export default function ExerciseCard({ exercise, onClick, selected }: ExerciseCardProps) {
  return (
    <button
      onClick={onClick}
      className={`card w-full text-left transition-all ${
        selected ? 'ring-2 ring-primary-500 border-primary-500/30' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center flex-shrink-0">
          <Dumbbell size={18} className="text-slate-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{exercise.name}</h3>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className={`badge ${MUSCLE_GROUP_COLORS[exercise.muscle_group]}`}>
              {MUSCLE_GROUP_LABELS[exercise.muscle_group]}
            </span>
            {exercise.equipment.map((eq) => (
              <span key={eq} className="badge bg-white/[0.05] text-slate-500">
                {EQUIPMENT_LABELS[eq]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  )
}
