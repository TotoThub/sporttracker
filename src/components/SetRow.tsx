import { ExerciseSet } from '../types'
import { Check, Circle } from 'lucide-react'

interface SetRowProps {
  set: ExerciseSet
  onUpdate: (updates: Partial<ExerciseSet>) => void
  onToggleComplete: () => void
}

export default function SetRow({ set, onUpdate, onToggleComplete }: SetRowProps) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
      set.completed ? 'bg-green-500/[0.07] ring-1 ring-green-500/20' : 'bg-white/[0.03]'
    }`}>
      <span className="text-sm font-mono text-slate-600 w-8 text-center">
        {set.set_number}
      </span>

      <input
        type="number"
        inputMode="numeric"
        placeholder="kg"
        value={set.weight_kg ?? ''}
        onChange={(e) => onUpdate({ weight_kg: e.target.value ? Number(e.target.value) : null })}
        className="!w-20 text-center text-sm !py-2 !px-2 !rounded-xl"
      />

      <span className="text-slate-700 text-xs">x</span>

      <input
        type="number"
        inputMode="numeric"
        placeholder="reps"
        value={set.reps ?? ''}
        onChange={(e) => onUpdate({ reps: e.target.value ? Number(e.target.value) : null })}
        className="!w-20 text-center text-sm !py-2 !px-2 !rounded-xl"
      />

      <input
        type="text"
        placeholder="resist."
        value={set.resistance_level ?? ''}
        onChange={(e) => onUpdate({ resistance_level: e.target.value || null })}
        className="!w-20 text-center text-sm !py-2 !px-2 !rounded-xl"
      />

      <button
        onClick={onToggleComplete}
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
          set.completed
            ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
            : 'bg-white/[0.05] text-slate-600 hover:bg-white/[0.1]'
        }`}
      >
        {set.completed ? <Check size={16} /> : <Circle size={16} />}
      </button>
    </div>
  )
}
