import { useState } from 'react'
import { useStats } from '../hooks/useStats'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import MiniChart from '../components/MiniChart'
import {
  MUSCLE_GROUP_LABELS,
  MUSCLE_GROUP_COLORS,
  MuscleGroup,
} from '../types'
import {
  TrendingUp, Trophy, Activity, BarChart3, Plus, Scale,
  ArrowUpRight, ArrowDownRight, Minus,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

type Tab = 'overview' | 'exercises' | 'body'

export default function Stats() {
  const {
    exerciseProgress, muscleGroupStats, weeklyVolume,
    bodyMeasurements, personalRecords, loading, addBodyMeasurement,
  } = useStats()

  const [tab, setTab] = useState<Tab>('overview')
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)
  const [showAddMeasurement, setShowAddMeasurement] = useState(false)

  // Measurement form
  const [mDate, setMDate] = useState(new Date().toISOString().split('T')[0])
  const [mWeight, setMWeight] = useState('')
  const [mFat, setMFat] = useState('')
  const [mNotes, setMNotes] = useState('')

  const handleAddMeasurement = async (e: React.FormEvent) => {
    e.preventDefault()
    await addBodyMeasurement({
      date: mDate,
      weight_kg: mWeight ? Number(mWeight) : undefined,
      body_fat_percent: mFat ? Number(mFat) : undefined,
      notes: mNotes || undefined,
    })
    setMWeight('')
    setMFat('')
    setMNotes('')
    setShowAddMeasurement(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: 'overview', label: 'Vue globale' },
    { key: 'exercises', label: 'Exercices' },
    { key: 'body', label: 'Corps' },
  ]

  // Compute trends
  const lastWeek = weeklyVolume[weeklyVolume.length - 1]
  const prevWeek = weeklyVolume[weeklyVolume.length - 2]
  const volumeTrend = lastWeek && prevWeek
    ? ((lastWeek.total_volume - prevWeek.total_volume) / (prevWeek.total_volume || 1)) * 100
    : 0

  const selectedProgress = exerciseProgress.find((ep) => ep.exercise_id === selectedExercise)

  return (
    <div>
      <PageHeader title="Statistiques" subtitle="Analyse ta progression" />

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/[0.04] rounded-2xl mb-6">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === key
                ? 'bg-white/[0.08] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="space-y-4">
          {/* Volume trend */}
          {weeklyVolume.length > 1 && (
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-400">Volume hebdo</h3>
                <div className={`flex items-center gap-1 text-sm font-semibold ${
                  volumeTrend > 0 ? 'text-green-400' : volumeTrend < 0 ? 'text-red-400' : 'text-slate-500'
                }`}>
                  {volumeTrend > 0 ? <ArrowUpRight size={16} /> : volumeTrend < 0 ? <ArrowDownRight size={16} /> : <Minus size={16} />}
                  {Math.abs(Math.round(volumeTrend))}%
                </div>
              </div>
              <MiniChart
                data={weeklyVolume.slice(-12).map((w) => w.total_volume)}
                height={80}
              />
              <div className="flex justify-between mt-2 text-[10px] text-slate-600">
                {weeklyVolume.length > 0 && (
                  <>
                    <span>{format(parseISO(weeklyVolume[Math.max(0, weeklyVolume.length - 12)].week), "d MMM", { locale: fr })}</span>
                    <span>{format(parseISO(weeklyVolume[weeklyVolume.length - 1].week), "d MMM", { locale: fr })}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Séances / semaine */}
          {weeklyVolume.length > 1 && (
            <div className="card">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Séances / semaine</h3>
              <MiniChart
                data={weeklyVolume.slice(-12).map((w) => w.session_count)}
                color="#22c55e"
                height={50}
              />
              <div className="flex items-center gap-2 mt-3">
                <Activity size={14} className="text-green-400" />
                <span className="text-sm text-slate-300">
                  Moyenne : {(weeklyVolume.reduce((s, w) => s + w.session_count, 0) / weeklyVolume.length).toFixed(1)} séances/sem
                </span>
              </div>
            </div>
          )}

          {/* Répartition musculaire */}
          {muscleGroupStats.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-medium text-slate-400 mb-4">Répartition musculaire</h3>
              <div className="space-y-2.5">
                {muscleGroupStats.map((mg) => {
                  const maxSets = muscleGroupStats[0].total_sets
                  const percent = (mg.total_sets / maxSets) * 100
                  const mgKey = mg.muscle_group as MuscleGroup

                  return (
                    <div key={mg.muscle_group}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`badge text-[10px] ${MUSCLE_GROUP_COLORS[mgKey] ?? 'bg-white/5 text-slate-500'}`}>
                          {MUSCLE_GROUP_LABELS[mgKey] ?? mg.muscle_group}
                        </span>
                        <span className="text-xs text-slate-500">{mg.total_sets} séries</span>
                      </div>
                      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all bg-primary-500/60"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Records personnels */}
          {personalRecords.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Trophy size={16} className="text-yellow-500" />
                <h3 className="text-sm font-medium text-slate-400">Records personnels</h3>
              </div>
              <div className="space-y-2">
                {personalRecords.slice(0, 8).map((pr) => (
                  <div key={pr.exercise_name} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-white">{pr.exercise_name}</p>
                      <p className="text-xs text-slate-500">{format(parseISO(pr.date), "d MMM yyyy", { locale: fr })}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary-400">{pr.max_weight} kg</p>
                      <p className="text-xs text-slate-500">{pr.max_reps} reps</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {weeklyVolume.length === 0 && (
            <div className="card text-center py-12">
              <BarChart3 size={32} className="text-slate-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-300 mb-1">Pas encore de données</h3>
              <p className="text-sm text-slate-600">Complète des séances pour voir tes stats apparaître ici</p>
            </div>
          )}
        </div>
      )}

      {/* Exercises Tab */}
      {tab === 'exercises' && (
        <div className="space-y-3">
          {exerciseProgress.length === 0 ? (
            <div className="card text-center py-12">
              <TrendingUp size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Complète des séances pour voir ta progression par exercice</p>
            </div>
          ) : selectedProgress ? (
            // Detail view
            <div>
              <button
                onClick={() => setSelectedExercise(null)}
                className="text-sm text-primary-400 mb-4 flex items-center gap-1"
              >
                ← Retour
              </button>
              <div className="card mb-4">
                <h3 className="font-bold text-white text-lg mb-1">{selectedProgress.exercise_name}</h3>
                <span className={`badge text-[10px] ${MUSCLE_GROUP_COLORS[selectedProgress.muscle_group as MuscleGroup] ?? ''}`}>
                  {MUSCLE_GROUP_LABELS[selectedProgress.muscle_group as MuscleGroup] ?? selectedProgress.muscle_group}
                </span>
              </div>

              {/* Weight progression */}
              {selectedProgress.history.some((h) => h.max_weight && h.max_weight > 0) && (
                <div className="card mb-3">
                  <h4 className="text-sm font-medium text-slate-400 mb-3">Progression poids (kg)</h4>
                  <MiniChart
                    data={selectedProgress.history.filter((h) => h.max_weight).map((h) => h.max_weight!)}
                    height={80}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-slate-500">
                      Début : {selectedProgress.history.find((h) => h.max_weight)?.max_weight} kg
                    </span>
                    <span className="text-xs font-semibold text-primary-400">
                      Actuel : {selectedProgress.history.filter((h) => h.max_weight).slice(-1)[0]?.max_weight} kg
                    </span>
                  </div>
                </div>
              )}

              {/* Volume progression */}
              <div className="card mb-3">
                <h4 className="text-sm font-medium text-slate-400 mb-3">Volume total</h4>
                <MiniChart
                  data={selectedProgress.history.map((h) => h.total_volume)}
                  color="#22c55e"
                  height={80}
                />
              </div>

              {/* History table */}
              <div className="card">
                <h4 className="text-sm font-medium text-slate-400 mb-3">Historique</h4>
                <div className="space-y-1.5">
                  {selectedProgress.history.slice().reverse().map((h, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0 text-sm">
                      <span className="text-slate-500">{format(parseISO(h.date), "d MMM yy", { locale: fr })}</span>
                      <div className="flex items-center gap-4 text-right">
                        {h.max_weight && <span className="text-white">{h.max_weight}kg</span>}
                        {h.max_reps && <span className="text-slate-400">{h.max_reps}r</span>}
                        {h.resistance_level && <span className="text-slate-400">{h.resistance_level}</span>}
                        <span className="text-slate-600 text-xs">{h.total_sets}s</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Exercise list
            exerciseProgress.map((ep) => {
              const lastEntry = ep.history[ep.history.length - 1]
              const firstEntry = ep.history[0]
              const weightGain = lastEntry?.max_weight && firstEntry?.max_weight
                ? lastEntry.max_weight - firstEntry.max_weight
                : null

              return (
                <button
                  key={ep.exercise_id}
                  onClick={() => setSelectedExercise(ep.exercise_id)}
                  className="card w-full text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-white truncate">{ep.exercise_name}</p>
                        <span className={`badge text-[9px] py-0.5 ${MUSCLE_GROUP_COLORS[ep.muscle_group as MuscleGroup] ?? ''}`}>
                          {MUSCLE_GROUP_LABELS[ep.muscle_group as MuscleGroup] ?? ep.muscle_group}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{ep.history.length} séance{ep.history.length > 1 ? 's' : ''}</span>
                        {lastEntry?.max_weight && <span>Max: {lastEntry.max_weight}kg</span>}
                        {lastEntry?.resistance_level && <span>{lastEntry.resistance_level}</span>}
                      </div>
                    </div>
                    {weightGain !== null && weightGain !== 0 && (
                      <div className={`flex items-center gap-0.5 text-sm font-semibold ${
                        weightGain > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {weightGain > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(weightGain)}kg
                      </div>
                    )}
                  </div>
                  {ep.history.length >= 2 && (
                    <div className="mt-2">
                      <MiniChart
                        data={ep.history.map((h) => h.max_weight ?? h.total_volume)}
                        height={35}
                      />
                    </div>
                  )}
                </button>
              )
            })
          )}
        </div>
      )}

      {/* Body Tab */}
      {tab === 'body' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowAddMeasurement(true)} className="btn-primary !py-2.5 !px-4">
              <Plus size={16} />
              Mesure
            </button>
          </div>

          {bodyMeasurements.length === 0 ? (
            <div className="card text-center py-12">
              <Scale size={32} className="text-slate-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-300 mb-1">Aucune mesure</h3>
              <p className="text-sm text-slate-600">Enregistre ton poids et ta masse grasse pour suivre ton évolution</p>
            </div>
          ) : (
            <>
              {/* Weight chart */}
              {bodyMeasurements.some((m) => m.weight_kg) && (
                <div className="card">
                  <h3 className="text-sm font-medium text-slate-400 mb-3">Poids (kg)</h3>
                  <MiniChart
                    data={bodyMeasurements.filter((m) => m.weight_kg).map((m) => m.weight_kg!)}
                    height={80}
                    color="#f59e0b"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-slate-500">
                      {bodyMeasurements.filter((m) => m.weight_kg)[0]?.weight_kg} kg
                    </span>
                    <span className="text-xs font-semibold text-amber-400">
                      {bodyMeasurements.filter((m) => m.weight_kg).slice(-1)[0]?.weight_kg} kg
                    </span>
                  </div>
                </div>
              )}

              {/* Body fat chart */}
              {bodyMeasurements.some((m) => m.body_fat_percent) && (
                <div className="card">
                  <h3 className="text-sm font-medium text-slate-400 mb-3">Masse grasse (%)</h3>
                  <MiniChart
                    data={bodyMeasurements.filter((m) => m.body_fat_percent).map((m) => m.body_fat_percent!)}
                    height={80}
                    color="#ef4444"
                  />
                </div>
              )}

              {/* Measurement history */}
              <div className="card">
                <h3 className="text-sm font-medium text-slate-400 mb-3">Historique</h3>
                <div className="space-y-1.5">
                  {bodyMeasurements.slice().reverse().map((m) => (
                    <div key={m.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                      <span className="text-sm text-slate-500">{format(parseISO(m.date), "d MMM yyyy", { locale: fr })}</span>
                      <div className="flex items-center gap-4 text-sm">
                        {m.weight_kg && <span className="text-amber-400">{m.weight_kg} kg</span>}
                        {m.body_fat_percent && <span className="text-red-400">{m.body_fat_percent}%</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Add measurement modal */}
          <Modal open={showAddMeasurement} onClose={() => setShowAddMeasurement(false)} title="Nouvelle mesure">
            <form onSubmit={handleAddMeasurement} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-400 mb-2 block">Date</label>
                <input type="date" value={mDate} onChange={(e) => setMDate(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-400 mb-2 block">Poids (kg)</label>
                  <input type="number" inputMode="decimal" step="0.1" value={mWeight} onChange={(e) => setMWeight(e.target.value)} placeholder="75.5" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400 mb-2 block">Masse grasse (%)</label>
                  <input type="number" inputMode="decimal" step="0.1" value={mFat} onChange={(e) => setMFat(e.target.value)} placeholder="15.0" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400 mb-2 block">Notes</label>
                <textarea value={mNotes} onChange={(e) => setMNotes(e.target.value)} placeholder="Observations..." rows={2} className="resize-none" />
              </div>
              <button type="submit" className="btn-primary w-full">Enregistrer</button>
            </form>
          </Modal>
        </div>
      )}
    </div>
  )
}
