import { useState } from 'react'
import { useGoals } from '../hooks/useGoals'
import { useExercises } from '../hooks/useExercises'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import { GlobalGoalType, GLOBAL_GOAL_LABELS } from '../types'
import { Target, Plus, Trash2, Trophy, TrendingUp, Globe, Dumbbell } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

const TARGET_TYPE_LABELS = {
  weight: 'Poids (kg)',
  reps: 'Répétitions',
  sets: 'Séries',
}

type GoalFormType = 'exercise' | 'global'

export default function Goals() {
  const { goals, loading, addExerciseGoal, addGlobalGoal, updateGoal, deleteGoal } = useGoals()
  const { exercises } = useExercises()
  const [showForm, setShowForm] = useState(false)
  const [showAchieved, setShowAchieved] = useState(false)
  const [formType, setFormType] = useState<GoalFormType>('exercise')

  // Exercise goal form
  const [exerciseId, setExerciseId] = useState('')
  const [targetType, setTargetType] = useState<'weight' | 'reps' | 'sets'>('weight')
  const [targetValue, setTargetValue] = useState('')
  const [currentValue, setCurrentValue] = useState('')
  const [targetDate, setTargetDate] = useState('')

  // Global goal form
  const [globalType, setGlobalType] = useState<GlobalGoalType>('body_weight')
  const [globalLabel, setGlobalLabel] = useState('')

  const activeGoals = goals.filter((g) => !g.achieved)
  const achievedGoals = goals.filter((g) => g.achieved)
  const exerciseGoals = activeGoals.filter((g) => g.goal_scope === 'exercise')
  const globalGoals = activeGoals.filter((g) => g.goal_scope === 'global')

  const resetForm = () => {
    setExerciseId('')
    setTargetValue('')
    setCurrentValue('')
    setTargetDate('')
    setGlobalLabel('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetValue) return

    if (formType === 'exercise') {
      if (!exerciseId) return
      await addExerciseGoal({
        exercise_id: exerciseId,
        target_type: targetType,
        target_value: Number(targetValue),
        current_value: currentValue ? Number(currentValue) : 0,
        target_date: targetDate || undefined,
      })
    } else {
      await addGlobalGoal({
        global_type: globalType,
        global_label: globalType === 'custom' ? globalLabel : undefined,
        target_type: targetType,
        target_value: Number(targetValue),
        current_value: currentValue ? Number(currentValue) : 0,
        target_date: targetDate || undefined,
      })
    }

    resetForm()
    setShowForm(false)
  }

  const handleProgressUpdate = async (goalId: string, newValue: string) => {
    const val = Number(newValue)
    if (!isNaN(val)) await updateGoal(goalId, { current_value: val })
  }

  const getGoalTitle = (goal: typeof goals[0]) => {
    if (goal.goal_scope === 'global') {
      if (goal.global_type === 'custom' && goal.global_label) return goal.global_label
      return GLOBAL_GOAL_LABELS[goal.global_type as GlobalGoalType] ?? 'Objectif'
    }
    return goal.exercise?.name ?? 'Exercice'
  }

  const getGoalIcon = (goal: typeof goals[0]) => {
    return goal.goal_scope === 'global' ? Globe : Dumbbell
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const renderGoalCard = (goal: typeof goals[0]) => {
    const progress = goal.target_value > 0
      ? Math.min(100, (goal.current_value / goal.target_value) * 100)
      : 0
    const Icon = getGoalIcon(goal)

    return (
      <div key={goal.id} className="card">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              goal.goal_scope === 'global' ? 'bg-amber-500/15' : 'bg-primary-500/15'
            }`}>
              <Icon size={16} className={goal.goal_scope === 'global' ? 'text-amber-400' : 'text-primary-400'} />
            </div>
            <div>
              <h3 className="font-semibold text-white">{getGoalTitle(goal)}</h3>
              <p className="text-sm text-slate-500">
                {TARGET_TYPE_LABELS[goal.target_type]} — Objectif : {goal.target_value}
              </p>
              {goal.target_date && (
                <p className="text-xs text-slate-600 mt-0.5">
                  Échéance : {format(parseISO(goal.target_date), "d MMM yyyy", { locale: fr })}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => { if (confirm('Supprimer cet objectif ?')) deleteGoal(goal.id) }}
            className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0"
          >
            <Trash2 size={14} className="text-red-400" />
          </button>
        </div>

        <div className="relative h-2.5 bg-white/[0.05] rounded-full overflow-hidden mb-3">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: goal.goal_scope === 'global'
                ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                : 'linear-gradient(90deg, #0ea5e9, #38bdf8)',
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className={goal.goal_scope === 'global' ? 'text-amber-400' : 'text-primary-400'} />
            <input
              type="number"
              inputMode="numeric"
              value={goal.current_value}
              onChange={(e) => handleProgressUpdate(goal.id, e.target.value)}
              className="!w-20 text-center text-sm !py-2 !px-2"
            />
            <span className="text-sm text-slate-500">/ {goal.target_value}</span>
          </div>
          <span className={`text-sm font-semibold ${goal.goal_scope === 'global' ? 'text-amber-400' : 'text-primary-400'}`}>
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Objectifs"
        subtitle={`${activeGoals.length} actif${activeGoals.length > 1 ? 's' : ''}`}
        action={
          <button onClick={() => setShowForm(true)} className="btn-primary !py-2.5 !px-4">
            <Plus size={18} />
          </button>
        }
      />

      {activeGoals.length === 0 && achievedGoals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Aucun objectif"
          description="Fixe-toi des objectifs pour suivre ta progression"
          action={{ label: 'Créer un objectif', onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="space-y-5">
          {/* Global goals */}
          {globalGoals.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Globe size={12} />
                Objectifs globaux
              </h2>
              <div className="space-y-3">{globalGoals.map(renderGoalCard)}</div>
            </div>
          )}

          {/* Exercise goals */}
          {exerciseGoals.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Dumbbell size={12} />
                Objectifs exercices
              </h2>
              <div className="space-y-3">{exerciseGoals.map(renderGoalCard)}</div>
            </div>
          )}

          {/* Achieved */}
          {achievedGoals.length > 0 && (
            <div>
              <button
                onClick={() => setShowAchieved(!showAchieved)}
                className="flex items-center gap-2 text-sm text-slate-500 mb-3"
              >
                <Trophy size={16} className="text-yellow-500" />
                {achievedGoals.length} objectif{achievedGoals.length > 1 ? 's' : ''} atteint{achievedGoals.length > 1 ? 's' : ''}
              </button>
              {showAchieved && (
                <div className="space-y-2">
                  {achievedGoals.map((goal) => (
                    <div key={goal.id} className="card opacity-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-white">{getGoalTitle(goal)}</h3>
                          <p className="text-sm text-slate-500">
                            {TARGET_TYPE_LABELS[goal.target_type]} : {goal.target_value}
                            {goal.achieved_at && ` — ${format(parseISO(goal.achieved_at), "d MMM yyyy", { locale: fr })}`}
                          </p>
                        </div>
                        <Trophy size={18} className="text-yellow-500" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add goal modal */}
      <Modal open={showForm} onClose={() => { setShowForm(false); resetForm() }} title="Nouvel objectif">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type toggle */}
          <div className="flex gap-1 p-1 bg-white/[0.04] rounded-2xl">
            <button
              type="button"
              onClick={() => setFormType('exercise')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                formType === 'exercise' ? 'bg-white/[0.08] text-white' : 'text-slate-500'
              }`}
            >
              <Dumbbell size={14} />
              Exercice
            </button>
            <button
              type="button"
              onClick={() => setFormType('global')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                formType === 'global' ? 'bg-white/[0.08] text-white' : 'text-slate-500'
              }`}
            >
              <Globe size={14} />
              Global
            </button>
          </div>

          {formType === 'exercise' ? (
            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">Exercice</label>
              <select value={exerciseId} onChange={(e) => setExerciseId(e.target.value)} required>
                <option value="">Sélectionner un exercice</option>
                {exercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium text-slate-400 mb-2 block">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(GLOBAL_GOAL_LABELS) as GlobalGoalType[]).map((gt) => (
                    <button
                      key={gt}
                      type="button"
                      onClick={() => setGlobalType(gt)}
                      className={`badge justify-center py-2.5 px-3 transition-all ${
                        globalType === gt ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30' : 'bg-white/5 text-slate-500'
                      }`}
                    >
                      {GLOBAL_GOAL_LABELS[gt]}
                    </button>
                  ))}
                </div>
              </div>
              {globalType === 'custom' && (
                <div>
                  <label className="text-sm font-medium text-slate-400 mb-2 block">Nom de l'objectif</label>
                  <input
                    type="text"
                    value={globalLabel}
                    onChange={(e) => setGlobalLabel(e.target.value)}
                    placeholder="ex: Tour de bras, endurance..."
                    required
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">Unité de mesure</label>
            <div className="flex gap-2">
              {(Object.keys(TARGET_TYPE_LABELS) as Array<'weight' | 'reps' | 'sets'>).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTargetType(t)}
                  className={`badge flex-1 justify-center py-2.5 transition-all ${
                    targetType === t ? 'bg-primary-500/20 text-primary-300 ring-1 ring-primary-500/30' : 'bg-white/5 text-slate-500'
                  }`}
                >
                  {TARGET_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">Valeur actuelle</label>
              <input type="number" inputMode="numeric" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">Objectif</label>
              <input type="number" inputMode="numeric" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} placeholder="ex: 80" required />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">Date cible (optionnel)</label>
            <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          </div>

          <button type="submit" className="btn-primary w-full mt-2">
            Créer l'objectif
          </button>
        </form>
      </Modal>
    </div>
  )
}
